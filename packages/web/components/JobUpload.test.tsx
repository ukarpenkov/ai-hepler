import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import JobUpload from "./JobUpload";
import { Wrapper } from "../test-utils";

describe("JobUpload", () => {
  it("renders textarea and button", () => {
    render(<JobUpload onSubmit={vi.fn()} isLoading={false} />, { wrapper: Wrapper });

    expect(screen.getByPlaceholderText("Paste the job description...")).toBeDefined();
    expect(screen.getByText("Start interview")).toBeDefined();
  });

  it("button is disabled when text is empty", () => {
    render(<JobUpload onSubmit={vi.fn()} isLoading={false} />, { wrapper: Wrapper });

    const button = screen.getByRole("button", { name: /Start interview/ });
    expect(button).toBeDisabled();
  });

  it("button is enabled when text >= 50 characters", () => {
    render(<JobUpload onSubmit={vi.fn()} isLoading={false} />, { wrapper: Wrapper });

    const textarea = screen.getByPlaceholderText("Paste the job description...");
    fireEvent.change(textarea, { target: { value: "a".repeat(50) } });

    const button = screen.getByRole("button", { name: /Start interview/ });
    expect(button).not.toBeDisabled();
  });

  it("calls onSubmit when button is clicked", () => {
    const onSubmit = vi.fn();
    render(<JobUpload onSubmit={onSubmit} isLoading={false} />, { wrapper: Wrapper });

    const textarea = screen.getByPlaceholderText("Paste the job description...");
    fireEvent.change(textarea, { target: { value: "a".repeat(50) } });

    const button = screen.getByRole("button", { name: /Start interview/ });
    fireEvent.click(button);

    expect(onSubmit).toHaveBeenCalledWith("a".repeat(50));
  });
});
