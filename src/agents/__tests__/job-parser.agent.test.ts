import { describe, it, expect, vi, beforeEach } from "vitest";
import { jobParserAgent } from "../job-parser.agent.js";
import type { AgentInput } from "../types.js";

vi.mock("../../tools/parse-job-description.tool.js", () => ({
  parseJobDescriptionTool: vi.fn(),
}));

import { parseJobDescriptionTool } from "../../tools/parse-job-description.tool.js";

describe("jobParserAgent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns AgentOutput with parsed job on valid input", async () => {
    const mockParsed = {
      role: "Frontend Developer",
      level: "senior" as const,
      skills: ["React", "TypeScript"],
      softSkills: [],
      keywords: ["frontend"],
      domain: "web",
      minYearsExperience: null,
    };
    vi.mocked(parseJobDescriptionTool).mockResolvedValue(mockParsed);

    const input: AgentInput = {
      sessionId: "test-session",
      content: "We are looking for a senior frontend developer with React and TypeScript experience for our web platform.",
    };

    const result = await jobParserAgent(input, { apiKey: "test-key", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" });

    expect(result.agentName).toBe("job-parser");
    expect(JSON.parse(result.result)).toEqual(mockParsed);
    expect(parseJobDescriptionTool).toHaveBeenCalledOnce();
  });

  it("throws validation error for short text", async () => {
    const input: AgentInput = {
      sessionId: "test-session",
      content: "short",
    };

    await expect(jobParserAgent(input, { apiKey: "test-key", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" })).rejects.toThrow(
      "Invalid job text"
    );
  });
});
