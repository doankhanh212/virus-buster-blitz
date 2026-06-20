import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HUD } from "./HUD";
import { GameIcon } from "./icon";
import {
  CORRECT_LINES,
  DANGEROUS,
  INITIAL_STATS,
  RANDOM_LINES,
  ROUNDS,
  SAFE,
  WRONG_BACKUP_LINES,
  WRONG_CUSTOMER_LINES,
  WRONG_DEFENSE_LINES,
  WRONG_LINES,
  type GameStats,
  type ObjectDef,
  type Player,
  type RoundConfig,
} from "@/lib/game/types";
import { Hammer, Pause, Play } from "lucide-react";

interface SpawnedObj {
  uid: string;
  def: ObjectDef;
  x: number;
  y: number;
  born: number;
  lifetime: number;
  exiting?: boolean;
}

interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

type Phase = "intro" | "playing" | "paused" | "ended";

export interface EndResult {
  stats: GameStats;
}

const DIFFICULTY_STEPS = [
  { label: "Cơ bản", spawnMs: 900, lifetimeMs: 1800, safeRatio: 0.25, maxObjects: 7 },
  { label: "Nhanh hơn", spawnMs: 650, lifetimeMs: 1450, safeRatio: 0.35, maxObjects: 8 },
  { label: "Căng thẳng", spawnMs: 460, lifetimeMs: 1100, safeRatio: 0.45, maxObjects: 10 },
] as const;

const colorMap = {
  red: {
    glow: "var(--neon-red)",
    chip: "from-[oklch(0.4_0.2_25)] to-[oklch(0.23_0.1_25)]",
  },
  green: {
    glow: "var(--neon-green)",
    chip: "from-[oklch(0.38_0.18_145)] to-[oklch(0.22_0.1_145)]",
  },
  cyan: {
    glow: "var(--neon-cyan)",
    chip: "from-[oklch(0.38_0.15_200)] to-[oklch(0.22_0.1_200)]",
  },
  purple: {
    glow: "var(--neon-purple)",
    chip: "from-[oklch(0.38_0.2_305)] to-[oklch(0.22_0.1_305)]",
  },
  yellow: {
    glow: "var(--neon-yellow)",
    chip: "from-[oklch(0.42_0.18_95)] to-[oklch(0.25_0.1_95)]",
  },
} as const;

