import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { coachAnswerTool } from "../coach-answer.tool.js";
import { FunctionTool } from "@google/adk";

describe("coachAnswerTool", () => {
  const originalEnv = process.env;

  const jobProfile = {
    role: "Frontend Developer",
    level: "middle" as const,
    domain: "gaming",
    skills: ["React", "TypeScript"],
    keywords: ["performance"],
  };

  const evaluation = {
    score: 3,
    accuracy: 1,
    depth: 1,
    relevance: 1,
    examples: 0,
    strengths: ["Mentioned React DevTools"],
    weaknesses: ["No concrete debugging steps", "Missing optimization details"],
    recommendation: "Study React Profiler and memoization patterns",
    antiCheatFlags: ["generic_answer"],
    perfectAnswerSummary:
      "Explain profiling workflow, identify re-render/memory leaks, and apply memo/useMemo/virtualization",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    process.env.DEEPSEEK_API_KEY = "test-api-key";
    process.env.LLM_BASE_URL = "https://api.deepseek.com";
    process.env.LLM_MODEL = "deepseek-chat";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("is a FunctionTool instance", () => {
    expect(coachAnswerTool).toBeInstanceOf(FunctionTool);
  });

  it("has correct name", () => {
    expect(coachAnswerTool.name).toBe("coachAnswer");
  });

  it("returns fallback when LLM response is too short", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    explanation: "A",
                    improvedAnswer: "B",
                    tips: ["tip"],
                  }),
                },
              },
            ],
          }),
      }),
    );

    const result = await coachAnswerTool.runAsync({
      args: {
        question: "How would you debug a sluggish React stats component?",
        answer: "Use React DevTools and optimize renders.",
        evaluation,
        language: "en",
        jobProfile,
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(typeof resultObj.explanation).toBe("string");
    expect((resultObj.explanation as string).length).toBeGreaterThanOrEqual(40);
    expect((resultObj.improvedAnswer as string).length).toBeGreaterThanOrEqual(80);
    expect(Array.isArray(resultObj.tips)).toBe(true);
    expect((resultObj.tips as string[]).length).toBeGreaterThanOrEqual(2);
  });

  it("returns parsed LLM response when content is detailed enough", async () => {
    const detailed = {
      explanation:
        "Your answer scored 3/10 because it mentions React DevTools but lacks a structured debugging workflow, root-cause analysis, and concrete optimization techniques for frequent updates.",
      improvedAnswer:
        "I would start by reproducing the slowdown with React Profiler and Chrome Performance tabs to find unnecessary re-renders and expensive computations. Then I would stabilize props with memo/useMemo/useCallback, split state so unrelated stats do not rerender together, virtualize large player lists, throttle websocket updates, and verify improvements with before/after profiler captures.",
      tips: [
        "Profile first with React DevTools Profiler before changing code.",
        "Isolate high-frequency state updates from the rest of the UI tree.",
        "Use memoization and list virtualization for large live datasets.",
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: JSON.stringify(detailed) } }],
          }),
      }),
    );

    const result = await coachAnswerTool.runAsync({
      args: {
        question: "How would you debug a sluggish React stats component?",
        answer: "Use React DevTools and optimize renders.",
        evaluation,
        language: "en",
        jobProfile,
      },
    } as never);

    expect(result).toEqual(detailed);
  });
});
