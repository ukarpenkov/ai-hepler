import { describe, it, expect } from "vitest";
import {
  buildInterviewerSystemPrompt,
  buildInterviewerUserPrompt,
  buildEvaluatorVacancyGrounding,
  truncateJobText,
} from "../interview-prompts.js";
import type { ParsedJob } from "../../types.js";

const itProfile: ParsedJob = {
  role: "Backend Developer",
  level: "middle",
  skills: ["Node.js", "PostgreSQL"],
  softSkills: [],
  keywords: ["microservices"],
  domain: "fintech",
  language: "en",
  minYearsExperience: 3,
};

const warehouseProfile: ParsedJob = {
  role: "Warehouse Worker",
  level: "middle",
  skills: ["WMS", "inventory management", "forklift"],
  softSkills: ["attention to detail"],
  keywords: ["FIFO", "shift work"],
  domain: "logistics",
  language: "ru",
  minYearsExperience: 2,
};

describe("interview-prompts", () => {
  it("uses challenging IT interviewer persona for tech roles", () => {
    const prompt = buildInterviewerSystemPrompt(itProfile, [], false);
    expect(prompt).toContain("top tech company");
    expect(prompt).toContain("system_design");
    expect(prompt).toContain("debugging_scenario");
    expect(prompt).not.toContain("NOT software architecture");
  });

  it("uses vacancy-grounded persona for non-IT roles", () => {
    const prompt = buildInterviewerSystemPrompt(warehouseProfile, [], false);
    expect(prompt).toContain("hiring manager");
    expect(prompt).toContain("workplace scenarios");
    expect(prompt).toContain("NOT software architecture");
    expect(prompt).not.toContain("top tech company");
  });

  it("includes original job posting in user prompt", () => {
    const jobText =
      "Требуется кладовщик. Опыт работы с WMS, проведение инвентаризации.";
    const prompt = buildInterviewerUserPrompt(
      warehouseProfile,
      ["inventory management"],
      jobText,
    );

    expect(prompt).toContain("ORIGINAL JOB POSTING");
    expect(prompt).toContain("кладовщик");
    expect(prompt).toContain("Weak areas");
    expect(prompt).toContain("attention to detail");
  });

  it("truncates very long job postings", () => {
    const longText = "a".repeat(4000);
    expect(truncateJobText(longText)?.length).toBe(3001);
  });

  it("adds vacancy grounding for evaluator when job text is present", () => {
    const grounding = buildEvaluatorVacancyGrounding("Warehouse shift lead role");
    expect(grounding).toContain("original job posting");
    expect(grounding).toContain("Warehouse shift lead role");
  });

  it("falls back when job text is missing", () => {
    expect(buildEvaluatorVacancyGrounding(undefined)).toContain(
      "parsed job profile",
    );
  });
});
