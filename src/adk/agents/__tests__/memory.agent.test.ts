import { describe, it, expect } from "vitest";
import { memoryAgent } from "../memory.agent.js";
import { LlmAgent } from "@google/adk";

describe("memoryAgent", () => {
  it("is an LlmAgent instance", () => {
    expect(memoryAgent).toBeInstanceOf(LlmAgent);
  });

  it("has correct name", () => {
    expect(memoryAgent.name).toBe("MemoryAgent");
  });

  it("has description", () => {
    expect(memoryAgent.description).toContain("Updates user memory");
  });

  it("has updateMemoryTool in tools", () => {
    const tools = memoryAgent.tools || [];
    expect(tools.length).toBeGreaterThan(0);
  });

  it("has correct outputKey", () => {
    expect(memoryAgent.outputKey).toBe("memoryUpdate");
  });
});
