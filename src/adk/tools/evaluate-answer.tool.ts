import { FunctionTool } from "@google/adk";
import { z } from "zod";
import type { EvaluationResult } from "../types.js";
import { isParaphrasingQuestion } from "../utils/answer-similarity.js";
import { getLanguageName } from "../utils/language.js";
import {
  buildAntiCheatRules,
  buildEvaluationPhilosophy,
  buildEvaluatorLanguageRule,
  buildEvaluatorPersona,
  buildScoringRubric,
} from "../utils/evaluation-prompts.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

const jobProfileSchema = z.object({
  role: z.string(),
  level: z.enum(["junior", "middle", "senior"]),
  skills: z.array(z.string()),
  softSkills: z.array(z.string()),
  keywords: z.array(z.string()),
  domain: z.string(),
  language: z.string(),
  minYearsExperience: z.number().nullable(),
});

const evaluateAnswerParams = z.object({
  question: z.string().describe("The interview question"),
  answer: z.string().describe("The user's answer"),
  jobProfile: jobProfileSchema.describe("The parsed job profile"),
});

function buildParaphrasingEvaluation(language: string): EvaluationResult {
  const copy = {
    en: {
      strengths: [] as string[],
      weaknesses: [
        "The answer repeats the question without adding your own reasoning, steps, or experience.",
        "On a real interview, interviewers expect you to engage with the problem — even a partial attempt is better than copying the prompt.",
      ],
      recommendation:
        "This response does not count as an answer yet. Don't copy the question — explain how you would think through it, what you know, and what you would clarify first. Honest partial reasoning is always better than an empty copy.",
      perfectAnswerSummary:
        "A strong answer walks through your approach in your own words: concrete steps, tradeoffs, tools, and at least one realistic example or past experience.",
    },
    ru: {
      strengths: [] as string[],
      weaknesses: [
        "Ответ повторяет вопрос без собственных рассуждений, шагов или опыта.",
        "На реальном собеседовании ожидают попытку разобраться в задаче — даже частичный ответ лучше, чем копия формулировки вопроса.",
      ],
      recommendation:
        "Это пока не ответ. Не копируйте вопрос — опишите, как бы вы подошли к задаче, что знаете точно и что уточнили бы в первую очередь. Честная попытка рассуждать всегда лучше пустой копии.",
      perfectAnswerSummary:
        "Сильный ответ своими словами проходит по шагам: конкретные действия, компромиссы, инструменты и хотя бы один реалистичный пример или опыт.",
    },
  };

  const text = copy[language as keyof typeof copy] ?? copy.en;

  return {
    score: 1,
    accuracy: 0,
    depth: 0,
    relevance: 0,
    examples: 0,
    strengths: text.strengths,
    weaknesses: text.weaknesses,
    recommendation: text.recommendation,
    antiCheatFlags: ["paraphrasing_question"],
    perfectAnswerSummary: text.perfectAnswerSummary,
  };
}

function enforceAntiCheat(
  question: string,
  answer: string,
  language: string,
  result: EvaluationResult,
): EvaluationResult {
  if (!isParaphrasingQuestion(question, answer)) {
    return result;
  }

  const fallback = buildParaphrasingEvaluation(language);
  return {
    ...fallback,
    recommendation: result.antiCheatFlags.includes("paraphrasing_question")
      ? result.recommendation
      : fallback.recommendation,
  };
}

async function executeEvaluateAnswer(
  params: z.infer<typeof evaluateAnswerParams>,
): Promise<EvaluationResult> {
  const config = {
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com",
    model: process.env.LLM_MODEL || "deepseek-chat",
  };

  if (!config.apiKey) {
    throw new Error("DEEPSEEK_API_KEY environment variable is required");
  }

  const { question, answer, jobProfile } = params;

  if (isParaphrasingQuestion(question, answer)) {
    return buildParaphrasingEvaluation(jobProfile.language);
  }

  const langName = getLanguageName(jobProfile.language);

  const systemPrompt = `${buildEvaluatorPersona(jobProfile)}

${buildEvaluatorLanguageRule(jobProfile.language)}

${buildEvaluationPhilosophy()}

${buildAntiCheatRules()}

${buildScoringRubric()}

OUTPUT QUALITY:
- strengths: 1-3 specific observations about what the candidate did well (effort, insight, experience, honest reasoning). Empty only for blank copies.
- weaknesses: 1-3 constructive gaps — what was missing or imprecise, without being dismissive.
- recommendation: 2-4 sentences in a warm but professional HR + expert tone. Acknowledge effort when present. Say whether this answer would move them forward at ${jobProfile.level} level and what to improve next.
- perfectAnswerSummary: one sentence describing what an excellent answer would cover for THIS question.`;

  const userPrompt = `Job context: ${jobProfile.role} (${jobProfile.level}), domain: ${jobProfile.domain}.
Required skills: ${jobProfile.skills.join(", ")}.
${jobProfile.softSkills.length > 0 ? `Required soft skills: ${jobProfile.softSkills.join(", ")}.` : ""}

INTERVIEW QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

Evaluate the answer using the rubric and philosophy above. Be generous with effort and honest reasoning; be strict only with empty copies and hollow fluff. Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "score": <number 1-10, sum of the four dimension scores>,
  "accuracy": <number 0-3>,
  "depth": <number 0-3>,
  "relevance": <number 0-2>,
  "examples": <number 0-2>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "recommendation": "<string: 2-4 sentences of human, expert HR-style feedback in ${langName}>",
  "antiCheatFlags": [<string>, ...],
  "perfectAnswerSummary": "<string: one sentence describing what a strong (8-10/10) answer would contain>"
}`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as LLMResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in LLM response");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error(
          `Invalid JSON in LLM response: ${content.slice(0, 200)}`,
        );
      }
    } else {
      throw new Error(
        `No JSON found in LLM response: ${content.slice(0, 200)}`,
      );
    }
  }

  if (
    typeof parsed.score !== "number" ||
    typeof parsed.accuracy !== "number" ||
    typeof parsed.depth !== "number" ||
    typeof parsed.relevance !== "number" ||
    typeof parsed.examples !== "number" ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.weaknesses) ||
    typeof parsed.recommendation !== "string" ||
    !Array.isArray(parsed.antiCheatFlags) ||
    typeof parsed.perfectAnswerSummary !== "string"
  ) {
    throw new Error("Missing required fields in evaluation result");
  }

  let score = parsed.score;
  if (score < 1) score = 1;
  if (score > 10) score = 10;
  score = Math.round(score);

  const clampDimension = (v: number, max: number) =>
    Math.round(Math.max(0, Math.min(max, v)));

  return enforceAntiCheat(question, answer, jobProfile.language, {
    score,
    accuracy: clampDimension(parsed.accuracy, 3),
    depth: clampDimension(parsed.depth, 3),
    relevance: clampDimension(parsed.relevance, 2),
    examples: clampDimension(parsed.examples, 2),
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    recommendation: parsed.recommendation,
    antiCheatFlags: parsed.antiCheatFlags,
    perfectAnswerSummary: parsed.perfectAnswerSummary,
  });
}

export const evaluateAnswerTool = new FunctionTool({
  name: "evaluateAnswer",
  description:
    "Evaluates an interview answer and returns score, strengths, weaknesses, and recommendations",
  parameters: evaluateAnswerParams,
  execute: executeEvaluateAnswer,
});
