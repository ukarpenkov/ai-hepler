import type { ParsedJob } from "../types.js";
import { isItVacancy } from "./evaluation-prompts.js";
import { getLanguageName, normalizeLanguageCode } from "./language.js";

const MAX_JOB_TEXT_SNIPPET = 3000;

export function truncateJobText(
  jobText: string | undefined,
): string | undefined {
  if (!jobText?.trim()) {
    return undefined;
  }

  const trimmed = jobText.trim();
  if (trimmed.length <= MAX_JOB_TEXT_SNIPPET) {
    return trimmed;
  }

  return `${trimmed.slice(0, MAX_JOB_TEXT_SNIPPET)}…`;
}

export function buildVacancyContextBlock(jobText: string | undefined): string {
  const snippet = truncateJobText(jobText);
  if (!snippet) {
    return "";
  }

  return `
ORIGINAL JOB POSTING (primary source — ground questions and evaluation in this text):
---
${snippet}
---
Use specific duties, tools, requirements, and terminology from the posting above.`;
}

export function buildInterviewerLanguageRule(
  languageCode: string,
  strictLanguageRetry: boolean,
): string {
  const langName = getLanguageName(languageCode);

  if (strictLanguageRetry) {
    return `CRITICAL: Your previous attempt used the wrong language. You MUST write question, topic, and every expectedAnswerCriteria entry ONLY in ${langName} (${languageCode}). Do NOT use English or any other language.`;
  }

  return `CRITICAL LANGUAGE RULE: The interview language is ${langName} (${languageCode}). You MUST write question, topic, and every expectedAnswerCriteria entry ONLY in ${langName}. Never switch to English or another language. Tech terms may stay in Latin script when commonly used (React, API, 1C, WMS), but the sentence structure and wording must be ${langName}.`;
}

function buildItInterviewerPersona(jobProfile: ParsedJob): string {
  return `You are a seasoned technical interviewer at a top tech company. You conduct rigorous, engaging interviews for ${jobProfile.level} ${jobProfile.role} positions. Your questions reveal true competence — reasoning, tradeoffs, and real-world judgment — not memorized definitions.`;
}

function buildGeneralInterviewerPersona(jobProfile: ParsedJob): string {
  return `You are an experienced hiring manager and senior practitioner conducting a job interview for a ${jobProfile.role} position in ${jobProfile.domain}. Your questions reflect what a real employer would ask for THIS specific vacancy — practical situations, professional knowledge, safety, quality standards, and hands-on judgment relevant to the role.`;
}

function buildItQuestionDesignRules(
  level: ParsedJob["level"],
  previousText: string,
): string {
  return `QUESTION DESIGN PRINCIPLES (IT — make questions interesting and challenging):
1. Ask questions that require THINKING, not recall. Prefer "When would you use X over Y?", "How would you design...", "What breaks if...", "How would you debug..."
2. Vary question types: theoretical_explanation, practical_implementation, system_design, debugging_scenario, behavioral_experience.
3. system_design and debugging_scenario should appear regularly — they test depth better than trivia.
4. Each question MUST include 3-5 expected_answer_criteria — key points a strong answer must cover (used internally by the evaluator, NEVER shown to the candidate).
5. Use technologies and scenarios from the job posting's skills and keywords. Scale complexity to ${level}: junior=fundamentals+small scenarios, middle=architecture+tradeoffs+debugging, senior=system design+leadership+failure modes.

DIFFICULTY GUIDELINES:
- easy: Single concept with a concrete twist, expects clear reasoning about a fundamental
- medium: Compare/contrast, practical scenario, expects reasoning and concrete examples
- hard: System design, tradeoff analysis, edge cases, failure modes — expects deep thinking

AVOID:
- Questions answerable with one word or one sentence
- Trivia about syntax or API method names
- Generic questions that ignore the job posting
- Questions already asked: ${previousText}`;
}

