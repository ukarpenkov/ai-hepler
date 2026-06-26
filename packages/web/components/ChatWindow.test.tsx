import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatWindow from "../components/ChatWindow";
import type { QuestionResult } from "@/lib/types";
import { Wrapper } from "../test-utils";

const mockSendAnswer = vi.fn();

vi.mock("@/lib/api", () => ({
  sendAnswer: (...args: unknown[]) => mockSendAnswer(...args),
}));

vi.mock("@/lib/session-store", () => ({
  updateSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/BottomSheet", () => ({
  default: ({ isOpen, onToggle, title, children }: { isOpen: boolean; onToggle: () => void; title: string; children: React.ReactNode }) => (
    <div data-testid="bottom-sheet" data-open={isOpen}>
      <button onClick={onToggle}>{title}</button>
      {isOpen && children}
    </div>
  ),
}));

vi.mock("@/components/SummaryView", () => ({
  default: ({ feedbacks }: { feedbacks: Array<{ number: number; score: number }> }) => (
    <div data-testid="summary-view">
      <span data-testid="feedbacks-count">{feedbacks.length}</span>
      {feedbacks.map((f) => (
        <span key={f.number} data-testid={`feedback-${f.number}`}>
          Q{f.number}: {f.score}
        </span>
      ))}
    </div>
  ),
}));

Element.prototype.scrollIntoView = vi.fn();

const mockQuestion: QuestionResult = {
  question: "Расскажите о себе",
  topic: "Введение",
  difficulty: "easy",
};

const mockSessionData = {
  id: "test-id",
  jobText: "Ищем frontend-разработчика с опытом React и TypeScript.",
  jobProfile: {
    role: "Frontend Developer",
    level: "middle" as const,
    skills: ["React", "TypeScript"],
    keywords: ["frontend"],
    domain: "IT",
    language: "ru",
  },
  history: [],
  weakSkills: [],
  chatMessages: [],
  allFeedbacks: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function makeResponse(n: number) {
  return {
    evaluation: {
      score: 5,
      strengths: [`Сильная сторона ${n}`],
      weaknesses: [],
      recommendation: `Рекомендация ${n}`,
    },
    coach: {
      explanation: `Разбор ${n}`,
      improvedAnswer: `Улучшенный ${n}`,
      tips: [`Совет ${n}`],
    },
    memory: { weakTopics: [], progress: {} },
    nextQuestion: { question: `Вопрос ${n + 1}`, topic: "Тех", difficulty: "medium" as const },
    updatedHistory: [
      { role: "assistant", content: "Расскажите о себе", timestamp: new Date().toISOString() },
      { role: "user", content: `Ответ ${n}`, timestamp: new Date().toISOString() },
    ],
    updatedWeakSkills: [],
  };
}

describe("ChatWindow", () => {
  beforeEach(() => {
    mockSendAnswer.mockReset();
  });

  it("renders initial question", () => {
    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} />, { wrapper: Wrapper });
    expect(screen.getByText("Введение")).toBeDefined();
    expect(screen.getByText("Расскажите о себе")).toBeDefined();
  });

  it("adds user message on send", async () => {
    mockSendAnswer.mockResolvedValue(makeResponse(1));

    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} sessionData={mockSessionData} />, { wrapper: Wrapper });

    const textarea = screen.getByPlaceholderText("Type your answer... (Enter to send, Shift+Enter for new line)");
    fireEvent.change(textarea, { target: { value: "Меня зовут Иван" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Меня зовут Иван")).toBeDefined();
    });
  });

  it("displays FeedbackCard after answer", async () => {
    mockSendAnswer.mockResolvedValue(makeResponse(1));

    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} sessionData={mockSessionData} />, { wrapper: Wrapper });

    const textarea = screen.getByPlaceholderText("Type your answer... (Enter to send, Shift+Enter for new line)");
    fireEvent.change(textarea, { target: { value: "Мой ответ" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Совет 1")).toBeDefined();
    });
  });

  it("increments questionCount after answer", async () => {
    mockSendAnswer.mockResolvedValue(makeResponse(1));

    const onProgressChange = vi.fn();

    render(
      <ChatWindow
        sessionId="test-id"
        initialQuestion={mockQuestion}
        sessionData={mockSessionData}
        onProgressChange={onProgressChange}
      />,
      { wrapper: Wrapper }
    );

    const textarea = screen.getByPlaceholderText("Type your answer... (Enter to send, Shift+Enter for new line)");
    fireEvent.change(textarea, { target: { value: "Ответ" } });
    fireEvent.keyDown(textarea, { key: "Enter" });

    await waitFor(() => {
      expect(onProgressChange).toHaveBeenCalled();
    });
  });

  async function sendFiveAnswers() {
    mockSendAnswer.mockResolvedValue(makeResponse(1));
    render(<ChatWindow sessionId="test-id" initialQuestion={mockQuestion} sessionData={mockSessionData} />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText("Type your answer... (Enter to send, Shift+Enter for new line)");
    for (let i = 0; i < 5; i++) {
      await waitFor(() => { expect(textarea).not.toBeDisabled(); });
      fireEvent.change(textarea, { target: { value: `Ответ ${i + 1}` } });
      fireEvent.keyDown(textarea, { key: "Enter" });
      if (i < 4) {
        await waitFor(() => { expect(textarea).not.toBeDisabled(); });
      }
    }
  }

  it("shows BottomSheet with SummaryView after finishing", async () => {
    await sendFiveAnswers();
    await waitFor(() => {
      expect(screen.getByTestId("bottom-sheet")).toBeDefined();
      expect(screen.getByTestId("summary-view")).toBeDefined();
      expect(screen.getByTestId("feedbacks-count").textContent).toBe("5");
    });
  });

  it("disables input area when finished", async () => {
    await sendFiveAnswers();
    await waitFor(() => {
      const disabledTextarea = screen.getByPlaceholderText("Interview finished");
      expect(disabledTextarea).toBeDisabled();
    });
  });

  it("toggles BottomSheet when handle bar clicked", async () => {
    await sendFiveAnswers();
    await waitFor(() => {
      expect(screen.getByTestId("bottom-sheet").getAttribute("data-open")).toBe("true");
    });

    fireEvent.click(screen.getByText("Interview results"));

    await waitFor(() => {
      expect(screen.getByTestId("bottom-sheet").getAttribute("data-open")).toBe("false");
    });
  });
});
