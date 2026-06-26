import { describe, it, expect } from "vitest";
import { interviewPipeline } from "../pipeline.js";
import { SequentialAgent } from "@google/adk";
import { evaluatorAgent } from "../agents/evaluator.agent.js";
import { coachAgent } from "../agents/coach.agent.js";
import { memoryAgent } from "../agents/memory.agent.js";
import { interviewerAgent } from "../agents/interviewer.agent.js";

describe("interviewPipeline", () => {
  it("is a SequentialAgent instance", () => {
    expect(interviewPipeline).toBeInstanceOf(SequentialAgent);
  });

  it("has correct name", () => {
    expect(interviewPipeline.name).toBe("InterviewPipeline");
  });

  it("has correct subAgents in order", () => {
    const subAgents = interviewPipeline.subAgents || [];
    expect(subAgents.length).toBe(4);
    expect(subAgents[0]).toBe(evaluatorAgent);
    expect(subAgents[1]).toBe(coachAgent);
    expect(subAgents[2]).toBe(memoryAgent);
    expect(subAgents[3]).toBe(interviewerAgent);
  });

  it("has correct description", () => {
    expect(interviewPipeline.description).toContain(
      "Evaluates answer, provides coaching",
    );
  });
});
