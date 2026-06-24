import type { ParsedJob, QuestionResult } from "../agents/types.js";

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

export async function generateQuestionTool(params: {
  jobProfile: ParsedJob;
  weakSkills: string[];
  previousQuestions: string[];
  config: { apiKey: string; baseUrl: string; model: string };
}): Promise<QuestionResult> {
  const { jobProfile, weakSkills, previousQuestions, config } = params;

  const weakText = weakSkills.length > 0 ? weakSkills.join(", ") : "none";
  const previousText = previousQuestions.length > 0 ? previousQuestions.join("; ") : "none";

  const systemPrompt = `You are a seasoned technical interviewer at a top tech company. You conduct interviews for ${jobProfile.level} ${jobProfile.role} positions. Your questions should be challenging, relevant, and reveal true competence — not just memorized answers.

QUESTION DESIGN PRINCIPLES:
1. Ask questions that require THINKING, not recall. Avoid "What is X?" — prefer "When would you use X over Y?" or "How would you design a system for..."
2. Vary question types between: theoretical_explanation, practical_implementation, system_design, debugging_scenario, behavioral_experience.
3. Each question MUST include 3-5 expected_answer_criteria — key points a strong answer must cover (used internally by the evaluator, NEVER shown to the candidate).
4. Use specific technologies and scenarios from the job's domain and keywords. Contextualize questions to the actual role.
5. For ${jobProfile.level} level: junior=fundamentals, middle=architecture+tradeoffs, senior=system design+leadership.

DIFFICULTY GUIDELINES:
- easy: Single concept, direct question, expects clear explanation of a fundamental
- medium: Compare/contrast, practical scenario, expects reasoning and concrete examples
- hard: System design, tradeoff analysis, edge cases, expects deep thinking and original solutions

AVOID:
- Questions that can be answered with a one-word or one-sentence response
- Trivia questions about syntax or API method names
- Questions that have already been asked: ${previousText}`;

  const userPrompt = `Position: ${jobProfile.role} (${jobProfile.level})
Domain: ${jobProfile.domain}
Tech stack / required skills: ${jobProfile.skills.join(", ")}
Keywords from job description: ${jobProfile.keywords.join(", ")}
Weak areas of candidate (focus on these): ${weakText}

Generate ONE interview question. Vary the question type from previous rounds. Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "question": "<string: the question text>",
  "topic": "<string: specific topic/skill this question tests>",
  "difficulty": "easy"|"medium"|"hard",
  "questionType": "theoretical_explanation"|"practical_implementation"|"system_design"|"debugging_scenario"|"behavioral_experience",
  "expectedAnswerCriteria": ["<string: specific point a good answer must include>", ...]
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
    expectedAnswerCriteria: parsed.expectedAnswerCriteria,
  };
}
