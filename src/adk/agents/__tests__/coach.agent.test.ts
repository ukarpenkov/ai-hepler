import { describe, it, expect } from "vitest";
import { coachAgent } from "../coach.agent.js";
import { LlmAgent } from "@google/adk";

describe("coachAgent", () => {
  it("is an LlmAgent instance", () => {
    expect(coachAgent).toBeInstanceOf(LlmAgent);
  });

  it("has correct name", () => {
    expect(coachAgent.name).toBe("CoachAgent");
  });

  it("has description", () => {
    expect(coachAgent.description).toContain(
      "Provides coaching feedback",
    );
  });

  it("has correct outputKey", () => {
    expect(coachAgent.outputKey).toBe("coachFeedback");
  });

  it("has coachAnswerTool in tools", () => {
    const tools = coachAgent.tools || [];
    expect(tools.length).toBeGreaterThan(0);
  });
});
