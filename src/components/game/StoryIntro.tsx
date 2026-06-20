import { Button } from "@/components/ui/button";
import { AlertTriangle, DatabaseBackup, MailWarning, ShieldCheck, Skull, Users } from "lucide-react";

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
          <h1 className="mt-4 text-4xl font-black neon-text-yellow sm:text-6xl">Thứ Hai, 08:47 sáng.</h1>
          <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-foreground/90">
            <p>
              Công ty đang vận hành bình thường. Phòng kế toán mở email. Kho dữ liệu công ty vẫn an toàn.
              Khách hàng vẫn chưa biết chuyện gì sắp xảy ra.
            </p>
            <p className="font-black text-[var(--neon-cyan)]">Một email lạ xuất hiện.</p>
            <p className="font-black text-[var(--neon-purple)]">Một file .pdf.exe bắt đầu diễn sâu.</p>
            <p className="font-black text-[var(--neon-red)]">Ransomware đang chuẩn bị mở tour du lịch nội bộ.</p>
            <p className="rounded-xl border border-[var(--neon-green)]/35 bg-black/35 p-4 font-bold text-[var(--neon-green)]">
              Nhiệm vụ của bạn: Đập đúng mối nguy, bảo vệ bản sao dữ liệu, giữ công ty sống sót.
            </p>
          </div>
          <Button
            onClick={onStart}
            className="mt-8 h-14 px-8 text-lg font-black bg-gradient-to-r from-[var(--neon-red)] via-[var(--neon-purple)] to-[var(--neon-cyan)] text-white"
          >
            Bắt đầu trận chiến
          </Button>
        </section>

        <section className="relative min-h-[430px]">
          <TimelineIcon className="left-[8%] top-[8%]" tone="cyan" icon={<MailWarning className="h-10 w-10" />} label="Email lạ" />
          <TimelineIcon className="right-[9%] top-[20%]" tone="purple" icon={<Skull className="h-10 w-10" />} label=".pdf.exe" />
          <TimelineIcon className="left-[16%] bottom-[24%]" tone="green" icon={<DatabaseBackup className="h-10 w-10" />} label="Backup" />
          <TimelineIcon className="right-[18%] bottom-[10%]" tone="cyan" icon={<ShieldCheck className="h-10 w-10" />} label="MFA" />
          <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[var(--neon-green)]/45 bg-black/55 text-center shadow-[0_0_45px_oklch(0.85_0.22_145/0.25)]">
            <Users className="h-12 w-12 text-[var(--neon-green)]" />
            <div className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--neon-green)]">Customer Trust</div>
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
