import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders without errors", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Toggle theme")).toBeDefined();
  });

  it("toggles theme on click", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle theme");
    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("saves theme to localStorage", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle theme");
    fireEvent.click(button);
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
