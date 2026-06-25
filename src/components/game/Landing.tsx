import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bug,
  Clock,
  DatabaseBackup,
  LockKeyhole,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Leaderboard } from "./Leaderboard";
import { sound } from "@/lib/game/sound";

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden cyber-grid scanline">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.42_0.2_305/0.28),transparent_34%),radial-gradient(circle_at_82%_72%,oklch(0.52_0.22_195/0.22),transparent_38%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-full glass-panel px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--neon-cyan)]">
            <Sparkles className="h-4 w-4" />
            HQG Cyber Arcade
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[var(--neon-yellow)]/40 px-4 py-2 text-sm font-bold text-[var(--neon-yellow)] sm:flex">
            <Clock className="h-4 w-4" />
            60 giây thử thách
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.32em] text-[var(--neon-green)]">
              60 giây sinh tồn
            </p>
            <h1 className="mt-4 text-5xl font-black leading-[1.03] sm:text-7xl lg:text-8xl">
              <span className="neon-text-cyan">Đập Virus</span>
              <br />
              <span className="neon-text-green">Cứu Công Ty</span>
            </h1>
            <p className="mt-5 max-w-3xl text-xl font-semibold text-foreground/90 sm:text-2xl">
              60 giây sinh tồn - Đập virus, cứu công ty, đừng đập nhầm backup!
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              Ransomware là virus khóa dữ liệu và đòi tiền chuộc. Trong game này, bạn sẽ đập đúng
              mối nguy, né nhầm hệ thống bảo vệ, cứu dữ liệu công ty và giữ niềm tin khách hàng.
            </p>
            <p className="mt-4 max-w-3xl text-lg font-bold text-[var(--neon-yellow)]">
              Đập virus thì được điểm. Đập nhầm backup thì phòng IT nhìn bạn bằng ánh mắt rất buồn.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  sound.uiClick();
                  onStart();
                }}
                className="h-14 px-8 text-lg font-black bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.14_0.04_265)] shadow-[0_0_32px_oklch(0.82_0.2_195/0.45)]"
              >
                Bắt đầu ngay
                <Zap className="ml-2 h-5 w-5" />
              </Button>
              <div className="flex items-start gap-2 rounded-xl bg-black/30 px-4 py-3 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--neon-yellow)]" />
                <span>
                  Đây là mô phỏng giáo dục an toàn, không chứa mã độc hay hướng dẫn tấn công.
                </span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--neon-cyan)]/30 shadow-[0_0_80px_oklch(0.78_0.2_200/0.25)]" />
            <VisualNode
              className="left-[8%] top-[12%]"
              tone="red"
              icon={<Bug className="h-11 w-11" />}
              label="Virus khóa dữ liệu"
            />
            <VisualNode
              className="right-[8%] top-[20%]"
              tone="green"
              icon={<DatabaseBackup className="h-11 w-11" />}
              label="Backup cứu hộ"
            />
            <VisualNode
              className="left-[16%] bottom-[18%]"
              tone="cyan"
              icon={<Shield className="h-11 w-11" />}
              label="MFA + Firewall"
            />
            <VisualNode
              className="right-[14%] bottom-[12%]"
              tone="red"
              icon={<LockKeyhole className="h-11 w-11" />}
              label="Ransomware mỗi 10s"
            />
            <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-[var(--neon-yellow)]/60 bg-black/55 text-center shadow-[0_0_40px_oklch(0.92_0.18_95/0.28)]">
              <Zap className="h-14 w-14 text-[var(--neon-yellow)]" />
              <div className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-[var(--neon-yellow)]">
                SOC Hammer 3000
              </div>
              <div className="mt-1 text-xs text-muted-foreground">đập virus, né backup</div>
            </div>
          </div>
        </div>

        <div className="pb-8">
          <Leaderboard limit={5} compact />
        </div>
      </section>
    </main>
  );
}

function VisualNode({
  className,
  tone,
  icon,
  label,
}: {
  className: string;
  tone: "red" | "green" | "cyan" | "purple";
  icon: React.ReactNode;
  label: string;
}) {
  const color = {
    red: "var(--neon-red)",
    green: "var(--neon-green)",
    cyan: "var(--neon-cyan)",
    purple: "var(--neon-purple)",
  }[tone];

  return (
    <div
      className={`absolute flex h-32 w-32 flex-col items-center justify-center rounded-2xl bg-black/55 p-3 text-center pulse-glow ${className}`}
      style={{ color, boxShadow: `0 0 26px ${color}, inset 0 0 18px ${color}44` }}
    >
      {icon}
      <div className="mt-2 text-xs font-black leading-tight text-white">{label}</div>
    </div>
  );
}
