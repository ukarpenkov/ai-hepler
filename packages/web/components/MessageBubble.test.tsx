import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "../components/MessageBubble";

describe("MessageBubble", () => {
  it("renders user message on the right", () => {
    const { container } = render(<MessageBubble role="user" content="Hello" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("self-end");
    expect(screen.getByText("Hello")).toBeDefined();
  });

  it("renders assistant message on the left", () => {
    const { container } = render(<MessageBubble role="assistant" content="Hi there" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("self-start");
    expect(screen.getByText("Hi there")).toBeDefined();
  });

  it("displays timestamp when provided", () => {
    render(<MessageBubble role="user" content="Test" timestamp="12:00" />);
    expect(screen.getByText("12:00")).toBeDefined();
  });
});
