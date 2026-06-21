import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BurgerMenu from "./BurgerMenu";

describe("BurgerMenu", () => {
  it("renders without errors", () => {
    render(<BurgerMenu isOpen={false} onClick={() => {}} />);
    expect(screen.getByLabelText("Toggle menu")).toBeDefined();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<BurgerMenu isOpen={false} onClick={handleClick} />);
    fireEvent.click(screen.getByLabelText("Toggle menu"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("applies active classes when isOpen=true", () => {
    const { container } = render(<BurgerMenu isOpen={true} onClick={() => {}} />);
    const spans = container.querySelectorAll("span");
    expect(spans[0].className).toContain("rotate-45");
    expect(spans[1].className).toContain("opacity-0");
    expect(spans[2].className).toContain("-rotate-45");
  });
});
