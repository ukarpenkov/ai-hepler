import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "../layout";

vi.mock("next/font/google", () => ({
  Inter: () => ({
    className: "inter",
  }),
}));

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    expect(screen.getByText("Test content")).toBeDefined();
  });
});
