import type { AgentInput, AgentOutput, ParsedJob } from "./types.js";
import { generateQuestionTool } from "../tools/generate-question.tool.js";
import { defaultGuard } from "../security/toolAccess.js";

export async function interviewerAgent(params: {
  input: AgentInput;
  jobProfile: ParsedJob;
  weakSkills: string[];
  previousQuestions: string[];
  config: { apiKey: string; baseUrl: string; model: string };
}): Promise<AgentOutput> {
  const { input, jobProfile, weakSkills, previousQuestions, config } = params;

  if (!defaultGuard.checkAccess("generateQuestionTool", "agent")) {
    throw new Error("Access denied: generateQuestionTool not allowed in current context");
  }

  const questionResult = await generateQuestionTool({
    jobProfile,
    weakSkills,
    previousQuestions,
    config,
  });

  return {
    agentName: "interviewer",
    result: JSON.stringify(questionResult),
    metadata: { sessionId: input.sessionId },
  };
}
