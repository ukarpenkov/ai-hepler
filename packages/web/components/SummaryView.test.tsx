import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SummaryView, { type QuestionFeedback } from "./SummaryView";

const mockFeedbacks: QuestionFeedback[] = [
  {
    number: 1,
    score: 7,
    strengths: ["Хорошее знание React"],
    weaknesses: ["Нет опыта с TypeScript"],
    recommendation: "Изучите TypeScript",
    analysis: "Ответ был хорошим, но не хватало глубины.",
    improved: "Улучшенный ответ: React + TypeScript — мощная комбинация.",
    tips: ["Практикуйтесь в TypeScript"],
    answer: "Я знаю React и использую его в проектах.",
  },
  {
    number: 2,
    score: 5,
    strengths: ["Базовые знания"],
    weaknesses: ["Поверхностный ответ"],
    recommendation: "Углубите знания",
    analysis: "Ответ был слишком кратким.",
    improved: "Улучшенный ответ: раскройте тему подробнее.",
    tips: ["Говорите подробнее"],
    answer: "TypeScript — это типизация для JavaScript.",
  },
];

describe("SummaryView", () => {
  it("renders without errors", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />);
    expect(screen.getByText(/Интервью завершено/)).toBeDefined();
  });

  it("displays stats grid with correct values", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />);
    expect(screen.getByText("6.0")).toBeDefined();
    expect(screen.getAllByText("7").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("Средний")).toBeDefined();
    expect(screen.getByText("Лучший")).toBeDefined();
    expect(screen.getByText("Худший")).toBeDefined();
  });

  it("displays question navigation", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />);
    expect(screen.getByText("Вопрос 1")).toBeDefined();
    expect(screen.getByText("Вопрос 2")).toBeDefined();
  });

  it("switches question on button click", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />);
    fireEvent.click(screen.getByText("Вопрос 2"));
    expect(screen.getByText("Вопрос 2 / 2")).toBeDefined();
  });

  it("displays all feedback sections for active question", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />);
    expect(screen.getByText("Ваш ответ")).toBeDefined();
    expect(screen.getByText("Сильные стороны")).toBeDefined();
    expect(screen.getByText("Слабые стороны")).toBeDefined();
    expect(screen.getByText("Рекомендация")).toBeDefined();
    expect(screen.getByText("Разбор ответа")).toBeDefined();
    expect(screen.getByText("Улучшенный ответ")).toBeDefined();
    expect(screen.getByText("Советы")).toBeDefined();
  });

  it("displays correct score for active question", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />);
    expect(screen.getAllByText("7").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("/ 10")).toBeDefined();
  });

  it("shows correct total questions in banner", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />);
    expect(screen.getByText(/Интервью завершено!/)).toBeDefined();
  });
});
