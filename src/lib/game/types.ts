export type ObjectKind = "danger" | "safe";

export interface ObjectDef {
  id: string;
  label: string;
  kind: ObjectKind;
  icon: string;
  color: "red" | "green" | "cyan" | "purple" | "yellow";
}

export const DANGEROUS: ObjectDef[] = [
  { id: "virus", label: "Virus khóa dữ liệu", kind: "danger", icon: "Bug", color: "red" },
  { id: "phish", label: "Email lừa đảo", kind: "danger", icon: "MailWarning", color: "red" },
  { id: "pdfexe", label: "File .pdf.exe", kind: "danger", icon: "FileWarning", color: "purple" },
  { id: "usb", label: "USB lạ", kind: "danger", icon: "Usb", color: "purple" },
  { id: "freegift", label: "Link nhận quà miễn phí", kind: "danger", icon: "Gift", color: "red" },
  { id: "weakpw", label: "Mật khẩu yếu", kind: "danger", icon: "Unlock", color: "red" },
  { id: "infected", label: "Máy bị nhiễm", kind: "danger", icon: "MonitorX", color: "purple" },
  { id: "hacker", label: "Hacker", kind: "danger", icon: "UserX", color: "red" },
];

/**
 * Ransomware "boss" — spawned on its own 10s timer, rendered larger and with a
 * distinct lock icon. Smashing it triggers the full-screen lockdown effect.
 */
export const RANSOMWARE: ObjectDef = {
  id: "ransomware",
  label: "RANSOMWARE",
  kind: "danger",
  icon: "LockKeyhole",
  color: "purple",
};

export const SAFE: ObjectDef[] = [
  {
    id: "backup",
    label: "Bản sao dữ liệu cứu hộ",
    kind: "safe",
    icon: "DatabaseBackup",
    color: "green",
  },
  { id: "mfa", label: "MFA", kind: "safe", icon: "KeyRound", color: "cyan" },
  { id: "itteam", label: "Đội cứu hộ kỹ thuật", kind: "safe", icon: "Wrench", color: "cyan" },
  { id: "firewall", label: "Tường lửa", kind: "safe", icon: "Flame", color: "cyan" },
  { id: "shield", label: "Khiên bảo vệ", kind: "safe", icon: "ShieldCheck", color: "green" },
  { id: "customer", label: "Khách hàng", kind: "safe", icon: "Users", color: "green" },
  { id: "cleandb", label: "Kho dữ liệu sạch", kind: "safe", icon: "Database", color: "green" },
  {
    id: "safesys",
    label: "Hệ thống đang an toàn",
    kind: "safe",
    icon: "CheckCircle2",
    color: "cyan",
  },
];

export interface RoundConfig {
  id: number;
  title: string;
  intro: string;
  hint?: string;
  duration: number;
  spawnMs: number;
  lifetimeMs: number;
  safeRatio: number;
}

export const ROUNDS: RoundConfig[] = [
  {
    id: 1,
    title: "60 giây cứu công ty",
    intro:
      "Đập đúng mối nguy, né backup và hệ thống bảo vệ. Cứ mỗi 10 giây nhịp game nhanh hơn và một RANSOMWARE xuất hiện.",
    hint: "Mỗi 10 giây có 1 ransomware khổng lồ — đập nó để chặn mã hóa toàn bộ dữ liệu!",
    duration: 60,
    spawnMs: 900,
    lifetimeMs: 1800,
    safeRatio: 0.25,
  },
];

export const CORRECT_LINES = [
  "Virus bay màu!",
  "Hacker khóc ròng!",
  "File Server đang reo hò!",
  "File .pdf.exe hết đường diễn!",
  "Email lừa đảo bị bắt quả tang!",
  "Một cú đập, một drama biến mất.",
];

export const WRONG_BACKUP_LINES = [
  "Backup bị đập! Phòng IT đang uống cà phê không đường...",
  "Phao cứu sinh bị bạn úp sọt rồi!",
  "Backup không có tội!",
];

export const WRONG_DEFENSE_LINES = [
  "MFA vừa bị bạn giết! Hacker cảm ơn bạn!",
  "Tường lửa đang bảo vệ bạn mà!",
  "Bạn vừa tự phá hàng rào nhà mình.",
];

export const WRONG_CUSTOMER_LINES = [
  "Khách hàng đang gọi tổng đài chửi IT...",
  "Đừng đập khách hàng! Họ đang trả lương cho bạn đấy!",
  "Niềm tin khách hàng vừa bị trừ nhẹ một nhịp.",
];

export const WRONG_LINES = [
  ...WRONG_BACKUP_LINES,
  ...WRONG_DEFENSE_LINES,
  ...WRONG_CUSTOMER_LINES,
  "Đập sai rồi! Giờ virus gửi lời cảm ơn cá nhân đến bạn.",
];

export const RANSOMWARE_BLOCK_LINES = [
  "RANSOMWARE BỊ CHẶN! Dữ liệu được giải cứu trong gang tấc.",
  "Bạn vừa bẻ khóa mã độc. Hacker đập bàn phím trong tức giận.",
  "Mã hóa toàn bộ: THẤT BẠI. Công ty thở phào nhẹ nhõm.",
];

export const RANSOMWARE_MISS_LINES = [
  "Ransomware lọt lưới! Dữ liệu bắt đầu bị mã hóa...",
  "Bạn để ransomware sổng mất. Màn hình đòi tiền chuộc đang hiện ra.",
];

export const RANDOM_LINES = [
  "Bạn đập đẹp lắm! Hacker đang chửi thề trong group Telegram.",
  "Đập tiếp đi! File Server đang cổ vũ bạn như cổ vũ đội bóng.",
  "Combo x10! Phòng IT đang xem bạn như siêu anh hùng.",
  "Còn ít giây thôi, giữ bình tĩnh và né backup nha!",
];

export interface Player {
  name: string;
  company: string;
  phone: string;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  correctHits: number;
  totalClicks: number;
  dataLocked: number;
  backupHealth: number;
  customerTrust: number;
  bossDefeats: number;
  backupHits: number;
  finalRoundAccuracy: number;
  finalRoundMaxCombo: number;
  finalRoundSafeHits: number;
}

export const INITIAL_STATS: GameStats = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  misses: 0,
  correctHits: 0,
  totalClicks: 0,
  dataLocked: 0,
  backupHealth: 100,
  customerTrust: 100,
  bossDefeats: 0,
  backupHits: 0,
  finalRoundAccuracy: 0,
  finalRoundMaxCombo: 0,
  finalRoundSafeHits: 0,
};
