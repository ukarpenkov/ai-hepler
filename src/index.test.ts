import { describe, it, expect } from "vitest";

describe("index", { timeout: 15000 }, () => {
  it("exports agents", async () => {
    const mod = await import("./index.js");
    expect(mod.jobParserAgent).toBeDefined();
    expect(mod.interviewerAgent).toBeDefined();
    expect(mod.evaluatorAgent).toBeDefined();
    expect(mod.coachAgent).toBeDefined();
    expect(mod.memoryAgent).toBeDefined();
    expect(mod.interviewPipeline).toBeDefined();
    expect(mod.jobParserRunner).toBeDefined();
    expect(mod.interviewRunner).toBeDefined();
    expect(mod.sessionService).toBeDefined();
  });

  it("exports tools", async () => {
    const mod = await import("./index.js");
    expect(mod.parseJobTool).toBeDefined();
    expect(mod.generateQuestionTool).toBeDefined();
    expect(mod.evaluateAnswerTool).toBeDefined();
    expect(mod.updateMemoryTool).toBeDefined();
    expect(mod.fetchWeakTopicsTool).toBeDefined();
  });

  it("exports storage", async () => {
    const mod = await import("./index.js");
    expect(mod.createRedisClient).toBeDefined();
    expect(mod.closeRedisClient).toBeDefined();
    expect(mod.createSession).toBeDefined();
    expect(mod.getSession).toBeDefined();
    expect(mod.updateSession).toBeDefined();
    expect(mod.deleteSession).toBeDefined();
  });
});
