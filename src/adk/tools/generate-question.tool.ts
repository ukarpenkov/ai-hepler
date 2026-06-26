import { FunctionTool } from "@google/adk";
import { z } from "zod";
import type { QuestionResult } from "../types.js";
import {
  normalizeLanguageCode,
  questionMatchesLanguage,
  resolveInterviewLanguage,
} from "../utils/language.js";
import {
  buildInterviewerSystemPrompt,
  buildInterviewerUserPrompt,
} from "../utils/interview-prompts.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

const validQuestionTypes: QuestionResult["questionType"][] = [
  "theoretical_explanation",
  "practical_implementation",
  "system_design",
  "debugging_scenario",
  "behavioral_experience",
];

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

const generateQuestionParams = z.object({
  jobProfile: jobProfileSchema.describe("The parsed job profile"),
  weakSkills: z.array(z.string()).describe("Skills the user is weak in"),
  previousQuestions: z.array(z.string()).describe("Questions already asked"),
  jobText: z
    .string()
    .optional()
    .describe("Original job posting text for vacancy-grounded questions"),
});

interface LlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function buildPrompts(
  jobProfile: z.infer<typeof jobProfileSchema>,
  weakSkills: string[],
  previousQuestions: string[],
  strictLanguageRetry: boolean,
  jobText?: string,
) {
  const languageCode = normalizeLanguageCode(jobProfile.language);

  return {
    systemPrompt: buildInterviewerSystemPrompt(
      jobProfile,
      previousQuestions,
      strictLanguageRetry,
    ),
    userPrompt: buildInterviewerUserPrompt(jobProfile, weakSkills, jobText),
    languageCode,
  };
}

async function callQuestionLlm(
  config: LlmConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
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

  return content;
}

function parseQuestionResult(content: string): QuestionResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error(`Invalid JSON in LLM response: ${content.slice(0, 200)}`);
      }
    } else {
      throw new Error(`No JSON found in LLM response: ${content.slice(0, 200)}`);
    }
  }

  if (
    typeof parsed.question !== "string" ||
    typeof parsed.topic !== "string" ||
    typeof parsed.difficulty !== "string" ||
    typeof parsed.questionType !== "string" ||
    !Array.isArray(parsed.expectedAnswerCriteria)
  ) {
    throw new Error("Missing required fields in question result");
  }

  const difficulty = parsed.difficulty as QuestionResult["difficulty"];
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new Error("Invalid difficulty value");
  }

  const questionType = parsed.questionType as QuestionResult["questionType"];
  if (!validQuestionTypes.includes(questionType)) {
    throw new Error(`Invalid question type: ${questionType}`);
  }

  return {
    question: parsed.question,
    topic: parsed.topic,
    difficulty,
    questionType,
    expectedAnswerCriteria: parsed.expectedAnswerCriteria.filter(
      (item): item is string => typeof item === "string",
    ),
  };
}

async function executeGenerateQuestion(
  params: z.infer<typeof generateQuestionParams>,
): Promise<QuestionResult> {
  const config = {
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com",
    model: process.env.LLM_MODEL || "deepseek-chat",
  };

  if (!config.apiKey) {
    throw new Error("DEEPSEEK_API_KEY environment variable is required");
  }

  const { jobProfile, weakSkills, previousQuestions, jobText } = params;
  const resolvedProfile = {
    ...jobProfile,
    language: resolveInterviewLanguage(jobProfile, jobText),
  };

  for (const strictLanguageRetry of [false, true]) {
    const { systemPrompt, userPrompt, languageCode } = buildPrompts(
      resolvedProfile,
      weakSkills,
      previousQuestions,
      strictLanguageRetry,
      jobText,
    );
    const content = await callQuestionLlm(config, systemPrompt, userPrompt);
    const result = parseQuestionResult(content);

    if (questionMatchesLanguage(result, languageCode)) {
      return result;
    }
  }

  throw new Error(
    `Generated question is not in required language: ${resolvedProfile.language}`,
  );
}

export const generateQuestionTool = new FunctionTool({
  name: "generateQuestion",
  description:
    "Generates an interview question based on job profile, weak skills, and previous questions",
  parameters: generateQuestionParams,
  execute: executeGenerateQuestion,
});
