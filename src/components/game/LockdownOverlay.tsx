import { useEffect, useMemo, useState } from "react";
import { Gift, LockKeyhole, Skull } from "lucide-react";
import { sound } from "@/lib/game/sound";

type Stage = "encrypting" | "reward" | "leaving";

/**
 * Ransomware "trap" cinematic. Smashing the boss is a mistake: the screen gets
 * fully encrypted (deliberately menacing for the big BOE display), then trolls
 * the player with a "you won a prize" reveal that turns out to be a thank-you
 * from HQG, before the run ends and the summary is shown.
 *
 * Timeline (after the ~1s 3D shatter that plays in the arena first):
 *   0.0s  encrypting  — "TOÀN BỘ DỮ LIỆU ĐÃ BỊ MÃ HÓA"
 *   4.0s  reward      — gift reveal (5s), then the HQG thank-you line (4s)
 *  13.0s  leaving     — fade out → onDone (summary screen)
 */
export function LockdownOverlay({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("encrypting");

  useEffect(() => {
    // The cinematic carries its own audio, so silence the background music.
    sound.stopMusic();
    const toReward = window.setTimeout(() => {
      setStage("reward");
      sound.reward();
    }, 4000);
    const toThanks = window.setTimeout(() => sound.thanks(), 9000);
    const toLeaving = window.setTimeout(() => setStage("leaving"), 13000);
    const finish = window.setTimeout(onDone, 13450);
    return () => {
      window.clearTimeout(toReward);
      window.clearTimeout(toThanks);
      window.clearTimeout(toLeaving);
      window.clearTimeout(finish);
    };
  }, [onDone]);

  const cells = useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.9,
        char: Math.random() > 0.45 ? "🔒" : Math.random() > 0.5 ? "1" : "0",
      })),
    [],
  );

  const encrypting = stage === "encrypting";

  return (
    <div
      className={`lockdown-overlay pointer-events-none fixed inset-0 z-[60] flex items-center justify-center overflow-hidden ${
        stage === "leaving" ? "lockdown-leaving" : ""
      } ${encrypting ? "lockdown-shake" : ""}`}
    >
      <div className="absolute inset-0 bg-[oklch(0.06_0.03_25/0.96)] backdrop-blur-sm" />

      <div className="lockdown-grid absolute inset-0 grid grid-cols-[repeat(12,1fr)] gap-0 opacity-70">
        {cells.map((cell) => (
          <span
            key={cell.id}
            className="lockdown-cell flex items-center justify-center text-lg sm:text-2xl"
            style={{ animationDelay: `${cell.delay}s` }}
          >
            {cell.char}
          </span>
        ))}
      </div>

      {encrypting ? (
        <>
          <div className="lockdown-vignette absolute inset-0" />
          <div className="lockdown-sweep absolute inset-x-0 h-1/3" />
        </>
      ) : null}

      <div className="relative px-5 text-center">
        {encrypting ? (
          <div className="lockdown-core">
            <div className="flex items-center justify-center gap-4">
              <Skull className="lockdown-glitch h-16 w-16 text-[var(--neon-red)] sm:h-20 sm:w-20" />
              <LockKeyhole className="h-24 w-24 text-[var(--neon-red)] sm:h-32 sm:w-32" />
              <Skull className="lockdown-glitch h-16 w-16 text-[var(--neon-red)] sm:h-20 sm:w-20" />
            </div>
            <h2 className="lockdown-glitch mx-auto mt-5 max-w-4xl text-3xl font-black uppercase leading-tight tracking-[0.12em] text-[var(--neon-red)] sm:text-6xl">
              Toàn bộ dữ liệu đã bị mã hóa
            </h2>
            <p className="mt-3 text-base font-bold uppercase tracking-[0.28em] text-[var(--neon-purple)] sm:text-xl">
              Bạn vừa kích hoạt ransomware
            </p>
            <div className="mx-auto mt-5 max-w-xl rounded-xl border border-[var(--neon-red)]/50 bg-black/55 p-4 text-sm font-semibold leading-6 text-[var(--neon-red)]/90 sm:text-base">
              Mọi tập tin, bản sao lưu và dữ liệu khách hàng đã bị khóa. Hệ thống ngừng hoạt động.
              Đây là lý do KHÔNG bao giờ bấm vào thứ đáng ngờ.
            </div>
            <div className="mx-auto mt-6 h-2.5 w-72 max-w-[80vw] overflow-hidden rounded-full bg-black/60 sm:w-96">
              <div className="lockdown-progress h-full rounded-full bg-gradient-to-r from-[var(--neon-red)] via-[var(--neon-purple)] to-[var(--neon-red)]" />
            </div>
          </div>
        ) : (
          <div className="lockdown-resolve">
            <Gift className="gift-pop mx-auto h-24 w-24 text-[var(--neon-yellow)] sm:h-32 sm:w-32" />
            <h2 className="mt-5 text-4xl font-black tracking-[0.08em] neon-text-yellow sm:text-7xl">
              🎉 CHÚC MỪNG! 🎉
            </h2>
            <p className="mt-4 text-lg font-bold text-foreground sm:text-2xl">
              Bạn vừa nhận được một phần quà đặc biệt...
            </p>
            <p className="lockdown-thanks mt-3 text-xl font-black neon-text-cyan sm:text-3xl">
              ...đó là một lời cảm ơn chân thành từ HQG 💙
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
