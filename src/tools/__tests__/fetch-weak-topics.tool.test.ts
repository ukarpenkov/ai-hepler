import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWeakTopicsTool } from "../fetch-weak-topics.tool.js";

vi.mock("../../storage/session-store.js", () => ({
  getSession: vi.fn(),
}));

import { getSession } from "../../storage/session-store.js";

describe("fetchWeakTopicsTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns weakSkills when session exists", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "s1",
      jobProfile: null,
      history: [],
      weakSkills: ["typescript", "react"],
      createdAt: "",
      updatedAt: "",
    });

    const result = await fetchWeakTopicsTool({ sessionId: "s1", redis: {} as never });
    expect(result).toEqual(["typescript", "react"]);
  });

  it("returns empty array when session not found", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await fetchWeakTopicsTool({ sessionId: "s1", redis: {} as never });
    expect(result).toEqual([]);
  });

  it("returns empty array when weakSkills is empty", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "s1",
      jobProfile: null,
      history: [],
      weakSkills: [],
      createdAt: "",
      updatedAt: "",
    });

    const result = await fetchWeakTopicsTool({ sessionId: "s1", redis: {} as never });
    expect(result).toEqual([]);
  });
});
