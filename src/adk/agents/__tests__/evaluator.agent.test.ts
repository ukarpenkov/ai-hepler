import { describe, it, expect } from "vitest";
import { evaluatorAgent } from "../evaluator.agent.js";
import { LlmAgent } from "@google/adk";

describe("evaluatorAgent", () => {
  it("is an LlmAgent instance", () => {
    expect(evaluatorAgent).toBeInstanceOf(LlmAgent);
  });

  it("has correct name", () => {
    expect(evaluatorAgent.name).toBe("EvaluatorAgent");
  });

  it("has description", () => {
    expect(evaluatorAgent.description).toContain(
      "Evaluates interview answers",
    );
  });

  it("has evaluateAnswerTool in tools", () => {
    const tools = evaluatorAgent.tools || [];
    expect(tools.length).toBeGreaterThan(0);
  });

  it("has correct outputKey", () => {
    expect(evaluatorAgent.outputKey).toBe("evaluation");
  });
});