function rnd<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clampMetric(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function Game({
  player,
  onEnd,
  onExit,
}: {
  player: Player;
  onEnd: (result: EndResult) => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [timeLeft, setTimeLeft] = useState(ROUNDS[0].duration);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [objects, setObjects] = useState<SpawnedObj[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [shake, setShake] = useState(false);
  const [hammer, setHammer] = useState({ visible: false, bonk: false, touch: false });

  const statsRef = useRef(stats);
  const popupSeq = useRef(0);
  const roundStatsRef = useRef({ correct: 0, totalClicks: 0, safeHits: 0, maxCombo: 0 });
  const arenaRef = useRef<HTMLDivElement>(null);
  const hammerRef = useRef<HTMLDivElement>(null);
  const hammerFrame = useRef<number | null>(null);
  const pendingHammerPoint = useRef({ x: -120, y: -120 });
  const round = ROUNDS[0];

  const accuracy = useMemo(() => {
    if (stats.totalClicks === 0) return 100;
    return Math.round((stats.correctHits / stats.totalClicks) * 100);
  }, [stats.correctHits, stats.totalClicks]);
  const difficultyStage = Math.min(
    DIFFICULTY_STEPS.length - 1,
    Math.floor((round.duration - timeLeft) / 10),
  );
  const difficulty = DIFFICULTY_STEPS[difficultyStage];

  const updateStats = useCallback((updater: (current: GameStats) => GameStats) => {
    setStats((current) => {
      const next = updater(current);
      statsRef.current = next;
      return next;
    });
  }, []);

  const addPopup = useCallback((x: number, y: number, text: string, color: string) => {
    const id = ++popupSeq.current;
    setPopups((current) => [...current, { id, x, y, text, color }]);
    window.setTimeout(
      () => setPopups((current) => current.filter((popup) => popup.id !== id)),
      950,
    );
  }, []);

  const applyCombo = useCallback(
    (current: GameStats, combo: number) => {
      let bonus = 0;
      if (combo === 5) bonus = 10;
      if (combo === 10) bonus = 25;
      if (combo === 20) bonus = 50;
      if (bonus > 0) {
        window.setTimeout(
          () => addPopup(50, 14, `Combo x${combo}! +${bonus}`, "var(--neon-yellow)"),
          0,
        );
      }
      return {
        ...current,
        combo,
        maxCombo: Math.max(current.maxCombo, combo),
        score: current.score + bonus,
      };
    },
    [addPopup],
  );

  const clickPoint = (event: React.MouseEvent | React.TouchEvent) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    const point = "touches" in event ? (event.changedTouches?.[0] ?? event.touches?.[0]) : event;
    const clientX = point?.clientX ?? rect.left + rect.width / 2;
    const clientY = point?.clientY ?? rect.top + rect.height / 2;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const moveHammer = useCallback((clientX: number, clientY: number) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;

    pendingHammerPoint.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    if (hammerFrame.current !== null) return;

    hammerFrame.current = window.requestAnimationFrame(() => {
      hammerFrame.current = null;
      const { x, y } = pendingHammerPoint.current;
      if (hammerRef.current) {
        hammerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-1.25rem, -1.25rem)`;
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (hammerFrame.current !== null) {
        window.cancelAnimationFrame(hammerFrame.current);
      }
    };
  }, []);

  const removeObject = (uid: string) => {
    setObjects((current) =>
      current.map((item) => (item.uid === uid ? { ...item, exiting: true } : item)),
    );
    window.setTimeout(
      () => setObjects((current) => current.filter((item) => item.uid !== uid)),
      360,
    );
  };

  const handleSafeHit = useCallback(
    (obj: SpawnedObj, x: number, y: number) => {
      const line =
        obj.def.id === "backup"
          ? rnd(WRONG_BACKUP_LINES)
          : obj.def.id === "customer"
            ? rnd(WRONG_CUSTOMER_LINES)
            : rnd(WRONG_DEFENSE_LINES.concat(WRONG_LINES));

      addPopup(x, y, `-15 ${line}`, "var(--neon-red)");
      setShake(true);
      window.setTimeout(() => setShake(false), 360);

      updateStats((current) => {
        const backupHits = current.backupHits + (obj.def.id === "backup" ? 1 : 0);
        const next: GameStats = {
          ...current,
          score: Math.max(0, current.score - 15),
          combo: 0,
          totalClicks: current.totalClicks + 1,
          misses: current.misses + 1,
          backupHits,
        };

        if (obj.def.id === "backup") next.backupHealth = clampMetric(current.backupHealth - 12);
        if (obj.def.id === "customer") next.customerTrust = clampMetric(current.customerTrust - 12);
        if (obj.def.id === "cleandb") next.backupHealth = clampMetric(current.backupHealth - 8);
        if (["mfa", "firewall", "shield", "itteam", "safesys"].includes(obj.def.id)) {
          next.customerTrust = clampMetric(current.customerTrust - 4);
        }

        if (backupHits === 2) {
          window.setTimeout(() => {
            addPopup(
              50,
              50,
              "Backup bay màu. Giờ cả công ty chỉ còn hy vọng và file Excel tên 'Dữ liệu tạm thời'.",
              "var(--neon-yellow)",
            );
          }, 40);
        }

        return next;
      });

      roundStatsRef.current.totalClicks += 1;
      roundStatsRef.current.safeHits += 1;
    },
    [addPopup, updateStats],
  );

  const handleClick = useCallback(
    (obj: SpawnedObj, event: React.MouseEvent | React.TouchEvent) => {
      if (phase !== "playing" || obj.exiting) return;
      const { x, y } = clickPoint(event);

      setHammer((current) => ({ ...current, bonk: true }));
      window.setTimeout(() => setHammer((current) => ({ ...current, bonk: false })), 150);

      removeObject(obj.uid);

      if (obj.def.kind === "danger") {
        addPopup(x, y, `+10 ${rnd(CORRECT_LINES)}`, "var(--neon-green)");
        updateStats((current) => {
          const combo = current.combo + 1;
          const next = applyCombo(
            {
              ...current,
              score: current.score + 10,
              correctHits: current.correctHits + 1,
              totalClicks: current.totalClicks + 1,
              hits: current.hits + 1,
              dataLocked: clampMetric(current.dataLocked - 1),
            },
            combo,
          );
          roundStatsRef.current.correct += 1;
          roundStatsRef.current.totalClicks += 1;
          roundStatsRef.current.maxCombo = Math.max(roundStatsRef.current.maxCombo, combo);
          return next;
        });
      } else {
        handleSafeHit(obj, x, y);
      }
    },
    [applyCombo, handleSafeHit, phase, updateStats, addPopup],
  );

  const completeRound = useCallback(() => {
    setObjects([]);
    const roundStats = roundStatsRef.current;
    const finalAccuracy =
      roundStats.totalClicks > 0
        ? Math.round((roundStats.correct / roundStats.totalClicks) * 100)
        : 0;
    const finalStats = {
      ...statsRef.current,
      finalRoundAccuracy: finalAccuracy,
      finalRoundMaxCombo: roundStats.maxCombo,
      finalRoundSafeHits: roundStats.safeHits,
    };

    statsRef.current = finalStats;
    setStats(finalStats);
    setPhase("ended");
    onEnd({ stats: finalStats });
  }, [onEnd]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(id);
          completeRound();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [completeRound, phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      setObjects((current) => {
        if (current.length >= difficulty.maxObjects) return current;
        const now = Date.now();
        const isSafe = Math.random() < difficulty.safeRatio;
        const def = isSafe ? rnd(SAFE) : rnd(DANGEROUS);
        return [
          ...current,
          {
            uid: `${now}-${Math.random().toString(36).slice(2, 8)}`,
            def,
            x: 8 + Math.random() * 84,
            y: 12 + Math.random() * 74,
            born: now,
            lifetime: difficulty.lifetimeMs,
          },
        ];
      });
    }, difficulty.spawnMs);

    return () => window.clearInterval(id);
  }, [difficulty, phase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      const now = Date.now();
      setObjects((current) => {
        const expired = current.filter((item) => !item.exiting && now - item.born > item.lifetime);
        if (expired.length === 0) return current;
        const missed = expired.filter((item) => item.def.kind === "danger").length;
        if (missed > 0) {
          updateStats((stat) => ({
            ...stat,
            score: Math.max(0, stat.score - 5 * missed),
            dataLocked: clampMetric(stat.dataLocked + 4 * missed),
            misses: stat.misses + missed,
            combo: 0,
          }));
          addPopup(50, 18, `-${5 * missed} Mối nguy lọt lưới!`, "var(--neon-red)");
        }
        return current.filter((item) => now - item.born <= item.lifetime);
      });
    }, 180);
    return () => window.clearInterval(id);
  }, [addPopup, phase, updateStats]);

  const startRound = () => {
    roundStatsRef.current = { correct: 0, totalClicks: 0, safeHits: 0, maxCombo: 0 };
    setTimeLeft(round.duration);
    setObjects([]);
    setPhase("playing");
  };

  useEffect(() => {
    setTimeLeft(round.duration);
  }, [round.duration]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.35) addPopup(50, 85, rnd(RANDOM_LINES), "var(--neon-cyan)");
    }, 5500);
    return () => window.clearInterval(id);
  }, [addPopup, phase]);

  const legendaryHammer = difficultyStage >= 2 || stats.combo >= 10;

  return (
    <main className={`relative min-h-screen cyber-grid p-3 sm:p-5 ${shake ? "shake" : ""}`}>
      <HUD
        playerName={player.name}
        score={stats.score}
        combo={stats.combo}
        accuracy={accuracy}
        dataLocked={stats.dataLocked}
        backupHealth={stats.backupHealth}
        customerTrust={stats.customerTrust}
        timeLeft={timeLeft}
        difficultyLabel={difficulty.label}
      />

      <div
        ref={arenaRef}
        onMouseEnter={(event) => {
          moveHammer(event.clientX, event.clientY);
          setHammer((current) => ({ ...current, visible: true }));
        }}
        onMouseLeave={() => setHammer((current) => ({ ...current, visible: false }))}
        onMouseMove={(event) => {
          moveHammer(event.clientX, event.clientY);
          setHammer((current) => (current.visible ? current : { ...current, visible: true }));
        }}
        onTouchStart={() => setHammer((current) => ({ ...current, touch: true, visible: false }))}
        className={`relative mt-4 h-[62vh] min-h-[430px] w-full overflow-hidden rounded-2xl glass-panel neon-border-cyan ${hammer.touch ? "" : "cursor-none"}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,oklch(0.45_0.16_200/0.18),transparent_36%)]" />

        {stats.combo >= 5 && phase === "playing" ? (
          <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 text-center">
            <div className="neon-text-yellow pulse-glow text-3xl font-black tracking-wider sm:text-5xl">
              COMBO x{stats.combo}
            </div>
            {stats.combo >= 10 ? (
              <div className="mt-1 text-sm font-bold neon-text-green">
                Phòng IT đang xem bạn như siêu anh hùng.
              </div>
            ) : null}
          </div>
        ) : null}

        {objects.map((item) => {
          const color = colorMap[item.def.color];
          const size = 92;
          return (
            <button
              key={item.uid}
              onClick={(event) => {
                event.stopPropagation();
                handleClick(item, event);
              }}
              onTouchStart={(event) => event.stopPropagation()}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 select-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--neon-cyan)] ${item.exiting ? "explode" : "pop-in"}`}
              style={{ left: `${item.x}%`, top: `${item.y}%`, width: size, height: size }}
              aria-label={item.def.label}
            >
              <span
                className={`relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${color.chip} pulse-glow`}
                style={{
                  color: color.glow,
                  boxShadow: `0 0 24px ${color.glow}, inset 0 0 20px ${color.glow}40`,
                }}
              >
                <GameIcon name={item.def.icon} className="h-10 w-10" />
                <span className="mt-1 px-1 text-center text-[10px] font-black leading-tight text-white drop-shadow sm:text-xs">
                  {item.def.label}
                </span>
              </span>
            </button>
          );
        })}

        {popups.map((popup) => (
          <div
            key={popup.id}
            className="pointer-events-none absolute z-30 max-w-[min(86vw,760px)] -translate-x-1/2 float-up whitespace-normal text-center text-sm font-black leading-5 sm:text-base"
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`,
              color: popup.color,
              textShadow: `0 0 10px ${popup.color}`,
            }}
          >
            {popup.text}
          </div>
        ))}

        {!hammer.touch && hammer.visible ? (
          <div
            ref={hammerRef}
            className="pointer-events-none absolute left-0 top-0 z-40 will-change-transform"
            style={{ transform: "translate3d(-120px, -120px, 0) translate(-1.25rem, -1.25rem)" }}
          >
            <div
              className={`flex h-14 w-14 rotate-[-20deg] items-center justify-center rounded-xl border bg-black/70 ${hammer.bonk ? "hammer-bonk" : ""} ${legendaryHammer ? "border-[var(--neon-yellow)] text-[var(--neon-yellow)]" : "border-[var(--neon-cyan)] text-[var(--neon-cyan)]"}`}
            >
              <Hammer className="h-9 w-9" />
            </div>
            <div className="mt-1 whitespace-nowrap rounded-full bg-black/70 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
              {legendaryHammer ? "Legendary SOC Hammer" : "SOC Hammer 3000"}
            </div>
          </div>
        ) : null}

        {phase === "intro" || phase === "paused" ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[oklch(0.1_0.03_265/0.86)] p-4 backdrop-blur-sm">
            <div className="glass-panel neon-border-cyan max-w-2xl rounded-2xl p-6 text-center sm:p-8">
              <IntroPanel
                round={round}
                resumed={phase === "paused"}
                onStart={phase === "paused" ? () => setPhase("playing") : startRound}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Vòng 1/1 - Độ khó: {difficulty.label}
          </div>
          <div className="mt-1 text-base font-black neon-text-cyan">{round.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Công cụ của bạn: SOC Hammer 3000 - đập virus, né backup.
          </div>
        </div>
        <div className="flex gap-2">
          {phase === "playing" ? (
            <Button variant="outline" size="sm" onClick={() => setPhase("paused")}>
              <Pause className="mr-1 h-4 w-4" />
              Tạm dừng
            </Button>
          ) : null}
          {phase === "paused" ? (
            <Button size="sm" onClick={() => setPhase("playing")}>
              <Play className="mr-1 h-4 w-4" />
              Tiếp tục
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onExit}>
            Thoát
          </Button>
        </div>
      </div>
    </main>
  );
}

function IntroPanel({
  round,
  onStart,
  resumed,
}: {
  round: RoundConfig;
  onStart: () => void;
  resumed?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.3em] text-[var(--neon-cyan)]">
        Vòng {round.id}
      </div>
      <h2 className="mt-2 text-3xl font-black neon-text-cyan sm:text-4xl">{round.title}</h2>
      <p className="mt-3 text-base font-semibold text-foreground/90">{round.intro}</p>
      {round.hint ? (
        <p className="mt-2 text-sm font-bold text-[var(--neon-yellow)]">{round.hint}</p>
      ) : null}

      <div className="mt-5 rounded-xl bg-[oklch(0.24_0.1_200/0.38)] p-4 text-left text-sm font-semibold text-foreground/90">
        Một vòng duy nhất trong 30 giây. Từ giây 10 và giây 20, vật thể xuất hiện nhanh hơn, tồn tại
        ngắn hơn và dễ lẫn mục tiêu an toàn hơn.
      </div>

      <Button
        onClick={onStart}
        className="mt-6 h-12 px-8 text-lg font-black bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.14_0.04_265)]"
      >
        <Play className="mr-2 h-5 w-5" />
        {resumed ? "Tiếp tục" : "Bắt đầu"}
      </Button>
    </div>
  );
}
