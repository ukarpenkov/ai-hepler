import type { ParsedJob } from "../types.js";
import { isItVacancy } from "./evaluation-prompts.js";
import {
  getLanguageName,
  isEnglishRequired,
  normalizeLanguageCode,
} from "./language.js";
import { buildStrictRelevanceRetryRule } from "./vacancy-relevance.js";

export interface InterviewPromptLanguageOptions {
  questionLanguage?: string;
  jobText?: string;
  jobProfile?: ParsedJob;
  primaryLanguage?: string;
  strictRelevanceRetry?: boolean;
  offendingTerms?: string[];
}

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
ORIGINAL VACANCY TEXT (primary source — every question and evaluation criterion MUST come from this text):
---
${snippet}
---
Ground questions in specific duties, tools, standards, and requirements written above — not in company marketing slogans (e.g. "innovative", "AI-driven", "R&D center") unless they are actual job requirements.`;
}

export function buildInterviewerLanguageRule(
  languageCode: string,
  strictLanguageRetry: boolean,
  options?: InterviewPromptLanguageOptions & {
    primaryLanguage?: string;
  },
): string {
  const langName = getLanguageName(languageCode);
  const primaryLanguage = normalizeLanguageCode(
    options?.primaryLanguage ?? languageCode,
  );
  const primaryName = getLanguageName(primaryLanguage);
  const englishRequired = isEnglishRequired(
    options?.jobProfile ?? { language: primaryLanguage },
    options?.jobText,
  );
  const isEnglishAssessmentRound =
    englishRequired && primaryLanguage !== "en" && languageCode === "en";

  if (strictLanguageRetry) {
    return `CRITICAL: Your previous attempt used the wrong language. You MUST write question, topic, and every expectedAnswerCriteria entry ONLY in ${langName} (${languageCode}). Do NOT use any other language for this question.`;
  }

  let rule = `CRITICAL LANGUAGE RULE: Write question, topic, and every expectedAnswerCriteria entry ONLY in ${langName} (${languageCode}).`;

  if (isEnglishAssessmentRound) {
    rule += ` The job posting is in ${primaryName}, but English proficiency is required — THIS question must be in English to assess professional communication. Other questions may be in ${primaryName}.`;
  } else if (englishRequired && primaryLanguage !== "en") {
    rule += ` Primary interview language is ${primaryName} (matching the job posting language). The posting also requires English — some later questions will be in English; this one stays in ${primaryName}.`;
  } else {
    rule += ` The interview language matches the job posting: ${langName}. Do not switch to another language. Tech terms may stay in Latin script when commonly used (React, API, 1C, WMS, CAD), but sentence structure and wording must be ${langName}.`;
  }

  return rule;
}

function buildItInterviewerPersona(jobProfile: ParsedJob): string {
  return `You are a seasoned technical interviewer at a top tech company. You conduct rigorous, engaging interviews for ${jobProfile.level} ${jobProfile.role} positions. Your questions reveal true competence — reasoning, tradeoffs, and real-world judgment — not memorized definitions.`;
}

function buildGeneralInterviewerPersona(jobProfile: ParsedJob): string {
  return `You are an experienced hiring manager and senior practitioner conducting a job interview for a ${jobProfile.role} position in ${jobProfile.domain}. Your questions reveal true professional competence — reasoning, tradeoffs, and real-world judgment — not memorized textbook answers. They must reflect what a real employer would ask for THIS specific vacancy: tools, standards, duties, and constraints named in the posting.`;
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
1. Read the ORIGINAL VACANCY TEXT first. Every question MUST reference at least one concrete duty, tool, standard, or requirement from that text.
2. Make questions INTERESTING but realistic — the kind a senior practitioner would ask on a real interview:
   - a production defect or discrepancy tied to tools from the posting
   - a tradeoff between customer request and standards/compliance
   - choosing components or procedures under constraints named in the vacancy
   - supporting manufacturing when drawings/specs do not match reality
3. Ask questions that require THINKING, not recall. Prefer "How would you choose between...", "What breaks if...", "Production found a discrepancy — what do you do?", "What tradeoffs when..."
4. Vary question types adapted to this role:
   - theoretical_explanation: explain a procedure, regulation, standard, or concept required for the job
   - practical_implementation: step-by-step approach to a concrete work task from the posting
   - system_design: design a workflow, documentation set, or process for a real operational challenge (NOT software architecture)
   - debugging_scenario: something went wrong at work — identify cause, root analysis, and corrective actions
   - behavioral_experience: past experience handling situations relevant to this role
5. Each question MUST include 3-5 expected_answer_criteria tied to what the employer listed in the posting.
6. The "topic" field MUST name skills/tools from the posting (comma-separated), never invented technologies absent from the vacancy.
7. STRICTLY FORBIDDEN unless explicitly listed in the vacancy: Python, AWS, microservices, Docker, Kubernetes, REST/API, React, Vue, databases as software stack, cloud architecture, DevOps.
8. Ignore company marketing ("innovative AI approach", "R&D center") — it is NOT a job requirement unless listed under duties or requirements.
9. Scale to ${level}: junior=basics + small realistic scenarios, middle=tradeoffs + independent judgment, senior=complex edge cases + optimization + mentoring/production support.

DIFFICULTY GUIDELINES:
- easy: One clear work situation from the posting, expects sensible reasoning and steps
- medium: Multi-step scenario with a tradeoff, constraint, or conflicting requirements from the job
- hard: Complex edge case — production defect, safety/compliance conflict, tight deadline, or non-standard customer requirement

INSPIRATION (adapt to THIS posting — do not copy literally):
- Electrical design: discrepancy between Э3 and actual assembly; selecting protection devices for a lighting control panel up to 1000V; explosion-proof execution constraints
- Warehouse: WMS stock mismatch at shift end; FIFO under partial shipment pressure
- Sales: CRM data conflict with verbal client agreement; handling objection using product specs from the posting

AVOID:
- Software engineering, frontend, API, cloud, or database questions unless the posting explicitly requires software development
- Inventing tools not mentioned in the posting
- Generic HR platitudes with no link to the vacancy
- Trivia answerable with one word
- Questions already asked: ${previousText}`;
}

