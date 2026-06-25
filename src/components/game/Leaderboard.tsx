import { useEffect, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { getLeaderboard, type ScoreEntry } from "@/lib/game/storage";

function rankStyle(rank: number) {
  if (rank === 0) return { ring: "border-[var(--neon-yellow)]/60", text: "neon-text-yellow" };
  if (rank === 1) return { ring: "border-[var(--neon-cyan)]/50", text: "neon-text-cyan" };
  if (rank === 2) return { ring: "border-[var(--neon-purple)]/50", text: "neon-text-purple" };
  return { ring: "border-white/10", text: "text-foreground/80" };
}

export function Leaderboard({
  limit = 10,
  highlightId,
  compact,
}: {
  limit?: number;
  highlightId?: string;
  compact?: boolean;
}) {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard().slice(0, limit));
  }, [limit]);

  return (
    <section className="glass-panel neon-border-cyan rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[var(--neon-yellow)]" />
        <h2 className="text-xl font-black neon-text-cyan">Bảng xếp hạng</h2>
      </div>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-xl bg-black/30 p-4 text-sm text-muted-foreground">
          Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên cứu công ty!
        </div>
      ) : (
        <ol className="mt-4 space-y-2">
          {entries.map((entry, rank) => {
            const style = rankStyle(rank);
            const isMe = highlightId && entry.id === highlightId;
            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 rounded-xl border bg-black/35 px-3 py-2.5 ${style.ring} ${
                  isMe ? "ring-2 ring-[var(--neon-green)] shadow-[0_0_18px_oklch(0.85_0.22_145/0.35)]" : ""
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/50 font-black ${style.text}`}>
                  {rank === 0 ? (
                    <Crown className="h-4 w-4" />
                  ) : rank <= 2 ? (
                    <Medal className="h-4 w-4" />
                  ) : (
                    rank + 1
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-black text-foreground">
                    {entry.name}
                    {isMe ? <span className="ml-2 text-xs font-bold text-[var(--neon-green)]">(bạn)</span> : null}
                  </div>
                  {!compact ? (
                    <div className="truncate text-xs text-muted-foreground">
                      {entry.company || "—"} · {entry.accuracy}% chính xác · x{entry.maxCombo} combo
                    </div>
                  ) : null}
                </div>
                <div className={`shrink-0 text-right font-black ${style.text}`}>
                  <div className="text-xl leading-none">{entry.score}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">điểm</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
