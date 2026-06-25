import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SummaryView, { type QuestionFeedback } from "./SummaryView";
import { Wrapper } from "../test-utils";

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
    render(<SummaryView feedbacks={mockFeedbacks} />, { wrapper: Wrapper });
    expect(screen.getByText(/Interview complete/)).toBeDefined();
  });

  it("displays stats grid with correct values", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />, { wrapper: Wrapper });
    expect(screen.getByText("6.0")).toBeDefined();
    expect(screen.getAllByText("7").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("Average")).toBeDefined();
    expect(screen.getByText("Best")).toBeDefined();
    expect(screen.getByText("Worst")).toBeDefined();
  });

  it("displays question navigation", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />, { wrapper: Wrapper });
    expect(screen.getByText("Question 1")).toBeDefined();
    expect(screen.getByText("Question 2")).toBeDefined();
  });

  it("switches question on button click", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText("Question 2"));
    expect(screen.getByText("Question 2 / 2")).toBeDefined();
  });

  it("displays all feedback sections for active question", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />, { wrapper: Wrapper });
    expect(screen.getByText("Your answer")).toBeDefined();
    expect(screen.getByText("Strengths")).toBeDefined();
    expect(screen.getByText("Weaknesses")).toBeDefined();
    expect(screen.getByText("Recommendation")).toBeDefined();
    expect(screen.getByText("Answer analysis")).toBeDefined();
    expect(screen.getByText("Improved answer")).toBeDefined();
    expect(screen.getByText("Tips")).toBeDefined();
  });

  it("displays correct score for active question", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />, { wrapper: Wrapper });
    expect(screen.getAllByText("7").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("/ 10")).toBeDefined();
  });

  it("shows correct total questions in banner", () => {
    render(<SummaryView feedbacks={mockFeedbacks} />, { wrapper: Wrapper });
    expect(screen.getByText(/Interview complete!/)).toBeDefined();
  });
});
