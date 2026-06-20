import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import JobUpload from "../components/JobUpload";

describe("JobUpload", () => {
  it("renders textarea and button", () => {
    render(<JobUpload onSubmit={vi.fn()} isLoading={false} />);

    expect(screen.getByPlaceholderText("Вставьте текст вакансии...")).toBeDefined();
    expect(screen.getByText("Начать интервью")).toBeDefined();
  });

  it("button is disabled when text is empty", () => {
    render(<JobUpload onSubmit={vi.fn()} isLoading={false} />);

    const button = screen.getByText("Начать интервью");
    expect(button).toBeDisabled();
  });

  it("button is enabled when text >= 50 characters", () => {
    render(<JobUpload onSubmit={vi.fn()} isLoading={false} />);

    const textarea = screen.getByPlaceholderText("Вставьте текст вакансии...");
    fireEvent.change(textarea, { target: { value: "a".repeat(50) } });

    const button = screen.getByText("Начать интервью");
    expect(button).not.toBeDisabled();
  });

  it("calls onSubmit when button is clicked", () => {
    const onSubmit = vi.fn();
    render(<JobUpload onSubmit={onSubmit} isLoading={false} />);

    const textarea = screen.getByPlaceholderText("Вставьте текст вакансии...");
    fireEvent.change(textarea, { target: { value: "a".repeat(50) } });

    const button = screen.getByText("Начать интервью");
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith("a".repeat(50));
  });
});
