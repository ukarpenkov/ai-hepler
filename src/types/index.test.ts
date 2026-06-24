import { describe, it, expect } from "vitest";
import {
  JobProfileSchema,
  QuestionSchema,
  EvaluationSchema,
  SessionSchema,
  validateWithSchema,
  ValidationError,
} from "./index.js";
import type { JobProfile, Question, Evaluation, Session } from "./index.js";

describe("JobProfile validation", () => {
  const valid: JobProfile = {
    role: "Frontend Developer",
    level: "middle",
    skills: ["React", "TypeScript"],
    softSkills: [],
    domain: "Web Development",
    keywords: ["frontend", "ui"],
    language: "en", minYearsExperience: null,
  };

  it("validates correct JobProfile", () => {
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

describe("Question validation", () => {
  const valid: Question = {
    id: "q1",
    text: "What is React?",
    topic: "frontend",
    difficulty: 5,
  };

  it("validates correct Question", () => {
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

describe("Evaluation validation", () => {
  const valid: Evaluation = {
    score: 7,
    accuracy: 2,
    depth: 2,
    relevance: 2,
    examples: 1,
    strengths: ["good knowledge"],
    weaknesses: ["needs more practice"],
    recommendation: "Keep learning",
    antiCheatFlags: [],
    perfectAnswerSummary: "Include concrete examples",
  };

  it("validates correct Evaluation", () => {
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

describe("Session validation", () => {
  const valid: Session = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    jobProfile: {
      role: "Dev",
      level: "middle",
      skills: ["TS"],
      softSkills: [],
      keywords: [],
      domain: "web",
      language: "en", minYearsExperience: null,
    },
    history: [
      { role: "user", content: "hello", timestamp: "2024-01-01T00:00:00.000Z" },
    ],
    weakSkills: ["typescript"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  it("validates correct Session", () => {
    expect(() => SessionSchema.parse(valid)).not.toThrow();
  });

  it("validates Session with null jobProfile", () => {
    const session = { ...valid, jobProfile: null };
    expect(() => SessionSchema.parse(session)).not.toThrow();
  });

  it("rejects invalid UUID", () => {
    const invalid = { ...valid, id: "not-a-uuid" };
    expect(() => SessionSchema.parse(invalid)).toThrow();
  });

  it("rejects missing fields", () => {
    const invalid = { id: valid.id };
    expect(() => SessionSchema.parse(invalid)).toThrow();
  });
});

describe("validateWithSchema", () => {
  it("returns parsed data on success", () => {
    const data = { role: "Dev", level: "junior", skills: [], softSkills: [], domain: "web", keywords: [], language: "en", minYearsExperience: null };
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

describe("invalid data rejection", () => {
  it("rejects empty object for JobProfileSchema", () => {
    expect(() => JobProfileSchema.parse({})).toThrow();
  });

  it("rejects string for QuestionSchema", () => {
    expect(() => QuestionSchema.parse("not an object")).toThrow();
  });

  it("rejects number for EvaluationSchema", () => {
    expect(() => EvaluationSchema.parse(42)).toThrow();
  });

  it("rejects array for SessionSchema", () => {
    expect(() => SessionSchema.parse([])).toThrow();
  });
});
