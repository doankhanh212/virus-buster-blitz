import { Button } from "@/components/ui/button";
import type { GameStats, Player } from "@/lib/game/types";
import { RotateCcw, Home, Trophy, Award, Shield, Bug, Skull } from "lucide-react";

interface BadgeDef {
  id: string;
  title: string;
  desc: string;
  match: (s: GameStats, qualified: boolean) => boolean;
  color: "green" | "cyan" | "yellow" | "purple" | "red";
  icon: React.ReactNode;
}

const BADGES: BadgeDef[] = [
  {
    id: "iphone",
    title: "iPhone Champion",
    desc: "Không thể tin được. Bạn đã hạ Final Boss. iPhone 17 Pro Max chính thức gọi tên bạn.",
    match: (_s, q) => q,
    color: "yellow",
    icon: <Trophy className="h-6 w-6" />,
  },
  {
    id: "excellent",
    title: "Excellent Defender",
    desc: "Đập virus như có thù riêng, backup vẫn sống.",
    match: (s) => s.score >= 400 && s.backupHealth >= 70,
    color: "green",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    id: "phisher",
    title: "Phishing Hunter",
    desc: "Nhìn file .pdf.exe là biết có mùi drama.",
    match: (s) => s.maxCombo >= 10,
    color: "purple",
    icon: <Bug className="h-6 w-6" />,
  },
  {
    id: "backup",
    title: "Backup Guardian",
    desc: "Không đập nhầm backup. Phòng IT gửi lời cảm ơn.",
    match: (s) => s.backupHealth >= 90,
    color: "cyan",
    icon: <Award className="h-6 w-6" />,
  },
  {
    id: "almost",
    title: "Almost iPhone",
    desc: "Rất gần iPhone 17 Pro Max, nhưng ransomware né đòn hơi giỏi.",
    match: (s, q) => !q && s.bossDefeats >= 2,
    color: "purple",
    icon: <Trophy className="h-6 w-6" />,
  },
  {
    id: "fail",
    title: "Business Critical Failure",
    desc: "Bạn đập nhầm hơi nhiều. Backup đang nhìn bạn bằng ánh mắt thất vọng.",
    match: (s) => s.backupHealth < 50 || s.customerTrust < 50,
    color: "red",
    icon: <Skull className="h-6 w-6" />,
  },
];

export function EndScreen({
  player, stats, qualified, onReplay, onHome,
}: {
  player: Player; stats: GameStats; qualified: boolean;
  onReplay: () => void; onHome: () => void;
}) {
  const accuracy = stats.totalClicks > 0 ? Math.round((stats.correctHits / stats.totalClicks) * 100) : 0;
  const dataSaved = 100 - stats.dataLocked;
  const earned = BADGES.filter((b) => b.match(stats, qualified));

  const headline = qualified
    ? "Không thể tin được. Bạn đã hạ Final Boss. iPhone 17 Pro Max chính thức gọi tên bạn."
    : "Bạn đã rất gần iPhone 17 Pro Max. Rất tiếc, ransomware vừa đặt lịch tái khám.";

  return (
    <div className="relative min-h-screen cyber-grid scanline px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--neon-cyan)]">Kết quả</div>
          <h1 className={`mt-2 text-4xl sm:text-6xl font-black ${qualified ? "neon-text-yellow" : "neon-text-cyan"}`}>
            {player.name}
          </h1>
          <p className="mt-3 text-lg text-foreground/90 max-w-2xl mx-auto">{headline}</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Metric label="Điểm cuối" value={stats.score} color="yellow" big />
          <Metric label="Chính xác" value={`${accuracy}%`} color="cyan" big />
          <Metric label="Combo cao nhất" value={`x${stats.maxCombo}`} color="purple" big />
          <Metric label="Dữ liệu cứu được" value={`${dataSaved}%`} color="green" />
          <Metric label="Sức khỏe backup" value={`${stats.backupHealth}%`} color="green" />
          <Metric label="Niềm tin khách hàng" value={`${stats.customerTrust}%`} color="green" />
        </div>

        <div className="mt-8 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold neon-text-cyan">Huy hiệu đạt được</h2>
            <span className="text-sm text-muted-foreground">{earned.length} huy hiệu</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {earned.length === 0 && (
              <div className="text-muted-foreground text-sm col-span-2">Chưa có huy hiệu lần này — chơi lại để chinh phục!</div>
            )}
            {earned.map((b) => {
              const cls = {
                green: "neon-text-green", cyan: "neon-text-cyan", yellow: "neon-text-yellow",
                purple: "neon-text-purple", red: "neon-text-red",
              }[b.color];
              return (
                <div key={b.id} className="flex gap-3 rounded-xl bg-[oklch(0.2_0.05_265/0.5)] p-4">
                  <div className={cls}>{b.icon}</div>
                  <div>
                    <div className={`font-bold ${cls}`}>{b.title}</div>
                    <div className="text-sm text-foreground/80">{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 glass-panel rounded-2xl p-5 text-sm text-foreground/80">
          <div className="font-bold neon-text-cyan mb-1">Giải đặc biệt iPhone 17 Pro Max</div>
          {qualified ? (
            <p>Bạn đã đạt đủ điều kiện. Vui lòng liên hệ ban tổ chức tại booth để xác nhận giải thưởng.</p>
          ) : (
            <p>
              Điều kiện công khai: chính xác ≥ 95% vòng cuối, không đập trúng vật bảo vệ, combo ≥ 20,
              hạ Boss ≥ 3 lần, Backup ≥ 80%, Niềm tin khách hàng ≥ 80%.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={onReplay} className="h-12 px-6 text-base font-bold bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.15_0.04_265)]">
            <RotateCcw className="mr-2 h-5 w-5" /> Chơi lại
          </Button>
          <Button onClick={onHome} variant="outline" className="h-12 px-6 text-base">
            <Home className="mr-2 h-5 w-5" /> Về màn hình chính
          </Button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color, big }: { label: string; value: React.ReactNode; color: "red" | "green" | "cyan" | "purple" | "yellow"; big?: boolean }) {
  const cls = {
    red: "neon-text-red", green: "neon-text-green", cyan: "neon-text-cyan",
    purple: "neon-text-purple", yellow: "neon-text-yellow",
  }[color];
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-black ${cls} ${big ? "text-4xl" : "text-2xl"}`}>{value}</div>
    </div>
  );
}