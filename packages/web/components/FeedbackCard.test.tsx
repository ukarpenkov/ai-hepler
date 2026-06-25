import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeedbackCard from "../components/FeedbackCard";
import type { EvaluationResult, CoachResult } from "@/lib/types";
import { Wrapper } from "../test-utils";

const mockEvaluation: EvaluationResult = {
  score: 7,
  strengths: ["Отличная структура ответа", "Хорошие примеры"],
  weaknesses: ["Не хватило деталей"],
  recommendation: "Добавьте больше конкретики",
};

const mockCoach: CoachResult = {
  explanation: "Ваш ответ был хорош, но можно улучшить",
  improvedAnswer: "Лучший ответ включает...",
  tips: ["Используйте примеры", "Будьте конкретнее"],
};

describe("FeedbackCard", () => {
  it("renders score", () => {
    render(<FeedbackCard evaluation={mockEvaluation} coach={mockCoach} />, { wrapper: Wrapper });
    expect(screen.getByText("7")).toBeDefined();
    expect(screen.getByText("/ 10")).toBeDefined();
  });

  it("renders strengths and weaknesses", () => {
    render(<FeedbackCard evaluation={mockEvaluation} coach={mockCoach} />, { wrapper: Wrapper });
    expect(screen.getByText("Отличная структура ответа")).toBeDefined();
    expect(screen.getByText("Хорошие примеры")).toBeDefined();
    expect(screen.getByText("Не хватило деталей")).toBeDefined();
  });

  it("renders coach explanation", () => {
    render(<FeedbackCard evaluation={mockEvaluation} coach={mockCoach} />, { wrapper: Wrapper });
    expect(screen.getByText("Ваш ответ был хорош, но можно улучшить")).toBeDefined();
  });

  it("renders tips", () => {
    render(<FeedbackCard evaluation={mockEvaluation} coach={mockCoach} />, { wrapper: Wrapper });
    expect(screen.getByText("Используйте примеры")).toBeDefined();
    expect(screen.getByText("Будьте конкретнее")).toBeDefined();
  });
});
