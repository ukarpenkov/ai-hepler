import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWindow from "../components/ChatWindow";
import type { QuestionResult } from "@/lib/types";

const mockSendAnswer = vi.fn();

vi.mock("@/lib/api", () => ({
  sendAnswer: (...args: unknown[]) => mockSendAnswer(...args),
}));

vi.mock("./ProgressBar", () => ({
  default: ({ current, total }: { current: number; total: number }) => (
    <div data-testid="progress-bar">
      Вопрос {current} из {total}
    </div>
  ),
}));

Element.prototype.scrollIntoView = vi.fn();

const mockQuestion: QuestionResult = {
  question: "Расскажите о себе",
  topic: "Введение",
  difficulty: "easy",
};

describe("ChatWindow", () => {
  beforeEach(() => {
    mockSendAnswer.mockReset();
  });

  it("renders initial question", () => {
    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} />);
    expect(screen.getByText(/\[Введение\] Расскажите о себе/)).toBeDefined();
  });

  it("adds user message on send", async () => {
    mockSendAnswer.mockResolvedValue({
      evaluation: { score: 5, strengths: [], weaknesses: [], recommendation: "" },
      coach: { explanation: "", improvedAnswer: "", tips: [] },
      memory: { weakTopics: [], progress: {} },
      nextQuestion: { question: "Следующий вопрос", topic: "Техническое", difficulty: "medium" },
    });

    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} />);

    const textarea = screen.getByPlaceholderText("Введите ответ...");
    fireEvent.change(textarea, { target: { value: "Меня зовут Иван" } });
    fireEvent.click(screen.getByText("Отправить"));

    await waitFor(() => {
      expect(screen.getByText("Меня зовут Иван")).toBeDefined();
    });
  });

  it("displays FeedbackCard after answer", async () => {
    mockSendAnswer.mockResolvedValue({
      evaluation: {
        score: 7,
        strengths: ["Хорошо"],
        weaknesses: [],
        recommendation: "Продолжайте",
      },
      coach: {
        explanation: "Отличный ответ",
        improvedAnswer: "",
        tips: ["Добавьте примеры"],
      },
      memory: { weakTopics: [], progress: {} },
      nextQuestion: { question: "Следующий", topic: "Тест", difficulty: "easy" },
    });

    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} />);

    const textarea = screen.getByPlaceholderText("Введите ответ...");
    fireEvent.change(textarea, { target: { value: "Мой ответ" } });
    fireEvent.click(screen.getByText("Отправить"));

    await waitFor(() => {
      expect(screen.getByText("Отличный ответ")).toBeDefined();
    });
  });

  it("increments questionCount after answer", async () => {
    mockSendAnswer.mockResolvedValue({
      evaluation: { score: 5, strengths: [], weaknesses: [], recommendation: "" },
      coach: { explanation: "", improvedAnswer: "", tips: [] },
      memory: { weakTopics: [], progress: {} },
      nextQuestion: { question: "Следующий", topic: "Техническое", difficulty: "medium" },
    });

    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} />);

    expect(screen.getByText("Вопрос 1 из 10")).toBeDefined();

    const textarea = screen.getByPlaceholderText("Введите ответ...");
    fireEvent.change(textarea, { target: { value: "Ответ" } });
    fireEvent.click(screen.getByText("Отправить"));

    await waitFor(() => {
      expect(screen.getByText("Вопрос 2 из 10")).toBeDefined();
    });
  });
});
