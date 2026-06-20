import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Phone, UserRound } from "lucide-react";
import type { Player } from "@/lib/game/types";

export function ParticipantForm({ onContinue }: { onContinue: (player: Player) => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const canContinue = name.trim().length > 0;

  return (
    <main className="relative min-h-screen cyber-grid px-5 py-8 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[var(--neon-green)]">Check-in booth</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
            <span className="neon-text-cyan">Ai sẽ cầm</span>
            <br />
            <span className="neon-text-green">SOC Hammer 3000?</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Nhập thông tin ngắn để ban tổ chức nhận diện người chơi tại sự kiện. Không có backend, không API,
            không tracking.
          </p>
          <div className="mt-6 rounded-xl border border-[var(--neon-yellow)]/35 bg-black/30 p-4 text-sm text-[var(--neon-yellow)]">
            Thông tin chỉ dùng trong phạm vi sự kiện.
          </div>
        </section>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!canContinue) return;
            onContinue({ name: name.trim(), company: company.trim(), phone: phone.trim() });
          }}
          className="glass-panel neon-border-cyan rounded-2xl p-6 sm:p-8"
        >
          <h2 className="text-2xl font-black neon-text-cyan">Thông tin người chơi</h2>
          <p className="mt-2 text-sm text-muted-foreground">Điền nhanh, rồi vào vòng warm-up của HQG.</p>

          <div className="mt-7 space-y-5">
            <Field icon={<UserRound className="h-5 w-5" />} id="player-name" label="Tên người chơi / đội" required>
              <Input
                id="player-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="VD: Đội Cứu Server"
                className="h-13 text-base"
                autoComplete="name"
              />
            </Field>
            <Field icon={<Building2 className="h-5 w-5" />} id="player-company" label="Công ty / đơn vị">
              <Input
                id="player-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="VD: HQG"
                className="h-13 text-base"
                autoComplete="organization"
              />
            </Field>
            <Field icon={<Phone className="h-5 w-5" />} id="player-phone" label="Số điện thoại">
              <Input
                id="player-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="VD: 0900 000 000"
                inputMode="tel"
                className="h-13 text-base"
                autoComplete="tel"
              />
            </Field>
          </div>

          <Button
            type="submit"
            disabled={!canContinue}
            className="mt-8 h-14 w-full text-lg font-black bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.14_0.04_265)]"
          >
            Tiếp tục
          </Button>
        </form>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  required,
  icon,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="flex items-center gap-2 text-sm font-bold text-foreground/90">
        <span className="text-[var(--neon-cyan)]">{icon}</span>
        {label}
        {required ? <span className="text-[var(--neon-red)]">*</span> : null}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
