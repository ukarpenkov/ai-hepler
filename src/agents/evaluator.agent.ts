import type { AgentOutput, ParsedJob } from "./types.js";
import { evaluateAnswerTool } from "../tools/evaluate-answer.tool.js";

export async function evaluatorAgent(params: {
  question: string;
  answer: string;
  jobProfile: ParsedJob;
  config: { apiKey: string };
}): Promise<AgentOutput> {
  const { question, answer, jobProfile, config } = params;

  const evaluation = await evaluateAnswerTool({
    question,
    answer,
    jobProfile,
    config,
  });

  return {
    agentName: "evaluator",
    result: JSON.stringify(evaluation),
  };
}
