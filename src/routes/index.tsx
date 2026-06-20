import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EndScreen } from "@/components/game/EndScreen";
import { Game, type EndResult } from "@/components/game/Game";
import { Landing } from "@/components/game/Landing";
import { ParticipantForm } from "@/components/game/ParticipantForm";
import { Quiz } from "@/components/game/Quiz";
import { StoryIntro } from "@/components/game/StoryIntro";
import { INITIAL_STATS, type GameStats, type Player } from "@/lib/game/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Đập Virus Cứu Công Ty" },
      {
        name: "description",
        content: "30 giây sinh tồn - Đập virus, cứu công ty, đừng đập nhầm backup!",
      },
      { property: "og:title", content: "Đập Virus Cứu Công Ty" },
      {
        property: "og:description",
        content:
          "Arcade game giáo dục về ransomware: đập đúng mối nguy, né nhầm backup, giữ niềm tin khách hàng.",
      },
    ],
  }),
  component: Index,
});

type Screen = "landing" | "participant" | "quiz" | "story" | "game" | "end";

function Index() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [player, setPlayer] = useState<Player | null>(null);
  const [result, setResult] = useState<{ stats: GameStats }>({
    stats: INITIAL_STATS,
  });

  const savePlayer = (nextPlayer: Player) => {
    try {
      localStorage.setItem("dvct-player", JSON.stringify(nextPlayer));
    } catch {
      // Local storage is optional for kiosk/privacy browser modes.
    }
    setPlayer(nextPlayer);
    setScreen("quiz");
  };

  const onEnd = (nextResult: EndResult) => {
    setResult({ stats: nextResult.stats });
    setScreen("end");
  };

  if (screen === "landing") {
    return <Landing onStart={() => setScreen("participant")} />;
  }

  if (screen === "participant") {
    return <ParticipantForm onContinue={savePlayer} />;
  }

  if (screen === "quiz") {
    return <Quiz onDone={() => setScreen("story")} onSkip={() => setScreen("story")} />;
  }

  if (screen === "story") {
    return <StoryIntro onStart={() => setScreen("game")} />;
  }

  if (screen === "game" && player) {
    return <Game player={player} onEnd={onEnd} onExit={() => setScreen("landing")} />;
  }

  if (player) {
    return (
      <EndScreen
        player={player}
        stats={result.stats}
        onReplay={() => setScreen("game")}
        onHome={() => setScreen("landing")}
      />
    );
  }

  return <Landing onStart={() => setScreen("participant")} />;
}
