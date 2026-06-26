import { LlmAgent } from "@google/adk";
import { evaluateAnswerTool } from "../tools/evaluate-answer.tool.js";

export const evaluatorAgent = new LlmAgent({
  name: "EvaluatorAgent",
  model: process.env.LLM_MODEL || "deepseek/deepseek-chat",
  description:
    "Evaluates interview answers and provides detailed feedback with scores",
  instruction: `You are an expert technical evaluator. Evaluate the candidate's answer to the interview question.

Use the evaluateAnswer tool with:
- question: the current interview question
- answer: the user's answer
- jobProfile: the parsed job profile

Provide a comprehensive evaluation including:
- Overall score (0-10)
- Accuracy, depth, relevance, examples scores
- Strengths and weaknesses
- Recommendation
- Perfect answer summary

Be fair but thorough in your evaluation.`,
  tools: [evaluateAnswerTool],
  outputKey: "evaluation",
});
