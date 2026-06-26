import type { ParsedJob } from "../types.js";
import { getLanguageName } from "./language.js";

const NON_IT_ROLE_PATTERN =
  /проектировщик|конструктор|кладовщик|бухгалтер|продавец|кассир|водитель|электромонтаж|электрик|сварщик|токар|фрезер|оператор|монтажник|technician|technologist|welder|driver|cashier|accountant|warehouse|nurse|teacher|chef|barista|design engineer|electrical engineer/i;

const NON_IT_ENGINEERING_PATTERN =
  /mechanical|civil|chemical|petroleum|aerospace|structural|electrical|electro|instrumentation|механик|металлург|строитель|электро|проектир|конструкт|черт[её]ж|есскд|ескд|компас|кип|kip|взрывозащ|cad|sapr|сапр|чертеж/i;

const IT_ROLE_PATTERN =
  /developer|devops|programmer|frontend|backend|fullstack|full-stack|software|qa engineer|test engineer|tester|sre|data scientist|ml engineer|аналитик|разработчик|программист|инженер-программист/i;

const IT_ENGINEER_PATTERN =
  /software engineer|backend engineer|frontend engineer|devops engineer|platform engineer|cloud engineer|site reliability|systems engineer|инженер по (данным|разработк|программ)/i;

const IT_SKILL_PATTERN =
  /react|vue|angular|typescript|javascript|node\.?js|next\.?js|golang|rust|kubernetes|docker|postgresql|mongodb|microservices|ci\/cd|html|css|swift|kotlin|flutter|django|fastapi|spring boot/i;

const IT_DOMAIN_PATTERN =
  /\b(web|software|saas|gamedev|cloud computing|fintech|it consulting|mobile app)\b|\b(it|tech)\b industry|разработк.*?(po|software)|софт|программ/i;

function buildHaystack(jobProfile: ParsedJob): {
  roleAndDomain: string;
  skillsText: string;
  full: string;
} {
  const roleAndDomain = `${jobProfile.role} ${jobProfile.domain}`.toLowerCase();
  const skillsText = [...jobProfile.skills, ...jobProfile.keywords]
    .join(" ")
    .toLowerCase();
  return {
    roleAndDomain,
    skillsText,
    full: `${roleAndDomain} ${skillsText}`,
  };
}

function isExplicitNonIt(haystack: string): boolean {
  return (
    NON_IT_ROLE_PATTERN.test(haystack) ||
    NON_IT_ENGINEERING_PATTERN.test(haystack)
  );
}

function isExplicitIt(roleAndDomain: string, skillsText: string): boolean {
  return (
    IT_ROLE_PATTERN.test(roleAndDomain) ||
    IT_ENGINEER_PATTERN.test(roleAndDomain) ||
    (IT_SKILL_PATTERN.test(skillsText) &&
      (IT_DOMAIN_PATTERN.test(`${roleAndDomain} ${skillsText}`) ||
        /\b(it|tech|software|web|разработк|программ)\b/i.test(
          roleAndDomain,
        )))
  );
}

export function isItVacancy(jobProfile: ParsedJob): boolean {
  const { roleAndDomain, skillsText, full } = buildHaystack(jobProfile);

  if (isExplicitNonIt(full)) {
    if (isExplicitIt(roleAndDomain, skillsText)) {
      return true;
    }
    return false;
  }

  if (isExplicitIt(roleAndDomain, skillsText)) {
    return true;
  }

  if (/engineer|инженер/i.test(jobProfile.role)) {
    return false;
  }

  return IT_DOMAIN_PATTERN.test(full) && IT_SKILL_PATTERN.test(skillsText);
}

export function buildEvaluatorPersona(jobProfile: ParsedJob): string {
  if (isItVacancy(jobProfile)) {
    return `You are an experienced HR interviewer combined with a senior ${jobProfile.role} who has conducted hundreds of real interviews. You read answers the way a hiring team actually does: you notice effort, reasoning, honesty, and practical experience — not just polished buzzwords.`;
  }

  return `You are an experienced HR interviewer combined with a master practitioner in ${jobProfile.domain} (${jobProfile.role}). You evaluate craftsmanship, practical judgment, safety awareness, and real hands-on experience — not textbook recitation.`;
}

