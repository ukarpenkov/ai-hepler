import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BottomSheet from "./BottomSheet";

describe("BottomSheet", () => {
  it("renders without errors", () => {
    render(
      <BottomSheet isOpen={true} onToggle={() => {}} title="Test Title">
        <div>Content</div>
      </BottomSheet>
    );
    expect(screen.getByText("Test Title")).toBeDefined();
  });

  it("displays handle bar and title", () => {
    render(
      <BottomSheet isOpen={true} onToggle={() => {}} title="Результаты">
        <div>Content</div>
      </BottomSheet>
    );
    expect(screen.getByText("Результаты")).toBeDefined();
    expect(screen.getByRole("button", { name: "Результаты" })).toBeDefined();
  });

  it("calls onToggle when handle bar is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <BottomSheet isOpen={true} onToggle={handleToggle} title="Test">
        <div>Content</div>
      </BottomSheet>
    );
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(handleToggle).toHaveBeenCalledOnce();
  });

  it("renders children when isOpen=true", () => {
    render(
      <BottomSheet isOpen={true} onToggle={() => {}} title="Test">
        <div>Visible Content</div>
      </BottomSheet>
    );
    expect(screen.getByText("Visible Content")).toBeDefined();
  });

  it("does not render children when isOpen=false", () => {
    render(
      <BottomSheet isOpen={false} onToggle={() => {}} title="Test">
        <div>Hidden Content</div>
      </BottomSheet>
    );
    expect(screen.queryByText("Hidden Content")).toBeNull();
  });

  it("applies full height when isOpen=true", () => {
    const { container } = render(
      <BottomSheet isOpen={true} onToggle={() => {}} title="Test">
        <div>Content</div>
      </BottomSheet>
    );
    const sheet = container.firstChild as HTMLElement;
    expect(sheet.style.height).toContain("100%");
  });

  it("applies collapsed height when isOpen=false", () => {
    const { container } = render(
      <BottomSheet isOpen={false} onToggle={() => {}} title="Test">
        <div>Content</div>
      </BottomSheet>
    );
    const sheet = container.firstChild as HTMLElement;
    expect(sheet.style.height).toContain("64px");
  });
});
