import { describe, it, expect } from "vitest";
import { interviewerAgent } from "../interviewer.agent.js";
import { LlmAgent } from "@google/adk";

describe("interviewerAgent", () => {
  it("is an LlmAgent instance", () => {
    expect(interviewerAgent).toBeInstanceOf(LlmAgent);
  });

  it("has correct name", () => {
    expect(interviewerAgent.name).toBe("InterviewerAgent");
  });

  it("has description", () => {
    expect(interviewerAgent.description).toContain(
      "Generates personalized interview questions",
    );
  });

  it("has generateQuestionTool in tools", () => {
    const tools = interviewerAgent.tools || [];
    expect(tools.length).toBeGreaterThan(0);
  });

  it("has correct outputKey", () => {
    expect(interviewerAgent.outputKey).toBe("currentQuestion");
  });
});
