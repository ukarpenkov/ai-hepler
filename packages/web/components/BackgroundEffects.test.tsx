import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import BackgroundEffects from "./BackgroundEffects";

describe("BackgroundEffects", () => {
  it("renders without errors", () => {
    const { container } = render(<BackgroundEffects />);
    expect(container.firstChild).toBeDefined();
  });

  it("contains two decorative elements", () => {
    const { container } = render(<BackgroundEffects />);
    const divs = container.querySelectorAll("div");
    expect(divs.length).toBe(2);
  });
});
