import { describe, it, expect } from "vitest";
import { isValidSessionId, isValidJobText, isValidAnswer } from "../validators.js";

describe("isValidSessionId", () => {
  it("returns true for valid UUID v4", () => {
    expect(isValidSessionId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("returns false for invalid UUID", () => {
    expect(isValidSessionId("not-a-uuid")).toBe(false);
    expect(isValidSessionId("")).toBe(false);
    expect(isValidSessionId("550e8400-e29b-41d4-a716")).toBe(false);
  });
});

describe("isValidJobText", () => {
  it("returns false for empty string", () => {
    expect(isValidJobText("")).toBe(false);
  });

  it("returns false for short text", () => {
    expect(isValidJobText("short")).toBe(false);
  });

  it("returns true for text >= 50 characters", () => {
    expect(isValidJobText("a".repeat(50))).toBe(true);
  });

  it("returns true for text with whitespace >= 50 chars", () => {
    expect(isValidJobText(" ".repeat(40) + "a".repeat(10))).toBe(true);
  });
});

describe("isValidAnswer", () => {
  it("returns false for empty string", () => {
    expect(isValidAnswer("")).toBe(false);
  });

  it("returns false for short answer", () => {
    expect(isValidAnswer("short")).toBe(false);
  });

  it("returns true for answer >= 10 characters", () => {
    expect(isValidAnswer("a".repeat(10))).toBe(true);
  });
});
