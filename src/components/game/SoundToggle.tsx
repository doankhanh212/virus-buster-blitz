import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/game/sound";

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(sound.isMuted());
    return sound.onMuteChange(setMuted);
  }, []);

  return (
    <button
      type="button"
      onClick={() => sound.toggleMute()}
      aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
      title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
      className="fixed bottom-4 right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full glass-panel neon-border-cyan text-[var(--neon-cyan)] transition hover:scale-105"
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
