import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap, Bug, Skull, Sparkles, AlertTriangle } from "lucide-react";
import type { Player } from "@/lib/game/types";

export function Landing({ onStart }: { onStart: (p: Player) => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const valid = name.trim().length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden cyber-grid scanline">
      {/* glowing blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[var(--neon-purple)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--neon-cyan)] opacity-20 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-10 lg:py-16">
        <div className="flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[var(--neon-cyan)]">
          <Sparkles className="h-3.5 w-3.5" /> Cyber Arcade • Booth Edition
        </div>

        <h1 className="mt-6 text-center text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="neon-text-cyan">Đập Virus</span>{" "}
          <span className="neon-text-green">Cứu Công Ty</span>
        </h1>
        <p className="mt-4 max-w-2xl text-center text-lg text-muted-foreground sm:text-xl">
          Đập đúng mối nguy, né nhầm bản sao dữ liệu, giữ công ty sống sót.
        </p>

        <div className="mt-10 grid w-full gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-6">
              <p className="text-base leading-relaxed text-foreground/90">
                <span className="neon-text-purple font-semibold">Ransomware</span> là virus khóa
                dữ liệu và đòi tiền chuộc. Trong game này, bạn có nhiệm vụ đập đúng mối nguy,
                bảo vệ bản sao dữ liệu và giữ niềm tin khách hàng.
              </p>
              <p className="mt-3 text-base leading-relaxed text-[var(--neon-yellow)]">
                Đập virus thì được điểm. Đập nhầm backup thì phòng IT nhìn bạn bằng ánh mắt rất buồn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Pill icon={<Bug className="h-4 w-4" />} color="red" label="Đập virus" />
              <Pill icon={<Shield className="h-4 w-4" />} color="green" label="Né backup" />
              <Pill icon={<Zap className="h-4 w-4" />} color="cyan" label="Combo điên" />
              <Pill icon={<Skull className="h-4 w-4" />} color="purple" label="Final Boss" />
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <p className="text-sm uppercase tracking-wider text-[var(--neon-cyan)]">Giải đặc biệt</p>
              <p className="mt-1 text-xl font-bold">iPhone 17 Pro Max</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Trao theo thể lệ công khai của ban tổ chức. Final Boss rất khó nhưng có thể vượt qua.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              onStart({ name: name.trim(), company: company.trim(), phone: phone.trim() });
            }}
            className="glass-panel neon-border-cyan rounded-2xl p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold neon-text-cyan">Tham gia ngay</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Thông tin chỉ lưu cục bộ trên thiết bị này.
            </p>

            <div className="mt-6 space-y-4">
              <Field id="name" label="Tên người chơi / đội" required>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Đội Phá Đảo"
                  className="h-12 text-base"
                />
              </Field>
              <Field id="company" label="Công ty / đơn vị">
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="VD: ACME Corp"
                  className="h-12 text-base"
                />
              </Field>
              <Field id="phone" label="Số điện thoại">
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0900 000 000"
                  inputMode="tel"
                  className="h-12 text-base"
                />
              </Field>
            </div>

            <Button
              type="submit"
              disabled={!valid}
              className="mt-6 h-14 w-full text-lg font-bold tracking-wide bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.15_0.04_265)] hover:opacity-90 hover:scale-[1.01] transition shadow-[0_0_32px_oklch(0.7_0.2_200/0.5)]"
            >
              Bắt đầu đập virus →
            </Button>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-[oklch(0.2_0.05_265/0.5)] p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--neon-yellow)]" />
              <span>
                Đây là mô phỏng giáo dục an toàn, không chứa mã độc hay hướng dẫn tấn công.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label} {required && <span className="text-[var(--neon-red)]">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Pill({ icon, color, label }: { icon: React.ReactNode; color: "red" | "green" | "cyan" | "purple"; label: string }) {
  const cls = {
    red: "neon-text-red",
    green: "neon-text-green",
    cyan: "neon-text-cyan",
    purple: "neon-text-purple",
  }[color];
  return (
    <div className="glass-panel flex items-center gap-2 rounded-xl px-3 py-2.5">
      <span className={cls}>{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}