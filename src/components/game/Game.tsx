import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HUD } from "./HUD";
import { GameIcon } from "./icon";
import {
  BOSS,
  BOSS_LINES,
  CORRECT_LINES,
  DANGEROUS,
  INITIAL_STATS,
  ROUNDS,
  SAFE,
  WRONG_LINES,
  type GameStats,
  type ObjectDef,
  type Player,
  type RoundConfig,
} from "@/lib/game/types";
import { Play, Pause, ChevronRight, Trophy, Skull } from "lucide-react";

interface SpawnedObj {
  uid: string;
  def: ObjectDef;
  x: number; // %
  y: number; // %
  born: number;
  lifetime: number;
  hp?: number;
  exiting?: boolean;
}

interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

type Phase = "intro" | "playing" | "paused" | "between" | "ended";

export interface EndResult {
  stats: GameStats;
  qualifiesPrize: boolean;
}

const colorMap = {
  red: { glow: "var(--neon-red)", border: "neon-text-red", chip: "from-[oklch(0.4_0.2_25)] to-[oklch(0.25_0.1_25)]" },
  green: { glow: "var(--neon-green)", border: "neon-text-green", chip: "from-[oklch(0.4_0.18_145)] to-[oklch(0.25_0.1_145)]" },
  cyan: { glow: "var(--neon-cyan)", border: "neon-text-cyan", chip: "from-[oklch(0.4_0.15_200)] to-[oklch(0.25_0.1_200)]" },
  purple: { glow: "var(--neon-purple)", border: "neon-text-purple", chip: "from-[oklch(0.4_0.2_305)] to-[oklch(0.25_0.1_305)]" },
  yellow: { glow: "var(--neon-yellow)", border: "neon-text-yellow", chip: "from-[oklch(0.4_0.18_95)] to-[oklch(0.25_0.1_95)]" },
} as const;