export function buildEvaluationPhilosophy(): string {
  return `EVALUATION PHILOSOPHY (critical):
- Be fair and perceptive. Write feedback a real candidate would find useful — specific, human, and honest.
- Reward genuine effort: if the candidate tried to reason through the problem, admit uncertainty honestly, or shared a relevant experience — credit that even when the answer is incomplete.
- A thoughtful partial answer with good ideas deserves 4-6/10, not 1-2. Strong insight with minor gaps deserves 7-8/10.
- Reserve 1-2/10 only for answers that add nothing: blank copy of the question, empty fluff, or complete refusal to engage.
- Distinguish "I don't know everything, but I would start by..." (good interview behavior) from "it depends / best practices" with zero specifics (weak).
- Mention concrete things you liked before listing gaps. In recommendation, sound like a good HR professional giving actionable hiring-style feedback.`;
}

export function buildAntiCheatRules(): string {
  return `ANTI-CHEAT & QUALITY RULES:
- Flag "paraphrasing_question" ONLY when the answer is essentially the question repeated with no original reasoning, steps, examples, or personal view.
- If the candidate repeats part of the question but then adds their own analysis, approach, or experience — do NOT flag paraphrasing; evaluate the added content generously for effort.
- Flag "buzzwords_without_substance" when terms are dropped without explanation.
- Flag "generic_answer" for hollow platitudes with no concrete reasoning.
- Flag "no_original_thought" when the answer could apply to any question.
- Flag "off_topic" when the answer ignores the question.
- Never punish honesty. "I'm not sure about X, but I would investigate Y" is a strength at junior/middle level.`;
}

export function buildScoringRubric(): string {
  return `SCORING RUBRIC (total 0-10):

Dimension 1 — Technical / Professional Accuracy (0-3):
- 3: Correct, precise, appropriate for the role level
- 2: Mostly correct, minor imprecisions
- 1: Some errors or shallow understanding, but directionally useful
- 0: Fundamentally wrong OR no substantive content

Dimension 2 — Depth & Reasoning (0-3):
- 3: Explains WHY, tradeoffs, edge cases, or professional judgment
- 2: Solid reasoning with room to go deeper
- 1: Surface-level but shows an honest attempt to think
- 0: No reasoning, only keywords or copied text

Dimension 3 — Relevance & Specificity (0-2):
- 2: Directly answers THIS question with concrete details
- 1: Partially relevant or somewhat vague but on track
- 0: Off-topic or generic

Dimension 4 — Examples & Experience (0-2):
- 2: Concrete examples, realistic scenarios, or credible personal experience
- 1: Hypothetical or vague examples, but still illustrative
- 0: No examples; pure abstraction

Total score = sum of four dimensions. Match score to level expectations for the stated seniority level.`;
}

export function buildEvaluatorLanguageRule(language: string): string {
  const langName = getLanguageName(language);
  return `LANGUAGE: The interview is in ${langName}. Write strengths, weaknesses, recommendation, and perfectAnswerSummary in ${langName}. Use a natural, professional tone — not robotic checklist language.`;
}

export function buildEvaluatorRoleRules(jobProfile: ParsedJob): string {
  if (isItVacancy(jobProfile)) {
    return `ROLE-SPECIFIC EVALUATION (IT):
- Benchmark answers against technologies and responsibilities from the job posting.
- Reward tradeoffs, debugging mindset, and concrete examples from real projects.
- perfectAnswerSummary should reference stack/tools from the vacancy, not generic buzzwords.`;
  }

  return `ROLE-SPECIFIC EVALUATION (non-IT — critical):
- Benchmark answers ONLY against duties, tools, standards, and requirements from the original vacancy text (e.g. КОМПАС, ЕСКД, Э3/Э4, WMS, 1C — whatever the posting lists).
- Do NOT penalize for lacking software/cloud knowledge unless the posting explicitly requires programming or IT.
- Do NOT suggest perfect answers about Python, AWS, microservices, or software architecture for non-IT roles.
- Reward practical judgment, safety/compliance awareness, production support experience, and step-by-step reasoning using the employer's terminology.
- perfectAnswerSummary must describe an excellent answer using tools and procedures from THIS vacancy — not generic IT advice.`;
}

export function buildCoachPersona(jobProfile: ParsedJob): string {
  if (isItVacancy(jobProfile)) {
    return `You are a supportive senior ${jobProfile.role} and mentor who genuinely wants the candidate to grow. You acknowledge what they did well before explaining gaps.`;
  }

  return `You are a supportive master practitioner in ${jobProfile.domain} and mentor who helps the candidate grow through honest, respectful feedback.`;
}
