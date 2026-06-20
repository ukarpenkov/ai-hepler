import type { ParsedJob, QuestionResult } from "../agents/types.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function generateQuestionTool(params: {
  jobProfile: ParsedJob;
  weakSkills: string[];
  previousQuestions: string[];
  config: { apiKey: string; baseUrl: string; model: string };
}): Promise<QuestionResult> {
  const { jobProfile, weakSkills, previousQuestions, config } = params;

  const weakText = weakSkills.length > 0 ? weakSkills.join(", ") : "none";
  const previousText = previousQuestions.length > 0 ? previousQuestions.join("; ") : "none";

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "user",
          content: `Generate an interview question for ${jobProfile.role} position (${jobProfile.level} level). Required skills: ${jobProfile.skills.join(", ")}. Weak areas to focus on: ${weakText}. Avoid repeating: ${previousText}. Return JSON: { question: string, topic: string, difficulty: easy|medium|hard }`,
        },
      ],
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
    throw new Error("Invalid JSON in LLM response");
  }

  if (
    typeof parsed.question !== "string" ||
    typeof parsed.topic !== "string" ||
    typeof parsed.difficulty !== "string"
  ) {
    throw new Error("Missing required fields in question result");
  }

  const difficulty = parsed.difficulty as QuestionResult["difficulty"];
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new Error("Invalid difficulty value");
  }

  return {
    question: parsed.question,
    topic: parsed.topic,
    difficulty,
  };
}