function buildGeneralQuestionDesignRules(
  level: ParsedJob["level"],
  previousText: string,
): string {
  return `QUESTION DESIGN PRINCIPLES (professional role — grounded in the vacancy text):
1. Base every question on duties, tools, and requirements from the original job posting.
2. Ask realistic workplace scenarios: "A situation arises where...", "How would you handle...", "What steps would you take when..."
3. Vary question types adapted to this role:
   - theoretical_explanation: explain a procedure, regulation, or concept required for the job
   - practical_implementation: step-by-step approach to a concrete work task from the posting
   - system_design: design a workflow/process/organization for a real operational challenge (NOT software architecture)
   - debugging_scenario: something went wrong at work — identify cause and corrective actions
   - behavioral_experience: past experience handling situations relevant to this role
4. Each question MUST include 3-5 expected_answer_criteria tied to what the employer listed in the posting.
5. Avoid IT jargon unless the posting requires it. Focus on safety, quality, compliance, customer/colleague interaction, and practical skill.
6. Scale to ${level}: junior=basics and following procedures, middle=independent judgment and problem-solving, senior=leadership, optimization, and complex edge cases.

DIFFICULTY GUIDELINES:
- easy: One clear work situation from the posting, expects a sensible step-by-step response
- medium: Multi-step scenario with a tradeoff or constraint from the job requirements
- hard: Complex edge case, conflict, or emergency requiring professional judgment

AVOID:
- Software engineering questions unless the posting is for an IT role
- Generic HR platitudes with no link to the vacancy
- Questions already asked: ${previousText}`;
}

export function buildInterviewerSystemPrompt(
  jobProfile: ParsedJob,
  previousQuestions: string[],
  strictLanguageRetry: boolean,
): string {
  const previousText =
    previousQuestions.length > 0 ? previousQuestions.join("; ") : "none";
  const languageCode = normalizeLanguageCode(jobProfile.language);
  const isIt = isItVacancy(jobProfile);

  const persona = isIt
    ? buildItInterviewerPersona(jobProfile)
    : buildGeneralInterviewerPersona(jobProfile);
  const designRules = isIt
    ? buildItQuestionDesignRules(jobProfile.level, previousText)
    : buildGeneralQuestionDesignRules(jobProfile.level, previousText);

  return `${persona}

${buildInterviewerLanguageRule(languageCode, strictLanguageRetry)}

${designRules}`;
}

export function buildInterviewerUserPrompt(
  jobProfile: ParsedJob,
  weakSkills: string[],
  jobText?: string,
): string {
  const weakText = weakSkills.length > 0 ? weakSkills.join(", ") : "none";
  const languageCode = normalizeLanguageCode(jobProfile.language);
  const langName = getLanguageName(languageCode);
  const vacancyBlock = buildVacancyContextBlock(jobText);
  const softSkillsLine =
    jobProfile.softSkills.length > 0
      ? `\nSoft skills from posting: ${jobProfile.softSkills.join(", ")}`
      : "";

  return `Position: ${jobProfile.role} (${jobProfile.level})
Interview language: ${langName} (${languageCode})
Domain / industry: ${jobProfile.domain}
Required skills and tools: ${jobProfile.skills.join(", ")}
Keywords from job description: ${jobProfile.keywords.join(", ")}${softSkillsLine}
Weak areas of candidate (focus on these): ${weakText}
${vacancyBlock}

Generate ONE interview question in ${langName}. Ground it in the job posting above. Vary the question type from previous rounds. Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "question": "<string: the question text in ${langName}>",
  "topic": "<string: specific topic/skill this question tests, in ${langName}>",
  "difficulty": "easy"|"medium"|"hard",
  "questionType": "theoretical_explanation"|"practical_implementation"|"system_design"|"debugging_scenario"|"behavioral_experience",
  "expectedAnswerCriteria": ["<string: specific point in ${langName}>", ...]
}`;
}

export function buildEvaluatorVacancyGrounding(jobText?: string): string {
  const vacancyBlock = buildVacancyContextBlock(jobText);
  if (!vacancyBlock) {
    return "Evaluate answers against the parsed job profile and the specific question asked.";
  }

  return `Evaluate answers against the original job posting below — the employer's stated duties, tools, and requirements are the benchmark for relevance and accuracy.
${vacancyBlock}`;
}
