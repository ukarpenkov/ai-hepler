import { describe, it, expect } from "vitest";
import {
  buildEvaluatorPersona,
  isItVacancy,
} from "../evaluation-prompts.js";
import type { ParsedJob } from "../../types.js";

const itProfile: ParsedJob = {
  role: "Frontend Developer",
  level: "middle",
  skills: ["React", "TypeScript"],
  softSkills: [],
  keywords: ["web"],
  domain: "gaming",
  language: "en",
  minYearsExperience: 3,
};

const engineeringProfile: ParsedJob = {
  role: "Mechanical Engineer",
  level: "senior",
  skills: ["CAD", "Thermodynamics"],
  softSkills: [],
  keywords: ["manufacturing"],
  domain: "industrial engineering",
  language: "ru",
  minYearsExperience: 8,
};

describe("evaluation-prompts", () => {
  it("detects IT vacancies", () => {
    expect(isItVacancy(itProfile)).toBe(true);
    expect(isItVacancy(engineeringProfile)).toBe(false);
  });

  it("builds senior developer persona for IT roles", () => {
    expect(buildEvaluatorPersona(itProfile)).toContain("senior Frontend Developer");
    expect(buildEvaluatorPersona(itProfile)).toContain("HR");
  });

  it("builds master practitioner persona for non-IT roles", () => {
    expect(buildEvaluatorPersona(engineeringProfile)).toContain("master practitioner");
    expect(buildEvaluatorPersona(engineeringProfile)).toContain("Mechanical Engineer");
  });
});
