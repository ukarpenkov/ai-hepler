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

vi.mock("@/components/ChatWindow", () => ({
  default: ({ sessionId }: { sessionId: string }) => (
    <div data-testid="chat-window">ChatWindow: {sessionId}</div>
  ),
}));

describe("InterviewPage", () => {
  it("renders ChatWindow", () => {
    render(<InterviewPage />);
    expect(screen.getByTestId("chat-window")).toBeDefined();
  });
});
