import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateMemoryTool } from "../update-memory.tool.js";

vi.mock("../../storage/session-store.js", () => ({
  getSession: vi.fn(),
  updateSession: vi.fn(),
}));

import { getSession, updateSession } from "../../storage/session-store.js";

describe("updateMemoryTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds topic to weakSkills when score < 5", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "s1",
      jobProfile: null,
      history: [],
      weakSkills: [],
      createdAt: "",
      updatedAt: "",
    });
    vi.mocked(updateSession).mockResolvedValue(undefined);

    const result = await updateMemoryTool({
      sessionId: "s1",
      evaluation: { score: 3, accuracy: 1, depth: 1, relevance: 1, examples: 0, strengths: [], weaknesses: [], recommendation: "", antiCheatFlags: [], perfectAnswerSummary: "" },
      questionTopic: "typescript",
      redis: {} as never,
    });

    expect(result.weakSkills).toContain("typescript");
    expect(result.answeredTopics).toContain("typescript");
    expect(updateSession).toHaveBeenCalledWith({}, "s1", { weakSkills: ["typescript"] });
  });

  it("removes topic from weakSkills when score >= 7", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "s1",
      jobProfile: null,
      history: [],
      weakSkills: ["typescript", "react"],
      createdAt: "",
      updatedAt: "",
    });
    vi.mocked(updateSession).mockResolvedValue(undefined);

    const result = await updateMemoryTool({
      sessionId: "s1",
      evaluation: { score: 8, accuracy: 3, depth: 2, relevance: 2, examples: 1, strengths: [], weaknesses: [], recommendation: "", antiCheatFlags: [], perfectAnswerSummary: "" },
      questionTopic: "typescript",
      redis: {} as never,
    });

    expect(result.weakSkills).not.toContain("typescript");
    expect(result.weakSkills).toContain("react");
  });

  it("does not change weakSkills when score 5-6", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "s1",
      jobProfile: null,
      history: [],
      weakSkills: ["react"],
      createdAt: "",
      updatedAt: "",
    });
    vi.mocked(updateSession).mockResolvedValue(undefined);

    const result = await updateMemoryTool({
      sessionId: "s1",
      evaluation: { score: 6, accuracy: 2, depth: 2, relevance: 1, examples: 1, strengths: [], weaknesses: [], recommendation: "", antiCheatFlags: [], perfectAnswerSummary: "" },
      questionTopic: "typescript",
      redis: {} as never,
    });

    expect(result.weakSkills).toEqual(["react"]);
  });
});
