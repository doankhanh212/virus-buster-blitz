import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearScores,
  exportScoresToExcel,
  getScores,
  type ScoreEntry,
} from "@/lib/game/storage";
import { Download, Lock, RefreshCw, ShieldCheck, Trash2, Users } from "lucide-react";

export const Route = createFileRoute("/noi-bo")({
  head: () => ({
    meta: [
      { title: "Nội bộ · Dữ liệu người chơi" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: InternalPage,
});

// Lightweight gate so players don't wander into the admin view at the booth.
const PASSCODE = "hqg2026";

function InternalPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);

  const refresh = () => setEntries(getScores());

  useEffect(() => {
    if (unlocked) refresh();
  }, [unlocked]);

  const ranked = useMemo(
    () => [...entries].sort((a, b) => b.score - a.score || b.accuracy - a.accuracy),
    [entries],
  );

  const summary = useMemo(() => {
    if (entries.length === 0) return { count: 0, best: 0, avg: 0 };
    const best = Math.max(...entries.map((e) => e.score));
    const avg = Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length);
    return { count: entries.length, best, avg };
  }, [entries]);

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center cyber-grid px-5 py-10">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (passcode.trim() === PASSCODE) {
              setUnlocked(true);
              setError(false);
            } else {
              setError(true);
            }
          }}
          className="glass-panel neon-border-cyan w-full max-w-sm rounded-2xl p-7 text-center"
        >
          <Lock className="mx-auto h-10 w-10 text-[var(--neon-cyan)]" />
          <h1 className="mt-4 text-2xl font-black neon-text-cyan">Khu vực nội bộ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhập mã truy cập để xem dữ liệu người chơi.
          </p>
          <Input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Mã truy cập"
            className="mt-5 h-12 text-center text-base"
            autoFocus
          />
          {error ? (
            <p className="mt-2 text-sm font-bold text-[var(--neon-red)]">Mã không đúng.</p>
          ) : null}
          <Button
            type="submit"
            className="mt-5 h-12 w-full text-base font-black bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.14_0.04_265)]"
          >
            Mở khóa
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen cyber-grid px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-[var(--neon-cyan)]">
              <ShieldCheck className="h-4 w-4" />
              Khu vực nội bộ
            </p>
            <h1 className="mt-2 text-3xl font-black neon-text-cyan sm:text-4xl">Dữ liệu người chơi</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Làm mới
            </Button>
            <Button
              size="sm"
              onClick={() => exportScoresToExcel(entries)}
              disabled={entries.length === 0}
              className="bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-cyan)] text-[oklch(0.14_0.04_265)] font-black"
            >
              <Download className="mr-1 h-4 w-4" />
              Xuất Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm("Xóa toàn bộ dữ liệu người chơi? Hành động không thể hoàn tác.")) {
                  clearScores();
                  refresh();
                }
              }}
              disabled={entries.length === 0}
              className="border-[var(--neon-red)]/50 text-[var(--neon-red)]"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Xóa hết
            </Button>
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={<Users className="h-5 w-5" />} label="Lượt chơi" value={summary.count} />
          <SummaryCard label="Điểm cao nhất" value={summary.best} />
          <SummaryCard label="Điểm trung bình" value={summary.avg} />
        </section>

        <section className="mt-6 overflow-x-auto glass-panel rounded-2xl p-1">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                <Th>#</Th>
                <Th>Người chơi</Th>
                <Th>Công ty</Th>
                <Th>SĐT</Th>
                <Th className="text-right">Điểm</Th>
                <Th className="text-right">Chính xác</Th>
                <Th className="text-right">Combo</Th>
                <Th className="text-right">Ransomware</Th>
                <Th className="text-right">Dữ liệu cứu</Th>
                <Th>Thời gian</Th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    Chưa có dữ liệu người chơi.
                  </td>
                </tr>
              ) : (
                ranked.map((entry, index) => (
                  <tr key={entry.id} className="border-t border-white/10 hover:bg-white/5">
                    <Td className="font-black text-[var(--neon-yellow)]">{index + 1}</Td>
                    <Td className="font-bold text-foreground">{entry.name}</Td>
                    <Td className="text-muted-foreground">{entry.company || "—"}</Td>
                    <Td className="text-muted-foreground">{entry.phone || "—"}</Td>
                    <Td className="text-right font-black neon-text-cyan">{entry.score}</Td>
                    <Td className="text-right">{entry.accuracy}%</Td>
                    <Td className="text-right">x{entry.maxCombo}</Td>
                    <Td className="text-right">{entry.ransomwareBlocked}</Td>
                    <Td className="text-right">{entry.dataSaved}%</Td>
                    <Td className="text-muted-foreground">
                      {new Date(entry.playedAt).toLocaleString("vi-VN")}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <p className="mt-4 text-xs text-muted-foreground">
          Dữ liệu lưu cục bộ trên máy này (trình duyệt). Xuất Excel để tổng hợp hoặc sao lưu.
        </p>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-3xl font-black neon-text-cyan">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-3 ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}
