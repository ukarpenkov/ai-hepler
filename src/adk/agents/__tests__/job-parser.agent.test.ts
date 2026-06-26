import { describe, it, expect } from "vitest";
import { jobParserAgent } from "../job-parser.agent.js";
import { LlmAgent } from "@google/adk";

describe("jobParserAgent", () => {
  it("is an LlmAgent instance", () => {
    expect(jobParserAgent).toBeInstanceOf(LlmAgent);
  });

  it("has correct name", () => {
    expect(jobParserAgent.name).toBe("JobParserAgent");
  });

  it("has description", () => {
    expect(jobParserAgent.description).toContain(
      "Parses job descriptions",
    );
  });

  it("has parseJobTool in tools", () => {
    const tools = jobParserAgent.tools || [];
    expect(tools.length).toBeGreaterThan(0);
  });

  it("has correct outputKey", () => {
    expect(jobParserAgent.outputKey).toBe("parsedJob");
  });
});
