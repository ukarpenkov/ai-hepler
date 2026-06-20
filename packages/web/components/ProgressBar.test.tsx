import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "../components/ProgressBar";

describe("ProgressBar", () => {
  it("renders correct text", () => {
    render(<ProgressBar current={3} total={10} />);
    expect(screen.getByText("Вопрос 3 из 10")).toBeDefined();
  });

  it("renders correct width", () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    const progress = container.querySelector(".bg-blue-500") as HTMLElement;
    expect(progress.style.width).toBe("50%");
  });
});
