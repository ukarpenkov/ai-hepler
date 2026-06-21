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
    fireEvent.change(textarea, { target: { value: "Frontend Dev" } });
    fireEvent.click(screen.getByText("Начать интервью"));
    expect(handleSubmit).toHaveBeenCalledWith("Frontend Dev");
  });

  it("displays loading state", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={true} />);
    expect(screen.getByText("Загрузка...")).toBeDefined();
  });
});
