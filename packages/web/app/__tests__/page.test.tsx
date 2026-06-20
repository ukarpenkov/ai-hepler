import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  parseJob: vi.fn(),
  startInterview: vi.fn(),
}));

describe("Home", () => {
  it("renders heading", () => {
    render(<Home />);
    expect(screen.getByText("AI Interview Simulator")).toBeDefined();
  });

  it("renders JobUpload", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText("Вставьте текст вакансии...")).toBeDefined();
  });
});
