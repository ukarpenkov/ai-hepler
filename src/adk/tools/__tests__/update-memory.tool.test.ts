import { describe, it, expect, beforeEach } from "vitest";
import { updateMemoryTool } from "../update-memory.tool.js";
import { FunctionTool } from "@google/adk";

describe("updateMemoryTool", () => {
  beforeEach(() => {});

  it("is a FunctionTool instance", () => {
    expect(updateMemoryTool).toBeInstanceOf(FunctionTool);
  });

  it("has correct name", () => {
    expect(updateMemoryTool.name).toBe("updateMemory");
  });

  it("has description", () => {
    expect(updateMemoryTool.description).toContain(
      "Updates user memory with weak skills",
    );
  });

  it("adds topic to weakSkills when score < 5", async () => {
    const result = await updateMemoryTool.runAsync({
      args: {
        evaluation: {
          score: 3,
          strengths: [],
          weaknesses: ["Weak in topic"],
        },
        topic: "System Design",
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.weakSkills).toContain("System Design");
    expect(resultObj.answeredTopics).toContain("System Design");
  });

  it("does not add topic to weakSkills when score >= 5", async () => {
    const result = await updateMemoryTool.runAsync({
      args: {
        evaluation: {
          score: 7,
          strengths: ["Good"],
          weaknesses: [],
        },
        topic: "System Design",
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.weakSkills).not.toContain("System Design");
    expect(resultObj.answeredTopics).toContain("System Design");
  });

  it("removes topic from weakSkills when score >= 7", async () => {
    const result = await updateMemoryTool.runAsync({
      args: {
        evaluation: {
          score: 8,
          strengths: ["Excellent"],
          weaknesses: [],
        },
        topic: "System Design",
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.weakSkills).not.toContain("System Design");
  });

  it("always adds topic to answeredTopics", async () => {
    const result = await updateMemoryTool.runAsync({
      args: {
        evaluation: {
          score: 5,
          strengths: [],
          weaknesses: [],
        },
        topic: "REST API",
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.answeredTopics).toContain("REST API");
  });

  it("handles edge case score of 4 (should add to weakSkills)", async () => {
    const result = await updateMemoryTool.runAsync({
      args: {
        evaluation: {
          score: 4,
          strengths: [],
          weaknesses: ["Not great"],
        },
        topic: "Testing",
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.weakSkills).toContain("Testing");
  });

  it("handles edge case score of 6 (should not add to weakSkills)", async () => {
    const result = await updateMemoryTool.runAsync({
      args: {
        evaluation: {
          score: 6,
          strengths: [],
          weaknesses: [],
        },
        topic: "Testing",
      },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.weakSkills).not.toContain("Testing");
  });
});
