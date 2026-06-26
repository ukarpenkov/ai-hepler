import { describe, it, expect } from "vitest";
import {
  buildEvaluatorPersona,
  buildEvaluatorRoleRules,
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

const electricalDesignProfile: ParsedJob = {
  role: "Инженер-проектировщик",
  level: "middle",
  skills: ["КОМПАС 3D", "ЕСКД", "электрические схемы Э3"],
  softSkills: ["грамотная речь"],
  keywords: ["щиты управления", "взрывозащита", "до 1000В"],
  domain: "electrical equipment manufacturing",
  language: "ru",
  minYearsExperience: 3,
};

describe("evaluation-prompts", () => {
  it("detects IT vacancies", () => {
    expect(isItVacancy(itProfile)).toBe(true);
    expect(isItVacancy(engineeringProfile)).toBe(false);
    expect(isItVacancy(electricalDesignProfile)).toBe(false);
  });

  it("does not classify electrical design engineer as IT even with AI in company marketing keywords", () => {
    const profileWithAiMarketing: ParsedJob = {
      ...electricalDesignProfile,
      keywords: [...electricalDesignProfile.keywords, "инновационный подход с ИИ"],
    };
    expect(isItVacancy(profileWithAiMarketing)).toBe(false);
  });

  it("builds senior developer persona for IT roles", () => {
    expect(buildEvaluatorPersona(itProfile)).toContain("senior Frontend Developer");
    expect(buildEvaluatorPersona(itProfile)).toContain("HR");
  });

  it("builds master practitioner persona for non-IT roles", () => {
    expect(buildEvaluatorPersona(engineeringProfile)).toContain("master practitioner");
    expect(buildEvaluatorPersona(engineeringProfile)).toContain("Mechanical Engineer");
  });

  it("forbids IT perfect answers for non-IT evaluation rules", () => {
    const rules = buildEvaluatorRoleRules(electricalDesignProfile);
    expect(rules).toContain("Do NOT suggest perfect answers about Python, AWS");
    expect(rules).toContain("КОМПАС");
  });
});
