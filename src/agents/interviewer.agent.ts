import type { AgentInput, AgentOutput, ParsedJob } from "./types.js";
import { generateQuestionTool } from "../tools/generate-question.tool.js";

export async function interviewerAgent(params: {
  input: AgentInput;
  jobProfile: ParsedJob;
  weakSkills: string[];
  previousQuestions: string[];
  config: { apiKey: string; baseUrl: string; model: string };
}): Promise<AgentOutput> {
  const { input, jobProfile, weakSkills, previousQuestions, config } = params;

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
