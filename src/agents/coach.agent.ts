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

  const langNames: Record<string, string> = { ru: "Russian", de: "German", fr: "French", es: "Spanish", zh: "Chinese" };
  const langName = langNames[jobProfile.language] || "English";

  const systemPrompt = `You are a supportive but honest interview coach. Your goal is to help the candidate improve through specific, actionable feedback.

LANGUAGE: The job description and interview are in ${langName}. You MUST output all coaching feedback (explanation, improvedAnswer, tips) in ${langName}.

RULES:
1. Be direct about what was wrong — don't sugarcoat. The candidate needs to know exactly where they failed.
2. Provide a model answer that demonstrates the level expected for a ${jobProfile.level} ${jobProfile.role}. The model answer should be exemplary — what a 9-10/10 answer looks like.
3. Give tips that are SPECIFIC to the mistakes made, not generic career advice. Each tip must address a concrete weakness.
4. Focus teaching on the concepts the candidate struggled with. Explain WHY the correct approach matters.
5. If the candidate's answer had anti-cheat flags (paraphrasing, generic answers), address this directly and explain why genuine understanding matters.`;

  const userPrompt = `Position: ${jobProfile.role} (${jobProfile.level})
Domain: ${jobProfile.domain}

Interview Question:
${question}

Candidate's Answer:
${answer}

Evaluation:
- Overall Score: ${evaluation.score}/10
- Technical Accuracy: ${evaluation.accuracy}/3
- Depth of Understanding: ${evaluation.depth}/3
- Relevance & Specificity: ${evaluation.relevance}/2
- Examples & Application: ${evaluation.examples}/2
- Strengths: ${evaluation.strengths.join("; ")}
- Weaknesses: ${evaluation.weaknesses.join("; ")}
${evaluation.antiCheatFlags.length > 0 ? `- Anti-Cheat Flags: ${evaluation.antiCheatFlags.join(", ")}` : ""}
- What a great answer should contain: ${evaluation.perfectAnswerSummary}

Provide coaching feedback. Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "explanation": "<string: explain what the correct/ideal answer should contain and WHY those points matter>",
  "improvedAnswer": "<string: a model answer that would score 9-10/10 — demonstrate the quality expected>",
  "tips": ["<string: specific, actionable tip based on observed weaknesses>", ...]
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
        throw new Error(`Invalid JSON in LLM response: ${content.slice(0, 200)}`);
      }
    } else {
      throw new Error(`No JSON found in LLM response: ${content.slice(0, 200)}`);
    }
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