export function buildInterviewerSystemPrompt(
  jobProfile: ParsedJob,
  previousQuestions: string[],
  strictLanguageRetry: boolean,
  options?: InterviewPromptLanguageOptions,
): string {
  const previousText =
    previousQuestions.length > 0 ? previousQuestions.join("; ") : "none";
  const primaryLanguage = normalizeLanguageCode(jobProfile.language);
  const questionLanguage = normalizeLanguageCode(
    options?.questionLanguage ?? jobProfile.language,
  );
  const isIt = isItVacancy(jobProfile);

  const persona = isIt
    ? buildItInterviewerPersona(jobProfile)
    : buildGeneralInterviewerPersona(jobProfile);
  const designRules = isIt
    ? buildItQuestionDesignRules(jobProfile.level, previousText)
    : buildGeneralQuestionDesignRules(jobProfile.level, previousText);

  const relevanceRetry =
    options?.strictRelevanceRetry && options.jobProfile
      ? buildStrictRelevanceRetryRule(
          options.jobProfile,
          options.offendingTerms ?? [],
        )
      : "";

  return `${persona}

${buildInterviewerLanguageRule(questionLanguage, strictLanguageRetry, {
  primaryLanguage,
  jobText: options?.jobText,
  jobProfile,
})}

${designRules}${relevanceRetry ? `\n\n${relevanceRetry}` : ""}`;
}

export function buildInterviewerUserPrompt(
  jobProfile: ParsedJob,
  weakSkills: string[],
  jobText?: string,
  questionLanguage?: string,
): string {
  const weakText = weakSkills.length > 0 ? weakSkills.join(", ") : "none";
  const primaryLanguage = normalizeLanguageCode(jobProfile.language);
  const primaryName = getLanguageName(primaryLanguage);
  const outputLanguage = normalizeLanguageCode(
    questionLanguage ?? jobProfile.language,
  );
  const outputName = getLanguageName(outputLanguage);
  const vacancyBlock = buildVacancyContextBlock(jobText);
  const softSkillsLine =
    jobProfile.softSkills.length > 0
      ? `\nSoft skills from posting: ${jobProfile.softSkills.join(", ")}`
      : "";
  const englishLine = isEnglishRequired(jobProfile, jobText)
    ? `\nEnglish proficiency: required by the posting (some questions may be in English).`
    : "";

  return `Position: ${jobProfile.role} (${jobProfile.level})
Job posting language / primary interview language: ${primaryName} (${primaryLanguage})
Language for THIS question: ${outputName} (${outputLanguage})${englishLine}
Domain / industry: ${jobProfile.domain}
Required skills and tools: ${jobProfile.skills.join(", ")}
Keywords from job description: ${jobProfile.keywords.join(", ")}${softSkillsLine}
Weak areas of candidate (focus on these): ${weakText}
${vacancyBlock}

Generate ONE interview question in ${outputName}. It must be interesting, realistic, and grounded ONLY in the vacancy text above — use the employer's tools and duties, not generic IT scenarios. Vary the question type from previous rounds. Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "question": "<string: the question text in ${outputName}>",
  "topic": "<string: specific topic/skill this question tests, in ${outputName}>",
  "difficulty": "easy"|"medium"|"hard",
  "questionType": "theoretical_explanation"|"practical_implementation"|"system_design"|"debugging_scenario"|"behavioral_experience",
  "expectedAnswerCriteria": ["<string: specific point in ${outputName}>", ...]
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
