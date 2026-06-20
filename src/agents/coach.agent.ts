import type { AgentOutput, CoachResult, EvaluationResult, ParsedJob } from "./types.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function coachAgent(params: {
  question: string;
  answer: string;
  evaluation: EvaluationResult;
  jobProfile: ParsedJob;
  config: { apiKey: string; baseUrl: string; model: string };
}): Promise<AgentOutput> {
  const { question, answer, evaluation, jobProfile, config } = params;

  const prompt = `You are an interview coach. For ${jobProfile.role} (${jobProfile.level}) position. Question was: ${question}. Candidate answered: ${answer}. Score: ${evaluation.score}/10. Strengths: ${evaluation.strengths.join(", ")}. Weaknesses: ${evaluation.weaknesses.join(", ")}. Provide: explanation of correct answer, improved version of candidate's answer, 3 practical tips. Return JSON: { explanation: string, improvedAnswer: string, tips: string[] }`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
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
    typeof parsed.explanation !== "string" ||
    typeof parsed.improvedAnswer !== "string" ||
    !Array.isArray(parsed.tips)
  ) {
    throw new Error("Missing required fields in coach result");
  }

  const result: CoachResult = {
    explanation: parsed.explanation,
    improvedAnswer: parsed.improvedAnswer,
    tips: parsed.tips,
  };

  return {
    agentName: "coach",
    result: JSON.stringify(result),
  };
}
