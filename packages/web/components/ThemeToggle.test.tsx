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
    const toggle = screen.getByLabelText("Toggle theme");
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("saves theme to localStorage", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByLabelText("Toggle theme");
    fireEvent.click(toggle);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("applies dark class when theme is dark", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByLabelText("Toggle theme");
    expect(toggle.className).not.toContain("theme-switch--dark");
    fireEvent.click(toggle);
    expect(toggle.className).toContain("theme-switch--dark");
  });
});
