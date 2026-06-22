import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import InterviewPage from "../page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      const params: Record<string, string> = {
        sessionId: "test-session-id",
        question: "Расскажите о себе",
        topic: "Введение",
        difficulty: "easy",
      };
      return params[key];
    },
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("@/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock("@/components/ChatWindow", () => ({
  default: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="chat-window">ChatWindow: {sessionId}</div>
  ),
}));

vi.mock("@/lib/session-store", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

describe("InterviewPage", () => {
  it("renders ChatWindow", () => {
    render(<InterviewPage />);
    expect(screen.getByTestId("chat-window")).toBeDefined();
  });

  it("renders Header", () => {
    render(<InterviewPage />);
    expect(screen.getByTestId("header")).toBeDefined();
  });
});
