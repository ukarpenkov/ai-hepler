import { describe, it, expect } from "vitest";
import {
  JobProfileSchema,
  QuestionSchema,
  EvaluationSchema,
  CoachSchema,
  MemoryUpdateSchema,
  validateWithSchema,
  ValidationError,
} from "./schemas.js";
import type { JobProfile, Question, Evaluation, Coach, MemoryUpdate } from "./schemas.js";

describe("JobProfileSchema", () => {
  const valid: JobProfile = {
    role: "Frontend Developer",
    level: "middle",
    skills: ["React", "TypeScript"],
    domain: "Web Development",
    keywords: ["frontend", "ui"],
  };

  it("accepts valid data", () => {
    expect(() => JobProfileSchema.parse(valid)).not.toThrow();
  });

  it("rejects missing role", () => {
    const invalid = { ...valid, role: undefined };
    expect(() => JobProfileSchema.parse(invalid)).toThrow();
  });

  it("rejects invalid level", () => {
    const invalid = { ...valid, level: "expert" };
    expect(() => JobProfileSchema.parse(invalid)).toThrow();
  });

  it("rejects extra fields", () => {
    const invalid = { ...valid, extra: "field" };
    expect(() => JobProfileSchema.parse(invalid)).toThrow();
  });
});

describe("QuestionSchema", () => {
  const valid: Question = {
    id: "q1",
    text: "What is React?",
    topic: "frontend",
    difficulty: 5,
  };

  it("accepts valid data", () => {
    expect(() => QuestionSchema.parse(valid)).not.toThrow();
  });

  it("rejects difficulty > 10", () => {
    const invalid = { ...valid, difficulty: 11 };
    expect(() => QuestionSchema.parse(invalid)).toThrow();
  });

  it("rejects difficulty < 1", () => {
    const invalid = { ...valid, difficulty: 0 };
    expect(() => QuestionSchema.parse(invalid)).toThrow();
  });
});

describe("EvaluationSchema", () => {
  const valid: Evaluation = {
    score: 7,
    strengths: ["good knowledge"],
    weaknesses: ["needs more practice"],
    recommendation: "Keep learning",
  };

  it("accepts valid data", () => {
    expect(() => EvaluationSchema.parse(valid)).not.toThrow();
  });

  it("rejects score = 0", () => {
    const invalid = { ...valid, score: 0 };
    expect(() => EvaluationSchema.parse(invalid)).toThrow();
  });

  it("rejects score > 10", () => {
    const invalid = { ...valid, score: 11 };
    expect(() => EvaluationSchema.parse(invalid)).toThrow();
  });
});

describe("CoachSchema", () => {
  const valid: Coach = {
    explanation: "React is a UI library",
    improvedAnswer: "React is a JavaScript library for building UIs",
    tips: ["use hooks", "follow patterns"],
  };

  it("accepts valid data", () => {
    expect(() => CoachSchema.parse(valid)).not.toThrow();
  });
});

describe("MemoryUpdateSchema", () => {
  const valid: MemoryUpdate = {
    weakTopics: ["react hooks", "state management"],
    removeTopics: ["basic html"],
  };

  it("accepts valid data", () => {
    expect(() => MemoryUpdateSchema.parse(valid)).not.toThrow();
  });

  it("rejects missing weakTopics", () => {
    const invalid = { removeTopics: [] };
    expect(() => MemoryUpdateSchema.parse(invalid)).toThrow();
  });
});

describe("validateWithSchema", () => {
  it("returns parsed data on success", () => {
    const data = { role: "Dev", level: "junior", skills: [], domain: "web", keywords: [] };
    const result = validateWithSchema(JobProfileSchema, data);
    expect(result.role).toBe("Dev");
  });

  it("throws ValidationError on invalid data", () => {
    expect(() => validateWithSchema(JobProfileSchema, {})).toThrow(ValidationError);
  });

  it("includes issue details in error message", () => {
    try {
      validateWithSchema(JobProfileSchema, {});
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as Error).message).toContain("Validation failed");
    }
  });
});
