import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landing } from "@/components/game/Landing";
import { Game, type EndResult } from "@/components/game/Game";
import { EndScreen } from "@/components/game/EndScreen";
import { INITIAL_STATS, type GameStats, type Player } from "@/lib/game/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Đập Virus Cứu Công Ty" },
      { name: "description", content: "60 giây sinh tồn. Đập đúng virus, né nhầm backup, cứu dữ liệu công ty." },
      { property: "og:title", content: "Đập Virus Cứu Công Ty" },
      { property: "og:description", content: "Arcade game giáo dục về ransomware. Đập đúng mối nguy, né nhầm backup, giành iPhone 17 Pro Max." },
    ],
  }),
  component: Index,
});

type Screen = "landing" | "game" | "end";

function Index() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [player, setPlayer] = useState<Player | null>(null);
  const [result, setResult] = useState<{ stats: GameStats; qualified: boolean }>({
    stats: INITIAL_STATS,
    qualified: false,
  });

  const startGame = (p: Player) => {
    try { localStorage.setItem("dvct-player", JSON.stringify(p)); } catch { /* ignore */ }
    setPlayer(p);
    setScreen("game");
  };

  const onEnd = (r: EndResult) => {
    setResult({ stats: r.stats, qualified: r.qualifiesPrize });
    setScreen("end");
  };

  if (screen === "landing" || !player) {
    return <Landing onStart={startGame} />;
  }
  if (screen === "game") {
    return <Game player={player} onEnd={onEnd} onExit={() => setScreen("landing")} />;
  }
  return (
    <EndScreen
      player={player}
      stats={result.stats}
      qualified={result.qualified}
      onReplay={() => setScreen("game")}
      onHome={() => setScreen("landing")}
    />
  );
}
