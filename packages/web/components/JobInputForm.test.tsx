import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import JobInputForm from "./JobInputForm";

describe("JobInputForm", () => {
  it("renders without errors", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={false} />);
    expect(screen.getByText("Вставте текст вакансии.")).toBeDefined();
  });

  it("displays heading and textarea", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={false} />);
    expect(screen.getByText("Вставте текст вакансии.")).toBeDefined();
    expect(
      screen.getByPlaceholderText("Вставьте текст вакансии...")
    ).toBeDefined();
  });

  it("calls onSubmit with text when button clicked", () => {
    const handleSubmit = vi.fn();
    render(<JobInputForm onSubmit={handleSubmit} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Вставьте текст вакансии...");
    fireEvent.change(textarea, { target: { value: "a".repeat(50) } });
    fireEvent.click(screen.getByRole("button", { name: /Начать интервью/ }));
    expect(handleSubmit).toHaveBeenCalledWith("a".repeat(50));
  });

  it("shows error when text is too short", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={false} />);
    const textarea = screen.getByPlaceholderText("Вставьте текст вакансии...");
    fireEvent.change(textarea, { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /Начать интервью/ }));
    expect(screen.getByText("Минимум 50 символов")).toBeDefined();
  });

  it("displays loading state", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={true} />);
    expect(screen.getByText("Загрузка...")).toBeDefined();
  });
});
