import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  DatabaseBackup,
  LockKeyhole,
  MailWarning,
  ShieldCheck,
  Skull,
  Users,
} from "lucide-react";
import { sound } from "@/lib/game/sound";

export function StoryIntro({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative min-h-screen overflow-hidden cyber-grid px-5 py-8 sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,oklch(0.7_0.25_25/0.2),transparent_34%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--neon-red)]/45 bg-black/40 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[var(--neon-red)]">
            <AlertTriangle className="h-4 w-4" />
            Warning pulse
          </div>
          <h1 className="mt-4 text-4xl font-black neon-text-yellow sm:text-6xl">Công ty đang bị tấn công.</h1>
          <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-foreground/90">
            <p>
              Một email lạ vừa lọt vào hệ thống. File <span className="font-black text-[var(--neon-purple)]">.pdf.exe</span> đang
              lây lan, ransomware chuẩn bị mã hóa toàn bộ dữ liệu. Bạn là tuyến phòng thủ cuối cùng của công ty.
            </p>
            <p className="rounded-xl border border-[var(--neon-green)]/35 bg-black/35 p-4 font-bold text-[var(--neon-green)]">
              Nhiệm vụ: Đập đúng mối nguy, bảo vệ bản sao dữ liệu, giữ công ty sống sót trong 60 giây.
            </p>

            <div className="space-y-3 text-base">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--neon-cyan)]">Cách chơi</p>
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-[var(--neon-red)]">●</span>
                <span>
                  Dùng <span className="font-black text-[var(--neon-cyan)]">búa</span> đập trúng các{" "}
                  <span className="font-black text-[var(--neon-red)]">mối nguy</span> như virus, email lạ, .pdf.exe,
                  ransomware để ghi điểm.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-[var(--neon-green)]">●</span>
                <span>
                  <span className="font-black text-[var(--neon-green)]">Né</span> các mục an toàn — Backup, Customer Trust,
                  MFA, Firewall. Đập nhầm sẽ bị trừ điểm và tụt chỉ số bảo vệ.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-0.5 text-[var(--neon-yellow)]">●</span>
                <span>
                  Đừng để mối nguy lọt lưới, và đập liên tiếp để cộng dồn{" "}
                  <span className="font-black text-[var(--neon-yellow)]">combo</span>. Càng về cuối, virus xuất hiện càng
                  nhanh!
                </span>
              </p>
              <p className="flex items-start gap-3 rounded-xl border border-[var(--neon-red)]/40 bg-[oklch(0.2_0.1_25/0.4)] p-3">
                <LockKeyhole className="mt-0.5 h-6 w-6 shrink-0 text-[var(--neon-red)]" />
                <span>
                  <span className="font-black text-[var(--neon-red)]">Mỗi 10 giây</span>, một{" "}
                  <span className="font-black uppercase tracking-wide text-[var(--neon-red)]">RANSOMWARE</span> khổng lồ (biểu
                  tượng ổ khóa) xuất hiện. Đập trúng nó để{" "}
                  <span className="font-black text-[var(--neon-green)]">chặn mã hóa toàn bộ</span> — nếu để lọt, dữ liệu sẽ bị
                  khóa!
                </span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              sound.uiClick();
              onStart();
            }}
            className="mt-8 h-14 px-8 text-lg font-black bg-gradient-to-r from-[var(--neon-red)] via-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
          >
            Bắt đầu trận chiến
          </Button>
        </section>

        <section className="relative min-h-[430px]">
          <TimelineIcon className="left-[6%] top-[6%]" tone="cyan" icon={<MailWarning className="h-10 w-10" />} label="Email lạ" />
          <TimelineIcon className="right-[7%] top-[14%]" tone="purple" icon={<Skull className="h-10 w-10" />} label=".pdf.exe" />
          <TimelineIcon className="left-[10%] bottom-[20%]" tone="green" icon={<DatabaseBackup className="h-10 w-10" />} label="Backup" />
          <TimelineIcon className="right-[8%] bottom-[24%]" tone="cyan" icon={<ShieldCheck className="h-10 w-10" />} label="MFA" />
          <TimelineIcon className="right-[18%] bottom-[6%]" tone="green" icon={<Users className="h-10 w-10" />} label="Khách hàng" />
          <div className="ransomware-boss absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center">
            <LockKeyhole className="relative z-10 h-14 w-14 text-[var(--neon-red)]" />
            <div className="relative z-10 mt-1.5 text-xs font-black uppercase tracking-[0.16em] text-[var(--neon-yellow)]">Ransomware</div>
            <div className="relative z-10 text-[10px] font-bold text-foreground/70">mỗi 10 giây</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TimelineIcon({
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
      className={`absolute flex h-28 w-28 flex-col items-center justify-center rounded-2xl bg-black/55 p-3 text-center pulse-glow ${className}`}
      style={{ color, boxShadow: `0 0 24px ${color}, inset 0 0 18px ${color}35` }}
    >
      {icon}
      <div className="mt-2 text-xs font-black text-white">{label}</div>
    </div>
  );
}