const BOSS_MAX_HP = 4;

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function Game({ player, onEnd, onExit }: { player: Player; onEnd: (r: EndResult) => void; onExit: () => void }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [timeLeft, setTimeLeft] = useState(ROUNDS[0].duration);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [objects, setObjects] = useState<SpawnedObj[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [shake, setShake] = useState(false);
  const [bossActiveOnScreen, setBossActiveOnScreen] = useState<SpawnedObj | null>(null);

  // round-scoped stats for final boss qualification
  const roundStatsRef = useRef({ correct: 0, totalClicks: 0, safeHits: 0, maxCombo: 0 });

  const arenaRef = useRef<HTMLDivElement>(null);
  const round = ROUNDS[roundIdx];

  const accuracy = useMemo(() => {
    const total = stats.totalClicks;
    if (total === 0) return 100;
    return Math.round((stats.correctHits / total) * 100);
  }, [stats.totalClicks, stats.correctHits]);

  // popup helper
  const popupSeq = useRef(0);
  const addPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = ++popupSeq.current;
    setPopups((p) => [...p, { id, x, y, text, color }]);
    setTimeout(() => setPopups((p) => p.filter((q) => q.id !== id)), 950);
  }, []);

  // mutate stats with combo bonus
  const applyCombo = useCallback((s: GameStats, newCombo: number): GameStats => {
    let bonus = 0;
    if (newCombo === 20) bonus = 50;
    else if (newCombo === 10) bonus = 25;
    else if (newCombo === 5) bonus = 10;
    return {
      ...s,
      combo: newCombo,
      maxCombo: Math.max(s.maxCombo, newCombo),
      score: s.score + bonus,
    };
  }, []);

  // === Click handler ===
  const handleClick = useCallback((obj: SpawnedObj, ev: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "playing") return;
    const rect = arenaRef.current?.getBoundingClientRect();
    let cx = 50, cy = 50;
    if (rect) {
      const clientX = "touches" in ev ? (ev.touches[0]?.clientX ?? ev.changedTouches?.[0]?.clientX ?? 0) : ev.clientX;
      const clientY = "touches" in ev ? (ev.touches[0]?.clientY ?? ev.changedTouches?.[0]?.clientY ?? 0) : ev.clientY;
      cx = ((clientX - rect.left) / rect.width) * 100;
      cy = ((clientY - rect.top) / rect.height) * 100;
    }

    if (obj.exiting) return;

    if (obj.def.kind === "boss") {
      // multi-hit
      setObjects((arr) => arr.map((o) => o.uid === obj.uid ? { ...o, hp: (o.hp ?? BOSS_MAX_HP) - 1 } : o));
      const remaining = (obj.hp ?? BOSS_MAX_HP) - 1;
      if (remaining <= 0) {
        // boss defeated
        setObjects((arr) => arr.map((o) => o.uid === obj.uid ? { ...o, exiting: true } : o));
        setTimeout(() => setObjects((arr) => arr.filter((o) => o.uid !== obj.uid)), 400);
        setBossActiveOnScreen(null);
        addPopup(cx, cy, "+25 BOSS HẠ!", "var(--neon-yellow)");
        setStats((s) => {
          const newCombo = s.combo + 1;
          const upd = applyCombo({
            ...s,
            score: s.score + 25,
            correctHits: s.correctHits + 1,
            totalClicks: s.totalClicks + 1,
            hits: s.hits + 1,
            bossDefeats: s.bossDefeats + 1,
          }, newCombo);
          roundStatsRef.current.correct++;
          roundStatsRef.current.totalClicks++;
          roundStatsRef.current.maxCombo = Math.max(roundStatsRef.current.maxCombo, newCombo);
          return upd;
        });
      } else {
        addPopup(cx, cy, `BOSS HP ${remaining}/${BOSS_MAX_HP}`, "var(--neon-red)");
        setStats((s) => ({ ...s, totalClicks: s.totalClicks + 1, correctHits: s.correctHits + 1 }));
        roundStatsRef.current.totalClicks++;
        roundStatsRef.current.correct++;
      }
      return;
    }

    if (obj.def.kind === "danger") {
      setObjects((arr) => arr.map((o) => o.uid === obj.uid ? { ...o, exiting: true } : o));
      setTimeout(() => setObjects((arr) => arr.filter((o) => o.uid !== obj.uid)), 400);
      addPopup(cx, cy, "+10 " + rnd(CORRECT_LINES), "var(--neon-green)");
      setStats((s) => {
        const newCombo = s.combo + 1;
        const upd = applyCombo({
          ...s,
          score: s.score + 10,
          correctHits: s.correctHits + 1,
          totalClicks: s.totalClicks + 1,
          hits: s.hits + 1,
          dataLocked: Math.max(0, s.dataLocked - 1),
        }, newCombo);
        roundStatsRef.current.correct++;
        roundStatsRef.current.totalClicks++;
        roundStatsRef.current.maxCombo = Math.max(roundStatsRef.current.maxCombo, newCombo);
        return upd;
      });
    } else {
      // safe
      setObjects((arr) => arr.map((o) => o.uid === obj.uid ? { ...o, exiting: true } : o));
      setTimeout(() => setObjects((arr) => arr.filter((o) => o.uid !== obj.uid)), 400);
      addPopup(cx, cy, "-15 " + rnd(WRONG_LINES), "var(--neon-red)");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setStats((s) => {
        const next = { ...s, score: Math.max(0, s.score - 15), combo: 0, totalClicks: s.totalClicks + 1, misses: s.misses + 1 };
        if (obj.def.id === "backup") next.backupHealth = Math.max(0, s.backupHealth - 12);
        if (obj.def.id === "customer") next.customerTrust = Math.max(0, s.customerTrust - 12);
        if (obj.def.id === "cleandb") next.backupHealth = Math.max(0, s.backupHealth - 8);
        return next;
      });
      roundStatsRef.current.totalClicks++;
      roundStatsRef.current.safeHits++;
    }
  }, [phase, addPopup, applyCombo]);

  // Click on empty arena → no-op (no penalty), but visual ripple? skip.

  // === Spawner ===
  useEffect(() => {
    if (phase !== "playing") return;
    let cancelled = false;
    let bossSpawnedThisRound = !round.bossActive;

    const spawn = () => {
      if (cancelled) return;
      setObjects((curr) => {
        if (curr.length > 8) return curr;
        const isSafe = Math.random() < round.safeRatio;
        let def: ObjectDef;
        let isBoss = false;
        if (round.bossActive && !bossSpawnedThisRound && Math.random() < 0.35 && !curr.some((o) => o.def.kind === "boss")) {
          def = BOSS;
          isBoss = true;
        } else if (round.bossActive && Math.random() < 0.15 && !curr.some((o) => o.def.kind === "boss")) {
          def = BOSS;
          isBoss = true;
        } else {
          def = isSafe ? rnd(SAFE) : rnd(DANGEROUS);
        }
        const x = 8 + Math.random() * 84;
        const y = 10 + Math.random() * 78;
        const obj: SpawnedObj = {
          uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          def,
          x, y,
          born: Date.now(),
          lifetime: isBoss ? round.lifetimeMs + 800 : round.lifetimeMs,
          hp: isBoss ? BOSS_MAX_HP : undefined,
        };
        if (isBoss) {
          bossSpawnedThisRound = true;
          // allow next boss spawn after delay
          setTimeout(() => { bossSpawnedThisRound = false; }, 4000);
          setBossActiveOnScreen(obj);
        }
        return [...curr, obj];
      });
    };

    const id = setInterval(spawn, round.spawnMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [phase, round]);

  // === Expiry sweeper ===
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      const now = Date.now();
      setObjects((curr) => {
        const expired = curr.filter((o) => !o.exiting && now - o.born > o.lifetime);
        if (expired.length === 0) return curr;
        // penalize missed dangers (not boss, not safe)
        let dangerMissed = 0;
        for (const o of expired) {
          if (o.def.kind === "danger") dangerMissed++;
          if (o.def.kind === "boss") setBossActiveOnScreen(null);
        }
        if (dangerMissed > 0) {
          setStats((s) => ({
            ...s,
            score: Math.max(0, s.score - 5 * dangerMissed),
            dataLocked: Math.min(100, s.dataLocked + 4 * dangerMissed),
            misses: s.misses + dangerMissed,
          }));
        }
        return curr.filter((o) => now - o.born <= o.lifetime);
      });
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  // === Timer ===
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          endRound();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx]);

  const endRound = useCallback(() => {
    setObjects([]);
    setBossActiveOnScreen(null);
    // capture final round metrics for boss qualification
    if (round.bossActive) {
      const r = roundStatsRef.current;
      const acc = r.totalClicks > 0 ? Math.round((r.correct / r.totalClicks) * 100) : 0;
      setStats((s) => ({
        ...s,
        finalRoundAccuracy: acc,
        finalRoundMaxCombo: r.maxCombo,
        finalRoundSafeHits: r.safeHits,
      }));
    }
    const next = roundIdx + 1;
    if (next >= ROUNDS.length) {
      setPhase("ended");
    } else {
      setPhase("between");
    }
  }, [roundIdx, round.bossActive]);

  // when ended, emit result
  useEffect(() => {
    if (phase !== "ended") return;
    const qualifies =
      stats.finalRoundAccuracy >= 95 &&
      stats.finalRoundSafeHits === 0 &&
      stats.finalRoundMaxCombo >= 20 &&
      stats.bossDefeats >= 3 &&
      stats.backupHealth >= 80 &&
      stats.customerTrust >= 80;
    onEnd({ stats, qualifiesPrize: qualifies });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startRound = () => {
    roundStatsRef.current = { correct: 0, totalClicks: 0, safeHits: 0, maxCombo: 0 };
    setTimeLeft(round.duration);
    setPhase("playing");
  };

  const goNextRound = () => {
    setRoundIdx((i) => i + 1);
    setPhase("intro");
  };

  useEffect(() => {
    setTimeLeft(round.duration);
  }, [round]);

  return (
    <div className={`relative min-h-screen cyber-grid p-3 sm:p-5 ${shake ? "shake" : ""}`}>
      <HUD
        playerName={player.name}
        score={stats.score}
        combo={stats.combo}
        accuracy={accuracy}
        dataLocked={stats.dataLocked}
        backupHealth={stats.backupHealth}
        customerTrust={stats.customerTrust}
        timeLeft={timeLeft}
      />

      {/* Arena */}
      <div
        ref={arenaRef}
        className="relative mt-4 h-[60vh] min-h-[420px] w-full overflow-hidden rounded-2xl glass-panel neon-border-cyan"
        onClick={(e) => {
          if (phase !== "playing") return;
          // arena background click (missed)
          if ((e.target as HTMLElement).dataset.arena === "bg") {
            // no penalty for empty click; keep combo as-is to be forgiving
          }
        }}
      >
        <div data-arena="bg" className="absolute inset-0" />

        {/* combo overlay */}
        {stats.combo >= 5 && phase === "playing" && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-center">
            <div className="neon-text-yellow text-3xl sm:text-5xl font-black tracking-wider pulse-glow">
              COMBO x{stats.combo}
            </div>
            {stats.combo >= 10 && (
              <div className="mt-1 text-xs sm:text-sm neon-text-green">
                PHÒNG IT ĐANG TIN BẠN HƠN
              </div>
            )}
          </div>
        )}

        {/* boss hp bar */}
        {bossActiveOnScreen && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 sm:top-20 w-64">
            <div className="text-center text-xs font-bold neon-text-red mb-1 flex items-center justify-center gap-1">
              <Skull className="h-4 w-4" /> RANSOMWARE BOSS
            </div>
            <div className="h-2.5 rounded-full bg-black/60 overflow-hidden border border-[var(--neon-red)]/50">
              <div
                className="h-full transition-all"
                style={{
                  width: `${((bossActiveOnScreen.hp ?? BOSS_MAX_HP) / BOSS_MAX_HP) * 100}%`,
                  background: "var(--neon-red)",
                  boxShadow: "0 0 12px var(--neon-red)",
                }}
              />
            </div>
          </div>
        )}

        {/* Objects */}
        {objects.map((o) => {
          const c = colorMap[o.def.color];
          const isBoss = o.def.kind === "boss";
          const size = isBoss ? 130 : 88;
          return (
            <button
              key={o.uid}
              onClick={(e) => { e.stopPropagation(); handleClick(o, e); }}
              onTouchStart={(e) => { e.stopPropagation(); }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 select-none ${o.exiting ? "explode" : "pop-in"}`}
              style={{ left: `${o.x}%`, top: `${o.y}%`, width: size, height: size }}
            >
              <div
                className={`relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${c.chip} pulse-glow`}
                style={{ boxShadow: `0 0 24px ${c.glow}, inset 0 0 20px ${c.glow}40`, color: c.glow }}
              >
                <GameIcon name={o.def.icon} className={isBoss ? "h-16 w-16" : "h-10 w-10"} />
                <div className="mt-1 px-1 text-center text-[10px] sm:text-xs font-bold leading-tight text-white drop-shadow">
                  {o.def.label}
                </div>
              </div>
            </button>
          );
        })}

        {/* Floating popups */}
        {popups.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute float-up text-sm sm:text-base font-extrabold whitespace-nowrap"
            style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.color, textShadow: `0 0 8px ${p.color}` }}
          >
            {p.text}
          </div>
        ))}

        {/* Intro / Pause / Between overlays */}
        {(phase === "intro" || phase === "paused" || phase === "between") && (
          <div className="absolute inset-0 flex items-center justify-center bg-[oklch(0.1_0.03_265/0.85)] backdrop-blur-sm p-4">
            <div className="glass-panel neon-border-cyan max-w-xl rounded-2xl p-6 sm:p-8 text-center">
              {phase === "between" ? (
                <BetweenPanel
                  finishedRound={ROUNDS[roundIdx]}
                  nextRound={ROUNDS[roundIdx + 1]}
                  onNext={goNextRound}
                />
              ) : (
                <IntroPanel round={round} onStart={startRound} resumed={phase === "paused"} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Vòng {round.id}/{ROUNDS.length}</span>
          <span className="text-sm font-bold neon-text-cyan">{round.title}</span>
        </div>
        <div className="flex gap-2">
          {phase === "playing" && (
            <Button variant="outline" size="sm" onClick={() => setPhase("paused")}>
              <Pause className="mr-1 h-4 w-4" /> Tạm dừng
            </Button>
          )}
          {phase === "paused" && (
            <Button size="sm" onClick={() => setPhase("playing")}>
              <Play className="mr-1 h-4 w-4" /> Tiếp tục
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onExit}>Thoát</Button>
        </div>
      </div>
    </div>
  );
}

function IntroPanel({ round, onStart, resumed }: { round: RoundConfig; onStart: () => void; resumed?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]">Vòng {round.id}</div>
      <h2 className="mt-2 text-3xl sm:text-4xl font-black neon-text-cyan">{round.title}</h2>
      <p className="mt-3 text-base text-foreground/90">{round.intro}</p>
      {round.bossActive && (
        <div className="mt-4 rounded-xl bg-[oklch(0.25_0.1_25/0.4)] p-4 text-left text-sm">
          <div className="font-bold neon-text-yellow mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Điều kiện giành iPhone 17 Pro Max
          </div>
          <ul className="space-y-1 text-foreground/90">
            <li>• Chính xác ≥ 95% trong vòng cuối</li>
            <li>• Không đập trúng bất kỳ vật bảo vệ nào</li>
            <li>• Đạt combo ≥ 20</li>
            <li>• Hạ Ransomware Boss ≥ 3 lần</li>
            <li>• Backup ≥ 80% & Niềm tin khách hàng ≥ 80%</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Rất khó nhưng hoàn toàn công bằng. Giải đặc biệt theo thể lệ công khai của BTC.
          </p>
        </div>
      )}
      <Button
        onClick={onStart}
        className="mt-6 h-12 px-8 text-lg font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.15_0.04_265)]"
      >
        <Play className="mr-2 h-5 w-5" /> {resumed ? "Tiếp tục" : "Bắt đầu"}
      </Button>
    </div>
  );
}

function BetweenPanel({ finishedRound, nextRound, onNext }: { finishedRound: RoundConfig; nextRound: RoundConfig; onNext: () => void }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.3em] text-[var(--neon-green)]">Hoàn tất</div>
      <h2 className="mt-2 text-2xl sm:text-3xl font-black neon-text-green">{finishedRound.title}</h2>
      <p className="mt-3 text-foreground/90">{rnd(BOSS_LINES.concat(CORRECT_LINES))}</p>
      <div className="mt-5 rounded-xl bg-[oklch(0.25_0.1_200/0.3)] p-4 text-left">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Vòng tiếp theo</div>
        <div className="mt-1 text-lg font-bold neon-text-cyan">{nextRound.title}</div>
        <div className="mt-1 text-sm text-foreground/80">{nextRound.intro}</div>
      </div>
      <Button
        onClick={onNext}
        className="mt-6 h-12 px-8 text-lg font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white"
      >
        Sang vòng kế tiếp <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}