import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "./Header";

vi.mock("./ThemeToggle", () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock("./BurgerMenu", () => ({
  default: ({
    isOpen,
    onClick,
  }: {
    isOpen: boolean;
    onClick: () => void;
  }) => (
    <button data-testid="burger-menu" data-is-open={isOpen} onClick={onClick} />
  ),
}));

describe("Header", () => {
  it("renders without errors", () => {
    render(<Header isSidebarOpen={false} onMenuToggle={() => {}} />);
    expect(screen.getByText("AI Interview")).toBeDefined();
  });

  it("displays logo and text", () => {
    render(<Header isSidebarOpen={false} onMenuToggle={() => {}} />);
    expect(screen.getByText("AI")).toBeDefined();
    expect(screen.getByText("AI Interview")).toBeDefined();
  });

  it("contains ThemeToggle and BurgerMenu", () => {
    render(<Header isSidebarOpen={false} onMenuToggle={() => {}} />);
    expect(screen.getByTestId("theme-toggle")).toBeDefined();
    expect(screen.getByTestId("burger-menu")).toBeDefined();
  });
});
