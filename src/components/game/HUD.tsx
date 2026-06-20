import { Clock, DatabaseBackup, Gauge, Lock, Target, Trophy, Users, Zap } from "lucide-react";

interface Props {
  playerName: string;
  score: number;
  combo: number;
  accuracy: number;
  dataLocked: number;
  backupHealth: number;
  customerTrust: number;
  timeLeft: number;
  difficultyLabel: string;
}

export function HUD(props: Props) {
  return (
    <section className="glass-panel rounded-2xl p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-[220px] truncate rounded-lg bg-[oklch(0.3_0.1_265/0.5)] px-3 py-1.5 text-sm font-black neon-text-cyan">
          {props.playerName}
        </div>
        <Stat
          icon={<Trophy className="h-5 w-5" />}
          label="Điểm"
          value={props.score}
          color="yellow"
          big
        />
        <Stat
          icon={<Zap className="h-5 w-5" />}
          label="Combo"
          value={`x${props.combo}`}
          color="purple"
        />
        <Stat
          icon={<Target className="h-5 w-5" />}
          label="Độ chính xác"
          value={`${props.accuracy}%`}
          color="cyan"
        />
        <Stat
          icon={<Clock className="h-5 w-5" />}
          label="Thời gian còn lại"
          value={`${props.timeLeft}s`}
          color={props.timeLeft <= 10 ? "red" : "green"}
        />
        <Stat
          icon={<Gauge className="h-5 w-5" />}
          label="Độ khó"
          value={props.difficultyLabel}
          color={props.timeLeft <= 10 ? "red" : props.timeLeft <= 20 ? "yellow" : "green"}
        />
      </div>

      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        <Bar
          icon={<Lock className="h-4 w-4" />}
          label="Dữ liệu bị khóa"
          value={props.dataLocked}
          danger
        />
        <Bar
          icon={<DatabaseBackup className="h-4 w-4" />}
          label="Sức khỏe backup"
          value={props.backupHealth}
        />
        <Bar
          icon={<Users className="h-4 w-4" />}
          label="Niềm tin khách hàng"
          value={props.customerTrust}
        />
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
  big,
}: {
  icon: React.ReactNode;
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
    <div className="flex min-w-[96px] items-center gap-2">
      <span className={cls}>{icon}</span>
      <div className="leading-tight">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={`font-black ${cls} ${big ? "text-2xl" : "text-lg"}`}>{value}</div>
      </div>
    </div>
  );
}

function Bar({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  danger?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const color = danger
    ? pct > 60
      ? "var(--neon-red)"
      : pct > 30
        ? "var(--neon-yellow)"
        : "var(--neon-green)"
    : pct < 30
      ? "var(--neon-red)"
      : pct < 60
        ? "var(--neon-yellow)"
        : "var(--neon-green)";

  return (
    <div className="rounded-lg bg-[oklch(0.2_0.04_265/0.5)] px-3 py-2">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 truncate text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-black" style={{ color }}>
          {Math.round(pct)}%
        </span>
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
