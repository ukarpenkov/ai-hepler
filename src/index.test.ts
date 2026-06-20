import { describe, it, expect } from "vitest";

describe("index", () => {
  it("exports agents", async () => {
    const mod = await import("./index.js");
    expect(mod.jobParserAgent).toBeDefined();
    expect(mod.interviewerAgent).toBeDefined();
    expect(mod.evaluatorAgent).toBeDefined();
    expect(mod.coachAgent).toBeDefined();
    expect(mod.memoryAgent).toBeDefined();
    expect(mod.orchestrator).toBeDefined();
  });

  it("exports tools", async () => {
    const mod = await import("./index.js");
    expect(mod.parseJobDescriptionTool).toBeDefined();
    expect(mod.generateQuestionTool).toBeDefined();
    expect(mod.evaluateAnswerTool).toBeDefined();
    expect(mod.updateMemoryTool).toBeDefined();
    expect(mod.fetchWeakTopicsTool).toBeDefined();
  });

  it("exports storage", async () => {
    const mod = await import("./index.js");
    expect(mod.redis).toBeDefined();
    expect(mod.sessionStore).toBeDefined();
  });
});
