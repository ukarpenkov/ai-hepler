import type { ParsedJob, QuestionResult } from "../types.js";
import { isItVacancy } from "./evaluation-prompts.js";

const IT_QUESTION_PATTERN =
  /\b(microservices?|aws|azure|gcp|kubernetes|docker|devops|ci\/cd|graphql|rest\s*api|frontend|backend|fullstack|full-stack|node\.?\s*js|react|vue\.?\s*js|angular|typescript|javascript|mongodb|postgresql|redis|kafka|terraform|serverless|api\s+gateway)\b/i;

const SOFTWARE_CONTEXT_PATTERN =
  /\b(микросервис|облак[оа]\s*aws|python\s+и\s+aws|python.*aws|backend|frontend|разработк[аи].*?(po|сервис)|программир|devops|контейнер|kubernetes)\b/i;

const MARKETING_ONLY_PATTERN =
  /(инновацион|использовани[ея]\s+ии|ai-driven|r&d\s*(center|центр))/i;

export function buildAllowedTermsHaystack(
  jobProfile: ParsedJob,
  jobText?: string,
): string {
  return [
    jobProfile.role,
    jobProfile.domain,
    ...jobProfile.skills,
    ...jobProfile.keywords,
    jobText ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function termAllowedInVacancy(term: string, haystack: string): boolean {
  const normalized = term.toLowerCase().trim();
  if (!normalized) {
    return false;
  }
  if (haystack.includes(normalized)) {
    return true;
  }

  const fragments = normalized.split(/[\s/.-]+/).filter((f) => f.length >= 3);
  return fragments.some((fragment) => haystack.includes(fragment));
}

export function extractForbiddenItTerms(
  text: string,
  haystack: string,
): string[] {
  const found: string[] = [];
  const patterns = [IT_QUESTION_PATTERN, SOFTWARE_CONTEXT_PATTERN];

  for (const pattern of patterns) {
    const matches = text.match(new RegExp(pattern.source, "gi")) ?? [];
    for (const match of matches) {
      if (!termAllowedInVacancy(match, haystack)) {
        found.push(match);
      }
    }
  }

  return [...new Set(found)];
}

export function isQuestionVacancyRelevant(
  result: QuestionResult,
  jobProfile: ParsedJob,
  jobText?: string,
): boolean {
  if (isItVacancy(jobProfile)) {
    return true;
  }

  const haystack = buildAllowedTermsHaystack(jobProfile, jobText);
  const questionText = `${result.question} ${result.topic} ${result.expectedAnswerCriteria.join(" ")}`;
  return extractForbiddenItTerms(questionText, haystack).length === 0;
}

export function buildStrictRelevanceRetryRule(
  jobProfile: ParsedJob,
  offendingTerms: string[],
): string {
  const terms =
    offendingTerms.length > 0 ? offendingTerms.join(", ") : "software/cloud topics";
  return `CRITICAL RELEVANCE RETRY: Your previous question was OFF-TOPIC for a ${jobProfile.role} role in ${jobProfile.domain}. It mentioned ${terms}, which are NOT required by this vacancy.

Generate a NEW question that:
- Uses ONLY tools, standards, duties, and terminology from the original job posting (e.g. КОМПАС, ЕСКД, Э3/Э4, аппараты защиты, щиты освещения — whatever the posting actually lists)
- Is INTERESTING: a realistic work scenario with a tradeoff, production issue, or non-standard customer requirement — not textbook trivia
- Does NOT mention programming, cloud platforms, microservices, or software architecture unless the posting explicitly requires software development`;
}

export function filterMarketingKeywords(keywords: string[]): string[] {
  return keywords.filter((keyword) => !MARKETING_ONLY_PATTERN.test(keyword));
}
