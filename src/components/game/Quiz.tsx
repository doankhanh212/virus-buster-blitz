import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, HelpCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  title: string;
  options: string[];
  correct: number;
  correctFeedback: string;
  wrongFeedback: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    title: "HQG hiện tại đang kinh doanh gì?",
    options: [
      "Bán cơm sườn văn phòng",
      "Bán quần áo công sở",
      "Giải pháp công nghệ, hạ tầng CNTT, cloud và bảo mật",
      "Mở lớp dạy nhảy TikTok cho server",
    ],
    correct: 2,
    correctFeedback: "Chuẩn! HQG không bán cơm sườn. HQG làm giải pháp công nghệ cho doanh nghiệp.",
    wrongFeedback: "Nghe cũng hấp dẫn, nhưng chưa đúng. HQG làm công nghệ chứ chưa mở chi nhánh cơm sườn.",
  },
  {
    title: "Khi dữ liệu công ty 'bay màu', chuyên môn nào của HQG phát huy tác dụng nhất?",
    options: [
      "Sao lưu & phục hồi dữ liệu, bảo vệ hệ thống",
      "Gọi điện an ủi File Server",
      "Dán bùa 'đừng bị mã hóa' lên máy chủ",
      "Mở nhạc chữa lành cho phòng IT",
    ],
    correct: 0,
    correctFeedback: "Chuẩn! Khi dữ liệu gặp sự cố, thứ cứu công ty là sao lưu, phục hồi và bảo vệ dữ liệu đúng cách.",
    wrongFeedback: "Nghe vui đó, nhưng File Server không hồi sinh bằng lời động viên.",
  },
  {
    title: "HQG đã hoạt động trong lĩnh vực công nghệ khoảng bao lâu?",
    options: [
      "Mới mở hôm qua, router còn chưa kịp phát Wi-Fi",
      "Hơn 15 năm",
      "Từ thời USB cắm sai chiều là bài kiểm tra nhân phẩm",
      "Từ thời máy in kẹt giấy làm cả phòng kế toán im lặng",
    ],
    correct: 1,
    correctFeedback: "Chính xác! HQG đã có hơn 15 năm đồng hành cùng doanh nghiệp.",
    wrongFeedback: "Sai nhưng rất có kỷ niệm. Đáp án đúng là hơn 15 năm.",
  },
  {
    title: "Nếu doanh nghiệp cần hạ tầng CNTT ổn định, HQG thường gắn với nhóm nào sau đây?",
    options: [
      "Máy chủ, lưu trữ, mạng, cloud",
      "Bàn ghế văn phòng, cây cảnh và bình nước nóng lạnh",
      "Dịch vụ xem bói cho server",
      "Tô màu logo cho vui",
    ],
    correct: 0,
    correctFeedback: "Đúng rồi! Đây mới là nhóm giải pháp cốt lõi đúng chất HQG.",
    wrongFeedback: "Ý tưởng sáng tạo, nhưng HQG chưa triển khai dịch vụ xem bói cho server.",
  },
  {
    title: "Nếu muốn hợp tác với HQG sau sự kiện, điều nào hợp lý nhất?",
    options: [
      "Nhờ HQG tư vấn giải pháp công nghệ / hạ tầng",
      "Nhờ HQG đặt giúp cơm trưa",
      "Nhờ HQG dạy chống buồn ngủ lúc họp",
      "Nhờ HQG đàm phán với máy in",
    ],
    correct: 0,
    correctFeedback: "Chuẩn! HQG ở đây để đồng hành công nghệ cùng doanh nghiệp, không phải để thương lượng với máy in.",
    wrongFeedback: "Máy in đúng là khó nói chuyện, nhưng HQG vẫn mạnh nhất ở giải pháp công nghệ.",
  },
];

export function Quiz({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);
  const question = QUESTIONS[index];

  const feedbackText = useMemo(() => {
    if (feedback === "correct") return question.correctFeedback;
    if (feedback === "wrong") return question.wrongFeedback;
    return "";
  }, [feedback, question]);

  const answer = (optionIndex: number) => {
    if (feedback) return;
    const isCorrect = optionIndex === question.correct;
    setSelected(optionIndex);
    setFeedback(isCorrect ? "correct" : "wrong");
    window.setTimeout(() => {
      if (index === QUESTIONS.length - 1) {
        setFinished(true);
      } else {
        setIndex((current) => current + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1700);
  };

  if (finished) {
    return (
      <main className="min-h-screen cyber-grid px-5 py-8 sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
          <section className="glass-panel neon-border-cyan rounded-2xl p-7 text-center sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[var(--neon-green)]">Warm-up complete</p>
            <h1 className="mt-3 text-4xl font-black neon-text-cyan sm:text-6xl">Khởi động xong!</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-foreground/90">
              Bạn đã vượt qua vòng warm-up của HQG. Giờ đến lúc cứu công ty khỏi virus khóa dữ liệu.
            </p>
            <Button
              onClick={onDone}
              className="mt-8 h-14 px-8 text-lg font-black bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-green)] text-[oklch(0.14_0.04_265)]"
            >
              Vào game
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen cyber-grid px-5 py-8 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-7 lg:grid-cols-[0.88fr_1.12fr]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--neon-cyan)]">
            <HelpCircle className="h-4 w-4" />
            Câu {index + 1} / {QUESTIONS.length}
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            <span className="neon-text-cyan">Bạn hiểu HQG</span>
            <br />
            <span className="neon-text-green">cỡ nào?</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Trả lời nhanh 5 câu trước khi bước vào trận chiến với ransomware. Sai cũng được, nhưng đừng chọn quá tự tin.
          </p>
          <Button variant="ghost" onClick={onSkip} className="mt-5 text-muted-foreground hover:text-foreground">
            Bỏ qua và vào game
          </Button>
        </section>

        <section className="glass-panel neon-border-cyan rounded-2xl p-5 sm:p-7">
          <div className="h-2 overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-[var(--neon-cyan)] transition-all"
              style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%`, boxShadow: "0 0 16px var(--neon-cyan)" }}
            />
          </div>
          <h2 className="mt-6 text-2xl font-black leading-tight text-foreground sm:text-3xl">{question.title}</h2>
          <div className="mt-6 grid gap-3">
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const isCorrect = optionIndex === question.correct;
              const showCorrect = feedback && isCorrect;
              const showWrong = feedback === "wrong" && isSelected;
              return (
                <button
                  key={option}
                  onClick={() => answer(optionIndex)}
                  className={`min-h-20 rounded-xl border bg-black/35 p-4 text-left text-base font-bold leading-6 transition hover:-translate-y-0.5 hover:border-[var(--neon-cyan)] hover:bg-black/55 sm:text-lg ${
                    showCorrect ? "border-[var(--neon-green)] shadow-[0_0_18px_oklch(0.85_0.22_145/0.35)]" : ""
                  } ${showWrong ? "border-[var(--neon-red)] shadow-[0_0_18px_oklch(0.7_0.27_25/0.35)]" : "border-white/12"}`}
                >
                  <span className="mr-3 text-[var(--neon-cyan)]">{String.fromCharCode(65 + optionIndex)}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {feedback ? (
            <div
              className={`mt-5 flex items-start gap-3 rounded-xl p-4 text-sm font-semibold leading-6 ${
                feedback === "correct" ? "bg-[oklch(0.3_0.13_145/0.42)] text-[var(--neon-green)]" : "bg-[oklch(0.3_0.12_25/0.42)] text-[var(--neon-red)]"
              }`}
            >
              {feedback === "correct" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <span>{feedbackText}</span>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
