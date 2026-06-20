import type { ParsedJob, EvaluationResult } from "../agents/types.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function evaluateAnswerTool(params: {
  question: string;
  answer: string;
  jobProfile: ParsedJob;
  config: { apiKey: string; baseUrl: string; model: string };
}): Promise<EvaluationResult> {
  const { question, answer, jobProfile, config } = params;

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
          content: `Evaluate this interview answer for ${jobProfile.role} (${jobProfile.level}) position. Question: ${question}. Answer: ${answer}. Required skills: ${jobProfile.skills.join(", ")}. Score 1-10, list strengths, weaknesses, give recommendation. Return JSON: { score: number, strengths: string[], weaknesses: string[], recommendation: string }`,
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
    typeof parsed.score !== "number" ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.weaknesses) ||
    typeof parsed.recommendation !== "string"
  ) {
    throw new Error("Missing required fields in evaluation result");
  }

  let score = parsed.score;
  if (score < 1) score = 1;
  if (score > 10) score = 10;
  score = Math.round(score);

  return {
    score,
    strengths: parsed.strengths,
    weaknesses: parsed.weaknesses,
    recommendation: parsed.recommendation,
  };
}
