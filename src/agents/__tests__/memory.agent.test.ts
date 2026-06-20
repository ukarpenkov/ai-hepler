import { describe, it, expect, vi, beforeEach } from "vitest";
import { memoryAgent } from "../memory.agent.js";
import type { EvaluationResult } from "../types.js";

vi.mock("../../tools/update-memory.tool.js", () => ({
  updateMemoryTool: vi.fn(),
}));

vi.mock("../../tools/fetch-weak-topics.tool.js", () => ({
  fetchWeakTopicsTool: vi.fn(),
}));

import { updateMemoryTool } from "../../tools/update-memory.tool.js";
import { fetchWeakTopicsTool } from "../../tools/fetch-weak-topics.tool.js";

describe("memoryAgent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns AgentOutput with MemoryUpdate", async () => {
    vi.mocked(updateMemoryTool).mockResolvedValue({
      weakSkills: ["React"],
      answeredTopics: ["React hooks"],
    });
    vi.mocked(fetchWeakTopicsTool).mockResolvedValue(["React"]);

    const evaluation: EvaluationResult = {
      score: 4,
      strengths: ["Good basics"],
      weaknesses: ["Needs depth"],
      recommendation: "Study more",
    };

    const result = await memoryAgent({
      sessionId: "s1",
      evaluation,
      questionTopic: "React hooks",
      redis: {} as never,
    });

    expect(result.agentName).toBe("memory");
    const parsed = JSON.parse(result.result);
    expect(parsed.weakSkills).toEqual(["React"]);
    expect(parsed.answeredTopics).toEqual(["React hooks"]);
  });
});
