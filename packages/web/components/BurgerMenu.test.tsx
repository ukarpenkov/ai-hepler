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

  it("renders SVG with three paths", () => {
    const { container } = render(<BurgerMenu isOpen={false} onClick={() => {}} />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(3);
  });

  it("applies open animation styles when isOpen=true", () => {
    const { container } = render(<BurgerMenu isOpen={true} onClick={() => {}} />);
    const paths = container.querySelectorAll("path");
    expect(paths[0].getAttribute("stroke")).toContain("primary");
    expect(paths[0].getAttribute("style")).toContain("rotateZ(45deg)");
    expect(paths[1].getAttribute("style")).toContain("stroke-dashoffset: 40");
    expect(paths[2].getAttribute("style")).toContain("rotateZ(-45deg)");
  });

  it("applies closed animation styles when isOpen=false", () => {
    const { container } = render(<BurgerMenu isOpen={false} onClick={() => {}} />);
    const paths = container.querySelectorAll("path");
    expect(paths[0].getAttribute("style")).toContain("stroke-dashoffset: 25");
    expect(paths[1].getAttribute("style")).toContain("stroke-dashoffset: 0");
    expect(paths[2].getAttribute("style")).toContain("stroke-dashoffset: 60");
  });
});
