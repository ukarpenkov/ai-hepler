import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";

const sessions = [
  { id: "1", title: "Frontend Developer", date: "22 июня 2026" },
  { id: "2", title: "Product Manager", date: "21 июня 2026" },
];

describe("Sidebar", () => {
  it("renders without errors", () => {
    render(<Sidebar isOpen={true} sessions={sessions} />);
    expect(screen.getByText("История сессий")).toBeDefined();
  });

  it("displays session list", () => {
    render(<Sidebar isOpen={true} sessions={sessions} />);
    expect(screen.getByText("Frontend Developer")).toBeDefined();
    expect(screen.getByText("Product Manager")).toBeDefined();
    expect(screen.getByText("22 июня 2026")).toBeDefined();
  });

  it("applies classes based on isOpen", () => {
    const { container, rerender } = render(
      <Sidebar isOpen={true} sessions={sessions} />
    );
    const aside = container.querySelector("aside")!;
    expect(aside.className).toContain("translate-x-0");

    rerender(<Sidebar isOpen={false} sessions={sessions} />);
    expect(aside.className).toContain("-translate-x-full");
  });
});
