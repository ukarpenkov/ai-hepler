import { describe, it, expect, beforeEach } from "vitest";
import { ToolAccessGuard, defaultGuard } from "./toolAccess.js";

describe("ToolAccessGuard", () => {
  let guard: ToolAccessGuard;

  beforeEach(() => {
    guard = new ToolAccessGuard();
    guard.registerTool("parseJobDescriptionTool", "system");
    guard.registerTool("generateQuestionTool", "system");
    guard.registerTool("evaluateAnswerTool", "system");
    guard.registerTool("updateMemoryTool", "memory");
    guard.registerTool("fetchWeakTopicsTool", "memory");
  });

  it("allows agent to access system tools", () => {
    expect(guard.checkAccess("parseJobDescriptionTool", "agent")).toBe(true);
    expect(guard.checkAccess("generateQuestionTool", "agent")).toBe(true);
    expect(guard.checkAccess("evaluateAnswerTool", "agent")).toBe(true);
  });

  it("blocks route from accessing system tools", () => {
    expect(guard.checkAccess("parseJobDescriptionTool", "route")).toBe(false);
    expect(guard.checkAccess("generateQuestionTool", "route")).toBe(false);
    expect(guard.checkAccess("evaluateAnswerTool", "route")).toBe(false);
  });

  it("allows route to access memory tools", () => {
    expect(guard.checkAccess("updateMemoryTool", "route")).toBe(true);
    expect(guard.checkAccess("fetchWeakTopicsTool", "route")).toBe(true);
  });

  it("blocks external from all tools", () => {
    expect(guard.checkAccess("parseJobDescriptionTool", "external")).toBe(false);
    expect(guard.checkAccess("updateMemoryTool", "external")).toBe(false);
    expect(guard.checkAccess("fetchWeakTopicsTool", "external")).toBe(false);
  });

  it("returns false for unknown tool", () => {
    expect(guard.checkAccess("unknownTool", "agent")).toBe(false);
  });

  it("registerTool adds new tool", () => {
    guard.registerTool("customTool", "system");
    expect(guard.checkAccess("customTool", "agent")).toBe(true);
    expect(guard.checkAccess("customTool", "route")).toBe(false);
  });

  it("hasTool checks existence", () => {
    expect(guard.hasTool("parseJobDescriptionTool")).toBe(true);
    expect(guard.hasTool("nonexistent")).toBe(false);
  });
});

describe("defaultGuard", () => {
  it("is an instance of ToolAccessGuard", () => {
    expect(defaultGuard).toBeInstanceOf(ToolAccessGuard);
  });

  it("has all 5 tools registered", () => {
    expect(defaultGuard.hasTool("parseJobDescriptionTool")).toBe(true);
    expect(defaultGuard.hasTool("generateQuestionTool")).toBe(true);
    expect(defaultGuard.hasTool("evaluateAnswerTool")).toBe(true);
    expect(defaultGuard.hasTool("updateMemoryTool")).toBe(true);
    expect(defaultGuard.hasTool("fetchWeakTopicsTool")).toBe(true);
  });
});
