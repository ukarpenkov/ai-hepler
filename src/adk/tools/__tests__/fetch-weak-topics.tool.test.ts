import { describe, it, expect } from "vitest";
import { fetchWeakTopicsTool } from "../fetch-weak-topics.tool.js";
import { FunctionTool } from "@google/adk";

describe("fetchWeakTopicsTool", () => {
  it("is a FunctionTool instance", () => {
    expect(fetchWeakTopicsTool).toBeInstanceOf(FunctionTool);
  });

  it("has correct name", () => {
    expect(fetchWeakTopicsTool.name).toBe("fetchWeakTopics");
  });

  it("has description", () => {
    expect(fetchWeakTopicsTool.description).toContain(
      "Fetches the list of weak topics",
    );
  });

  it("returns weakSkills array", async () => {
    const result = await fetchWeakTopicsTool.runAsync({
      args: { sessionId: "test-session-id" },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.weakSkills).toBeDefined();
    expect(Array.isArray(resultObj.weakSkills)).toBe(true);
  });

  it("returns empty array by default", async () => {
    const result = await fetchWeakTopicsTool.runAsync({
      args: { sessionId: "test-session-id" },
    } as never);

    const resultObj = result as Record<string, unknown>;
    expect(resultObj.weakSkills).toEqual([]);
  });
});
