import { Button } from "@/components/ui/button";
import type { GameStats, Player } from "@/lib/game/types";
import { Award, Bug, Home, RotateCcw, Shield, Skull, Target } from "lucide-react";

interface BadgeDef {
  id: string;
  title: string;
  desc: string;
  match: (stats: GameStats) => boolean;
  color: "green" | "cyan" | "yellow" | "purple" | "red";
  icon: React.ReactNode;
}

const BADGES: BadgeDef[] = [
  {
    id: "excellent",
    title: "Excellent Defender",
    desc: "Một vòng 30 giây rất sạch: chính xác cao, combo đẹp, hệ thống vẫn ổn.",
    match: (stats) =>
      stats.finalRoundAccuracy >= 90 && stats.backupHealth >= 80 && stats.customerTrust >= 80,
    color: "yellow",
    icon: <Target className="h-6 w-6" />,
  },
  {
    id: "phishing",
    title: "Phishing Hunter",
    desc: "Nhìn file .pdf.exe là biết có mùi drama.",
    match: (stats) => stats.maxCombo >= 10,
    color: "purple",
    icon: <Bug className="h-6 w-6" />,
  },
  {
    id: "backup",
    title: "Backup Guardian",
    desc: "Không đập nhầm backup. Phòng IT gửi lời cảm ơn.",
    match: (stats) => stats.backupHealth >= 90,
    color: "cyan",
    icon: <Award className="h-6 w-6" />,
  },
  {
    id: "soc",
    title: "SOC Favorite",
    desc: "Phòng IT chính thức xem bạn là người quen.",
    match: (stats) => stats.score >= 360 && stats.customerTrust >= 70,
    color: "green",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    id: "fast",
    title: "Tay Nhanh Hơn Não",
    desc: "Click rất nhiệt tình, nhưng hơi sai mục tiêu.",
    match: (stats) => stats.misses >= 12,
    color: "red",
    icon: <Skull className="h-6 w-6" />,
  },
  {
    id: "critical",
    title: "Business Critical Failure",
    desc: "Công ty chính thức bay màu. Phòng IT đang chuẩn bị CV mới.",
    match: (stats) => stats.backupHealth < 50 || stats.customerTrust < 50 || stats.dataLocked > 75,
    color: "red",
    icon: <Skull className="h-6 w-6" />,
  },
];

export function EndScreen({
  player,
  stats,
  onReplay,
  onHome,
}: {
  player: Player;
  stats: GameStats;
  onReplay: () => void;
  onHome: () => void;
}) {
  const accuracy =
    stats.totalClicks > 0 ? Math.round((stats.correctHits / stats.totalClicks) * 100) : 0;
  const dataSaved = Math.max(0, 100 - stats.dataLocked);
  const earned = BADGES.filter((badge) => badge.match(stats));
  const primaryBadge =
    stats.backupHealth < 50 || stats.customerTrust < 50 || stats.dataLocked > 75
      ? "Business Critical Failure"
      : accuracy >= 85
        ? "Excellent Defender"
        : "SOC Trainee";
  const title =
    primaryBadge === "Business Critical Failure"
      ? "Công ty chính thức bay màu."
      : accuracy >= 85
        ? "Bạn đã giữ công ty sống sót qua 30 giây."
        : "Công ty sống sót, nhưng phòng IT hơi hồi hộp.";
  const message =
    primaryBadge === "Business Critical Failure"
      ? "Badge: Tay nhanh hơn não. Phòng IT đang chuẩn bị CV mới."
      : "Bạn chơi tốt, nhưng vẫn còn vài pha nhầm backup hơi đau lòng.";

  return (
    <main className="relative min-h-screen cyber-grid scanline px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--neon-cyan)]">
            Final report
          </p>
          <h1
            className={`mt-3 text-4xl font-black sm:text-6xl ${primaryBadge === "Excellent Defender" ? "neon-text-yellow" : "neon-text-cyan"}`}
          >
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-foreground/90">{message}</p>
          <div className="mx-auto mt-5 inline-flex rounded-full border border-[var(--neon-yellow)]/45 bg-black/40 px-5 py-2 text-sm font-black text-[var(--neon-yellow)]">
            Badge: {primaryBadge}
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <Metric label="Người chơi" value={player.name} color="cyan" />
          <Metric label="Điểm cuối" value={stats.score} color="yellow" big />
          <Metric label="Độ chính xác" value={`${accuracy}%`} color="cyan" big />
          <Metric label="Combo cao nhất" value={`x${stats.maxCombo}`} color="purple" big />
          <Metric label="Dữ liệu cứu được" value={`${dataSaved}%`} color="green" />
          <Metric label="Sức khỏe backup" value={`${stats.backupHealth}%`} color="green" />
          <Metric label="Niềm tin khách hàng" value={`${stats.customerTrust}%`} color="green" />
          <Metric label="Đập nhầm vật an toàn" value={stats.finalRoundSafeHits} color="red" />
          <Metric
            label="Chính xác vòng chơi"
            value={`${stats.finalRoundAccuracy}%`}
            color="yellow"
          />
        </section>

        <section className="mt-8 glass-panel rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black neon-text-cyan">Huy hiệu đạt được</h2>
            <span className="text-sm text-muted-foreground">{earned.length} huy hiệu</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {earned.length === 0 ? (
              <div className="col-span-full rounded-xl bg-black/30 p-4 text-sm text-muted-foreground">
                Chưa có huy hiệu lần này. Chơi lại để cứu công ty gọn hơn.
              </div>
            ) : (
              earned.map((badge) => {
                const cls = {
                  green: "neon-text-green",
                  cyan: "neon-text-cyan",
                  yellow: "neon-text-yellow",
                  purple: "neon-text-purple",
                  red: "neon-text-red",
                }[badge.color];
                return (
                  <div
                    key={badge.id}
                    className="flex gap-3 rounded-xl bg-[oklch(0.2_0.05_265/0.55)] p-4"
                  >
                    <div className={cls}>{badge.icon}</div>
                    <div>
                      <div className={`font-black ${cls}`}>{badge.title}</div>
                      <div className="mt-1 text-sm leading-6 text-foreground/80">{badge.desc}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            onClick={onReplay}
            className="h-12 px-6 text-base font-black bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.14_0.04_265)]"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Chơi lại
          </Button>
          <Button onClick={onHome} variant="outline" className="h-12 px-6 text-base">
            <Home className="mr-2 h-5 w-5" />
            Về màn hình chính
          </Button>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  color,
  big,
}: {
  label: string;
  value: React.ReactNode;
  color: "red" | "green" | "cyan" | "purple" | "yellow";
  big?: boolean;
}) {
  const cls = {
    red: "neon-text-red",
    green: "neon-text-green",
    cyan: "neon-text-cyan",
    purple: "neon-text-purple",
    yellow: "neon-text-yellow",
  }[color];
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 break-words font-black ${cls} ${big ? "text-4xl" : "text-2xl"}`}>
        {value}
      </div>
    </div>
  );
}
