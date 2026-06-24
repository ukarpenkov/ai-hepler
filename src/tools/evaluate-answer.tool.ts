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

  const langNames: Record<string, string> = { ru: "Russian", de: "German", fr: "French", es: "Spanish", zh: "Chinese" };
  const langName = langNames[jobProfile.language] || "English";

  const systemPrompt = `You are a strict technical interviewer and evaluator for a ${jobProfile.level} ${jobProfile.role} position. You must evaluate candidate answers ruthlessly and honestly. Your goal is to identify real competence, not just fluent-sounding text.

LANGUAGE: The job description and interview are in ${langName}. You MUST output all evaluation fields (strengths, weaknesses, recommendation, perfectAnswerSummary) in ${langName}.

CRITICAL ANTI-CHEAT RULES:
- If the answer merely paraphrases or echoes the question without adding original content, this is CHEATING — score it 1-2 and flag "paraphrasing_question".
- If the answer copy-pastes the question text or rephrases it without adding any substance, score it 1 and flag "paraphrasing_question".
- If the answer uses buzzwords without demonstrating understanding (e.g. says "use microservices" without explaining why/how), flag "buzzwords_without_substance".
- If the answer consists of generic platitudes (e.g. "it depends", "I would use best practices", "follow SOLID principles") without any specifics or concrete reasoning, flag "generic_answer".
- If the answer shows no original thought, personal experience, or independent reasoning, flag "no_original_thought".
- If the answer is about a completely different topic than the question asked, flag "off_topic".
- You MUST check: does the answer actually address the specific question asked, or is it a word-salad of adjacent keywords?

SCORING RUBRIC (total 0-10 points):

Dimension 1 — Technical Accuracy (0-3 points):
- 3: All technical claims are correct, precise, and use terminology properly
- 2: Mostly correct, minor imprecisions or oversimplifications
- 1: Contains factual errors, misconceptions, or outdated information
- 0: Fundamentally wrong, no technical content, or the answer is just paraphrasing the question

Dimension 2 — Depth of Understanding (0-3 points):
- 3: Shows deep understanding beyond surface level — explains WHY not just WHAT, discusses tradeoffs, edge cases, or underlying principles
- 2: Adequate understanding, some depth but could go further — covers the basics competently
- 1: Shallow/superficial explanation — only surface-level knowledge, textbook definitions without insight
- 0: No demonstration of real understanding — pure keyword matching or question paraphrasing

Dimension 3 — Relevance & Specificity (0-2 points):
- 2: Answer is directly and fully relevant with specific, concrete details tied to the question
- 1: Partially relevant, somewhat vague, or partially off-topic
- 0: Off-topic, generic platitudes with no connection to the question, or just rephrases the question

Dimension 4 — Examples & Application (0-2 points):
- 2: Provides concrete, realistic examples or practical applications that demonstrate hands-on experience
- 1: Mentions examples but they are vague, hypothetical, or textbook-sourced without elaboration
- 0: No examples at all, or examples are fabricated/generic (e.g. "we used microservices to scale")

The total score is the sum of the four dimension scores.`;

  const userPrompt = `Job context: ${jobProfile.role} (${jobProfile.level}), domain: ${jobProfile.domain}.
Required skills: ${jobProfile.skills.join(", ")}.
${jobProfile.softSkills.length > 0 ? `Required soft skills: ${jobProfile.softSkills.join(", ")}.` : ""}

INTERVIEW QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

Evaluate the answer strictly according to the rubric. Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "score": <number 1-10, sum of the four dimension scores>,
  "accuracy": <number 0-3>,
  "depth": <number 0-3>,
  "relevance": <number 0-2>,
  "examples": <number 0-2>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "recommendation": "<string: 1-2 sentences evaluating the candidate for this position based on this answer>",
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

  const clampDimension = (v: number, max: number) => Math.round(Math.max(0, Math.min(max, v)));

  return {
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
  };
}
