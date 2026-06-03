export type ObjectKind = "danger" | "safe" | "boss";

export interface ObjectDef {
  id: string;
  label: string;
  kind: ObjectKind;
  icon: string; // lucide icon name key
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

export const SAFE: ObjectDef[] = [
  { id: "backup", label: "Bản sao dữ liệu cứu hộ", kind: "safe", icon: "DatabaseBackup", color: "green" },
  { id: "mfa", label: "MFA", kind: "safe", icon: "KeyRound", color: "cyan" },
  { id: "itteam", label: "Đội cứu hộ kỹ thuật", kind: "safe", icon: "Wrench", color: "cyan" },
  { id: "firewall", label: "Tường lửa", kind: "safe", icon: "Flame", color: "cyan" },
  { id: "shield", label: "Khiên bảo vệ", kind: "safe", icon: "ShieldCheck", color: "green" },
  { id: "customer", label: "Khách hàng", kind: "safe", icon: "Users", color: "green" },
  { id: "cleandb", label: "Kho dữ liệu sạch", kind: "safe", icon: "Database", color: "green" },
  { id: "safesys", label: "Hệ thống đang an toàn", kind: "safe", icon: "CheckCircle2", color: "cyan" },
];

export const BOSS: ObjectDef = {
  id: "boss",
  label: "Ransomware Boss",
  kind: "boss",
  icon: "Skull",
  color: "red",
};

export interface RoundConfig {
  id: number;
  title: string;
  intro: string;
  duration: number; // seconds
  spawnMs: number;
  lifetimeMs: number;
  safeRatio: number; // 0..1
  bossActive?: boolean;
}

export const ROUNDS: RoundConfig[] = [
  {
    id: 1,
    title: "Khởi động: Đập đúng mối nguy",
    intro: "Đập virus, đừng đập backup. Backup không có tội.",
    duration: 30,
    spawnMs: 900,
    lifetimeMs: 1800,
    safeRatio: 0.25,
  },
  {
    id: 2,
    title: "Virus mở tour nội bộ",
    intro: "File .pdf.exe không phải PDF. Nó là drama đội lốt hóa đơn.",
    duration: 45,
    spawnMs: 650,
    lifetimeMs: 1400,
    safeRatio: 0.35,
  },
  {
    id: 3,
    title: "Bảo vệ bản sao dữ liệu cứu hộ",
    intro: "Bản sao dữ liệu còn sống thì công ty còn hy vọng.",
    duration: 45,
    spawnMs: 500,
    lifetimeMs: 1200,
    safeRatio: 0.5,
  },
  {
    id: 4,
    title: "iPhone Gate: Final Boss",
    intro: "Vượt qua vòng này, bạn chạm tay tới iPhone 17 Pro Max.",
    duration: 30,
    spawnMs: 380,
    lifetimeMs: 1000,
    safeRatio: 0.45,
    bossActive: true,
  },
];

export const CORRECT_LINES = [
  "Virus bay màu!",
  "Bạn vừa cứu công ty khỏi một pha tự hủy.",
  "Email lừa đảo bị bắt quả tang.",
  "File .pdf.exe hết đường diễn.",
  "Backup vẫn sống. Hy vọng vẫn còn.",
  "Phòng IT bắt đầu tin bạn rồi đó.",
  "Khách hàng chưa biết chuyện gì xảy ra. Tốt lắm.",
];

export const WRONG_LINES = [
  "Đập nhầm backup rồi! Backup không có tội.",
  "MFA đang bảo vệ bạn mà, sao lại đánh nó?",
  "Khách hàng không phải virus!",
  "Phòng IT bắt đầu uống cà phê không đường.",
  "Dữ liệu công ty đang nhìn bạn bằng ánh mắt thất vọng.",
  "Ransomware vừa mở tour du lịch nội bộ.",
  "Bạn click hơi nhiệt tình, nhưng hơi sai đối tượng.",
];

export const BOSS_LINES = [
  "iPhone đang ở rất gần… nhưng ransomware đứng chắn trước cửa.",
  "Boss không khó, boss chỉ không muốn bạn có iPhone.",
  "Bạn đã né được drama, giờ né tiếp backup nha.",
  "Sai một cú là iPhone chuyển sang chế độ truyền thuyết.",
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
  misses: number; // wrong clicks on safe OR missed dangers
  correctHits: number;
  totalClicks: number;
  dataLocked: number; // 0..100
  backupHealth: number; // 0..100
  customerTrust: number; // 0..100
  bossDefeats: number;
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
  finalRoundAccuracy: 0,
  finalRoundMaxCombo: 0,
  finalRoundSafeHits: 0,
};