import type { AgentOutput, ParsedJob } from "./types.js";
import { evaluateAnswerTool } from "../tools/evaluate-answer.tool.js";
import { defaultGuard } from "../security/toolAccess.js";

export async function evaluatorAgent(params: {
  question: string;
  answer: string;
  jobProfile: ParsedJob;
  config: { apiKey: string; baseUrl: string; model: string };
}): Promise<AgentOutput> {
  const { question, answer, jobProfile, config } = params;

  if (!defaultGuard.checkAccess("evaluateAnswerTool", "agent")) {
    throw new Error("Access denied: evaluateAnswerTool not allowed in current context");
  }

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
