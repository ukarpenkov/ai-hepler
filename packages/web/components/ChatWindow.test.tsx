import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWindow from "../components/ChatWindow";
import type { QuestionResult } from "@/lib/types";

const mockSendAnswer = vi.fn();

vi.mock("@/lib/api", () => ({
  sendAnswer: (...args: unknown[]) => mockSendAnswer(...args),
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
});
