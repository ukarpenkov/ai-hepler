import { FunctionTool } from "@google/adk";
import { z } from "zod";
import type { CoachResult, EvaluationResult, ParsedJob } from "../types.js";
import { getLanguageName, normalizeLanguageCode } from "../utils/language.js";
import { buildCoachPersona, isItVacancy } from "../utils/evaluation-prompts.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

const evaluationInputSchema = z.object({
  score: z.number(),
  accuracy: z.number(),
  depth: z.number(),
  relevance: z.number(),
  examples: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendation: z.string(),
  antiCheatFlags: z.array(z.string()),
  perfectAnswerSummary: z.string(),
});

const coachAnswerParams = z.object({
  question: z.string().describe("The interview question"),
  answer: z.string().describe("The candidate's answer"),
  evaluation: evaluationInputSchema.describe("The evaluation result from EvaluatorAgent"),
  language: z.string().describe("Interview language code, e.g. en or ru"),
  jobProfile: z.object({
    role: z.string(),
    level: z.enum(["junior", "middle", "senior"]),
    domain: z.string(),
    skills: z.array(z.string()),
    keywords: z.array(z.string()),
  }).describe("Job context for coaching tone"),
});

const MIN_EXPLANATION_LENGTH = 40;
const MIN_IMPROVED_ANSWER_LENGTH = 80;
const MIN_TIP_LENGTH = 15;

function buildFallbackCoach(
  question: string,
  evaluation: EvaluationResult,
  language: string,
): CoachResult {
  const dimensionSummary = [
    `accuracy ${evaluation.accuracy}/3`,
    `depth ${evaluation.depth}/3`,
    `relevance ${evaluation.relevance}/2`,
    `examples ${evaluation.examples}/2`,
  ].join(", ");

  const tips =
    evaluation.weaknesses.length > 0
      ? evaluation.weaknesses.slice(0, 4)
      : evaluation.antiCheatFlags.includes("paraphrasing_question")
        ? language.startsWith("ru")
          ? [
              "Не копируйте вопрос — опишите свой подход своими словами.",
              "Даже если знаете не всё, покажите ход мыслей и что уточнили бы первым.",
            ]
          : [
              "Do not copy the question — explain your approach in your own words.",
              "Even if you do not know everything, show your reasoning and what you would clarify first.",
            ]
        : language.startsWith("ru")
          ? ["Добавьте конкретные шаги, инструменты и пример из практики."]
          : ["Add concrete steps, tools, and one practical example."];

  return {
    explanation: `Your answer scored ${evaluation.score}/10 (${dimensionSummary}). ${evaluation.recommendation}`,
    improvedAnswer: `${evaluation.perfectAnswerSummary} Expand this with concrete steps, tradeoffs, and one realistic example tied to the question.`,
    tips,
  };
}

function isValidCoachResult(value: CoachResult): boolean {
  return (
    value.explanation.length >= MIN_EXPLANATION_LENGTH &&
    value.improvedAnswer.length >= MIN_IMPROVED_ANSWER_LENGTH &&
    value.tips.length >= 2 &&
    value.tips.every((tip) => tip.length >= MIN_TIP_LENGTH)
  );
}

async function executeCoachAnswer(
  params: z.infer<typeof coachAnswerParams>,
): Promise<CoachResult> {
  const config = {
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com",
    model: process.env.LLM_MODEL || "deepseek-chat",
  };

  if (!config.apiKey) {
    throw new Error("DEEPSEEK_API_KEY environment variable is required");
  }

  const { question, answer, evaluation, language, jobProfile } = params;
  const fallback = buildFallbackCoach(question, evaluation, language);

  const langName = getLanguageName(language);
  const languageCode = normalizeLanguageCode(language);

  const expertLabel = isItVacancy(jobProfile as ParsedJob)
    ? `senior ${jobProfile.role}`
    : `master practitioner in ${jobProfile.domain}`;

  const systemPrompt = `${buildCoachPersona(jobProfile as ParsedJob)}

LANGUAGE: Write explanation, improvedAnswer, and every tip in ${langName} (${languageCode}).

COACHING STYLE:
- Write like a thoughtful ${expertLabel} speaking to a candidate after the interview round.
- Start by acknowledging what the candidate did well — effort, honest reasoning, useful ideas, or relevant experience.
- Then explain gaps clearly but respectfully. Never be dismissive or robotic.
- If the answer was incomplete but showed genuine thinking, encourage that approach and show how to deepen it.
- If the answer was a blank copy of the question, explain why that fails in real interviews and how to recover with an honest attempt.

REQUIREMENTS:
- explanation: 4-6 sentences. Human, specific, empathetic. Reference score and what you noticed in THEIR answer.
- improvedAnswer: A model answer at 9-10/10 for THIS question. Concrete steps, reasoning, tradeoffs, and a realistic example. Minimum 4-6 sentences.
- tips: 3-5 actionable tips tied to their weaknesses. Each tip is a complete sentence with specific advice.`;

  const userPrompt = `INTERVIEW QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

EVALUATION:
- Score: ${evaluation.score}/10
- Accuracy: ${evaluation.accuracy}/3, Depth: ${evaluation.depth}/3, Relevance: ${evaluation.relevance}/2, Examples: ${evaluation.examples}/2
- Strengths: ${evaluation.strengths.length > 0 ? evaluation.strengths.join("; ") : "none noted"}
- Weaknesses: ${evaluation.weaknesses.length > 0 ? evaluation.weaknesses.join("; ") : "none noted"}
- Anti-cheat flags: ${evaluation.antiCheatFlags.length > 0 ? evaluation.antiCheatFlags.join(", ") : "none"}
- Evaluator recommendation: ${evaluation.recommendation}
- Perfect answer summary: ${evaluation.perfectAnswerSummary}

Return ONLY valid JSON (no markdown, no text outside JSON):
{
  "explanation": "<string: detailed coaching explanation>",
  "improvedAnswer": "<string: model answer for this question>",
  "tips": ["<string>", ...]
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
    return fallback;
  }

  const data = (await response.json()) as LLMResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return fallback;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallback;
    }
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return fallback;
    }
  }

  if (
    typeof parsed.explanation !== "string" ||
    typeof parsed.improvedAnswer !== "string" ||
    !Array.isArray(parsed.tips) ||
    !parsed.tips.every((tip) => typeof tip === "string")
  ) {
    return fallback;
  }

  const result: CoachResult = {
    explanation: parsed.explanation.trim(),
    improvedAnswer: parsed.improvedAnswer.trim(),
    tips: parsed.tips.map((tip) => (tip as string).trim()).filter(Boolean),
  };

  return isValidCoachResult(result) ? result : fallback;
}

export const coachAnswerTool = new FunctionTool({
  name: "coachAnswer",
  description:
    "Generates detailed coaching feedback with explanation, model answer, and improvement tips",
  parameters: coachAnswerParams,
  execute: executeCoachAnswer,
});
