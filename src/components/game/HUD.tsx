import { Clock, Trophy, Zap, Target, Lock, DatabaseBackup, Users } from "lucide-react";

interface Props {
  playerName: string;
  score: number;
  combo: number;
  accuracy: number;
  dataLocked: number;
  backupHealth: number;
  customerTrust: number;
  timeLeft: number;
}

export function HUD(p: Props) {
  return (
    <div className="glass-panel rounded-2xl p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[oklch(0.3_0.1_265/0.5)] px-3 py-1.5 text-sm font-bold neon-text-cyan max-w-[200px] truncate">
            {p.playerName}
          </div>
        </div>
        <Stat icon={<Trophy className="h-5 w-5" />} label="Điểm" value={p.score} color="yellow" big />
        <Stat icon={<Zap className="h-5 w-5" />} label="Combo" value={`x${p.combo}`} color="purple" />
        <Stat icon={<Target className="h-5 w-5" />} label="Chính xác" value={`${p.accuracy}%`} color="cyan" />
        <Stat icon={<Clock className="h-5 w-5" />} label="Thời gian" value={`${p.timeLeft}s`} color={p.timeLeft <= 10 ? "red" : "green"} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Bar icon={<Lock className="h-4 w-4" />} label="Dữ liệu bị khóa" value={p.dataLocked} danger />
        <Bar icon={<DatabaseBackup className="h-4 w-4" />} label="Sức khỏe backup" value={p.backupHealth} />
        <Bar icon={<Users className="h-4 w-4" />} label="Niềm tin khách hàng" value={p.customerTrust} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color, big }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: "red" | "green" | "cyan" | "purple" | "yellow"; big?: boolean }) {
  const cls = {
    red: "neon-text-red", green: "neon-text-green", cyan: "neon-text-cyan",
    purple: "neon-text-purple", yellow: "neon-text-yellow",
  }[color];
  return (
    <div className="flex items-center gap-2">
      <span className={cls}>{icon}</span>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`font-black ${cls} ${big ? "text-2xl" : "text-lg"}`}>{value}</div>
      </div>
    </div>
  );
}

function Bar({ icon, label, value, danger }: { icon: React.ReactNode; label: string; value: number; danger?: boolean }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = danger
    ? pct > 60 ? "var(--neon-red)" : pct > 30 ? "var(--neon-yellow)" : "var(--neon-green)"
    : pct < 30 ? "var(--neon-red)" : pct < 60 ? "var(--neon-yellow)" : "var(--neon-green)";
  return (
    <div className="rounded-lg bg-[oklch(0.2_0.04_265/0.5)] px-3 py-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">{icon}{label}</span>
        <span className="font-bold" style={{ color }}>{Math.round(pct)}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
    </div>
  );
}