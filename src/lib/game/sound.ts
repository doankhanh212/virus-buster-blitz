/**
 * Procedural audio engine for the game. Every sound is synthesised with the Web
 * Audio API at runtime — there are no audio files to ship, so it works on any
 * static host (e.g. Vercel) with no licensing or asset-loading concerns.
 *
 * Browsers block audio until a user gesture, so the context is created lazily
 * and resumed on the first pointer/keyboard interaction.
 */

type MusicTrack = "menu" | "battle";
type Wave = OscillatorType;

const MUTE_KEY = "dvct-muted";

// --- Note frequencies (Hz) ---------------------------------------------------
const A2 = 110, C3 = 130.81, D3 = 146.83, E3 = 164.81;
const A3 = 220, C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392;
const A4 = 440, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;
const C6 = 1046.5;

// Battle arpeggio (Am – C – Dm – Em), one step per 16th note.
const BATTLE_ARP = [
  A3, E4, A4, E4, C4, G4, C5, G4, D4, A4, D5, A4, E4, B4, E5, B4,
];
const BATTLE_BASS = [A2, C3, D3, E3];

// Calm ambient pad chords for the menus.
const MENU_CHORDS: number[][] = [
  [A3, C4, E4],
  [F4, A3, C4],
  [C4, E4, G4],
  [G4, B4, D5],
];

class SoundEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicGain?: GainNode;
  private sfxGain?: GainNode;
  private muted = false;
  private unlocked = false;

  private musicTrack: MusicTrack | null = null;
  private musicTimer?: number;
  private step = 0;

  private listeners = new Set<(muted: boolean) => void>();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.muted = window.localStorage.getItem(MUTE_KEY) === "1";
      } catch {
        // ignore
      }
    }
  }

  // --- lifecycle -------------------------------------------------------------
  private ensureCtx() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.85;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.42;
      this.musicGain.connect(this.master);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.95;
      this.sfxGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.installUnlock();
  }

  private installUnlock() {
    if (this.unlocked || typeof window === "undefined") return;
    this.unlocked = true;
    const resume = () => void this.ctx?.resume();
    ["pointerdown", "keydown", "touchstart"].forEach((evt) =>
      window.addEventListener(evt, resume, { passive: true }),
    );
  }

  ensure() {
    this.ensureCtx();
  }

  // --- mute ------------------------------------------------------------------
  isMuted() {
    return this.muted;
  }

  onMuteChange(cb: (muted: boolean) => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
      // ignore
    }
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.03);
    }
    this.listeners.forEach((cb) => cb(muted));
  }

  toggleMute() {
    this.ensureCtx();
    this.setMuted(!this.muted);
    return this.muted;
  }

  // --- low-level synth --------------------------------------------------------
  private play(
    target: GainNode | undefined,
    freq: number,
    dur: number,
    type: Wave,
    peak: number,
    slideTo?: number,
    delay = 0,
  ) {
    const ctx = this.ctx;
    if (!ctx || !target || this.muted) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(target);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  private noise(
    target: GainNode | undefined,
    dur: number,
    peak: number,
    filter: BiquadFilterType,
    freq: number,
    delay = 0,
  ) {
    const ctx = this.ctx;
    if (!ctx || !target || this.muted) return;
    const t = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filt = ctx.createBiquadFilter();
    filt.type = filter;
    filt.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt).connect(g).connect(target);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  // --- SFX -------------------------------------------------------------------
  hit() {
    this.ensureCtx();
    this.noise(this.sfxGain, 0.07, 0.45, "lowpass", 1900);
    this.play(this.sfxGain, 240, 0.12, "square", 0.22, 80);
    this.play(this.sfxGain, 880, 0.05, "triangle", 0.12);
  }

  wrongHit() {
    this.ensureCtx();
    this.play(this.sfxGain, 160, 0.24, "sawtooth", 0.22, 105);
    this.play(this.sfxGain, 150, 0.24, "square", 0.16);
    this.noise(this.sfxGain, 0.12, 0.18, "bandpass", 300);
  }

  combo(level: number) {
    this.ensureCtx();
    const seq = [C5, E5, G5, C6];
    const n = level >= 20 ? 4 : 3;
    for (let i = 0; i < n; i++) this.play(this.sfxGain, seq[i], 0.13, "triangle", 0.2, undefined, i * 0.06);
  }

  miss() {
    this.ensureCtx();
    this.play(this.sfxGain, 320, 0.28, "sine", 0.2, 90);
    this.play(this.sfxGain, 110, 0.2, "sawtooth", 0.14);
  }

  bossSpawn() {
    this.ensureCtx();
    this.play(this.sfxGain, 440, 0.18, "sawtooth", 0.16, undefined, 0);
    this.play(this.sfxGain, 330, 0.18, "sawtooth", 0.16, undefined, 0.18);
    this.play(this.sfxGain, 440, 0.18, "sawtooth", 0.16, undefined, 0.36);
    this.play(this.sfxGain, 70, 0.6, "sine", 0.2);
  }

  lockdown() {
    this.ensureCtx();
    this.play(this.sfxGain, 600, 1.3, "sawtooth", 0.26, 55);
    this.play(this.sfxGain, 48, 1.5, "sine", 0.32);
    this.noise(this.sfxGain, 0.9, 0.3, "lowpass", 700);
    for (let i = 0; i < 6; i++) this.noise(this.sfxGain, 0.04, 0.16, "highpass", 3200, 0.1 + i * 0.13);
  }

  reward() {
    this.ensureCtx();
    const seq = [C5, E5, G5, C6];
    seq.forEach((f, i) => this.play(this.sfxGain, f, 0.3, "triangle", 0.22, undefined, i * 0.13));
    this.play(this.sfxGain, 1568, 0.45, "sine", 0.12, undefined, 0.55);
  }

  thanks() {
    this.ensureCtx();
    [C4, E4, G4].forEach((f) => this.play(this.sfxGain, f, 1.3, "sine", 0.14));
  }

  gameStart() {
    this.ensureCtx();
    this.play(this.sfxGain, 200, 0.4, "sawtooth", 0.2, 760);
    this.play(this.sfxGain, 660, 0.16, "triangle", 0.16, undefined, 0.3);
  }

  gameOver(win: boolean) {
    this.ensureCtx();
    if (win) {
      const seq = [C5, E5, G5, C6];
      seq.forEach((f, i) => this.play(this.sfxGain, f, 0.34, "triangle", 0.22, undefined, i * 0.12));
    } else {
      const seq = [E4, D4, C4, A2];
      seq.forEach((f, i) => this.play(this.sfxGain, f, 0.4, "sawtooth", 0.2, undefined, i * 0.16));
    }
  }

  uiClick() {
    this.ensureCtx();
    this.play(this.sfxGain, 680, 0.05, "square", 0.12);
  }

  // --- music -----------------------------------------------------------------
  startMusic(track: MusicTrack) {
    this.ensureCtx();
    if (typeof window === "undefined") return;
    if (this.musicTrack === track && this.musicTimer) return;
    this.stopMusic();
    this.musicTrack = track;
    this.step = 0;
    const stepMs = track === "battle" ? 130 : 340;
    this.musicTimer = window.setInterval(() => this.musicTick(), stepMs);
  }

  stopMusic() {
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
    this.musicTrack = null;
  }

  private musicTick() {
    if (this.muted || !this.ctx || this.ctx.state !== "running") {
      this.step++;
      return;
    }
    const s = this.step % 16;
    if (this.musicTrack === "battle") {
      this.play(this.musicGain, BATTLE_ARP[s], 0.16, "triangle", 0.2);
      if (s % 4 === 0) this.play(this.musicGain, BATTLE_BASS[(s / 4) % 4], 0.26, "sawtooth", 0.18);
      if (s % 2 === 1) this.noise(this.musicGain, 0.025, 0.05, "highpass", 6000);
    } else if (this.musicTrack === "menu") {
      if (s % 4 === 0) {
        const chord = MENU_CHORDS[(s / 4) % 4];
        chord.forEach((f) => this.play(this.musicGain, f, 1.5, "sine", 0.09));
      }
    }
    this.step++;
  }
}

export const sound = new SoundEngine();
