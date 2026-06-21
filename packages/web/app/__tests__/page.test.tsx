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

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Sidebar", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="sidebar" data-is-open={props.isOpen} />
  ),
}));

vi.mock("@/components/JobInputForm", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="job-input-form" data-is-loading={props.isLoading} />
  ),
}));

describe("Home", () => {
  it("renders without errors", () => {
    render(<Home />);
    expect(screen.getByTestId("header")).toBeDefined();
  });

  it("contains Header", () => {
    render(<Home />);
    expect(screen.getByTestId("header")).toBeDefined();
  });

  it("contains Sidebar", () => {
    render(<Home />);
    expect(screen.getByTestId("sidebar")).toBeDefined();
  });

  it("contains JobInputForm", () => {
    render(<Home />);
    expect(screen.getByTestId("job-input-form")).toBeDefined();
  });

  it("renders overlay when sidebar is open", () => {
    render(<Home />);
    const overlay = document.querySelector(".fixed.inset-0");
    expect(overlay).toBeDefined();
  });
});
