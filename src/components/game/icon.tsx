import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function GameIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.HelpCircle;
  return <Cmp className={className} strokeWidth={2.2} />;
}