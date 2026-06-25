import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import JobInputForm from "./JobInputForm";
import { Wrapper } from "../test-utils";

describe("JobInputForm", () => {
  it("renders without errors", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={false} />, { wrapper: Wrapper });
    expect(screen.getByText("Paste the job description.")).toBeDefined();
  });

  it("displays heading and textarea", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={false} />, { wrapper: Wrapper });
    expect(screen.getByText("Paste the job description.")).toBeDefined();
    expect(
      screen.getByPlaceholderText("Paste the job description...")
    ).toBeDefined();
  });

  it("calls onSubmit with text when button clicked", () => {
    const handleSubmit = vi.fn();
    render(<JobInputForm onSubmit={handleSubmit} isLoading={false} />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText("Paste the job description...");
    fireEvent.change(textarea, { target: { value: "a".repeat(50) } });
    fireEvent.click(screen.getByRole("button", { name: /Start interview/ }));
    expect(handleSubmit).toHaveBeenCalledWith("a".repeat(50));
  });

  it("shows error when text is too short", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={false} />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText("Paste the job description...");
    fireEvent.change(textarea, { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /Start interview/ }));
    expect(screen.getByText("Minimum 50 characters")).toBeDefined();
  });

  it("displays loading state", () => {
    render(<JobInputForm onSubmit={() => {}} isLoading={true} />, { wrapper: Wrapper });
    expect(screen.getByText("Loading...")).toBeDefined();
  });
});
