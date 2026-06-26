import { LlmAgent, type LlmResponse } from "@google/adk";
import { z } from "zod";
import { coachAnswerTool } from "../tools/coach-answer.tool.js";
import { llm } from "../llm.js";
import {
  forcedToolCall,
  getFunctionResponse,
  readStateRecord,
  toolResultAsModelResponse,
} from "../utils/llm-request-helpers.js";
import type { EvaluationResult, ParsedJob } from "../types.js";

const coachResultSchema = z.object({
  explanation: z.string().min(40),
  improvedAnswer: z.string().min(80),
  tips: z.array(z.string().min(15)).min(2),
});

function readEvaluation(state: Record<string, unknown>): EvaluationResult | undefined {
  const evaluation = state.evaluation;
  if (!evaluation || typeof evaluation !== "object") {
    return undefined;
  }

  const value = evaluation as Record<string, unknown>;
  if (typeof value.score !== "number" || typeof value.recommendation !== "string") {
    return undefined;
  }

  return evaluation as EvaluationResult;
}

function readLanguage(state: Record<string, unknown>): string {
  const jobProfile = state.jobProfile as ParsedJob | undefined;
  return typeof jobProfile?.language === "string" ? jobProfile.language : "en";
}

export const coachAgent = new LlmAgent({
  name: "CoachAgent",
  model: llm,
  description:
    "Provides coaching feedback and improvement tips based on evaluation",
  instruction: `You provide coaching feedback using the coachAnswer tool, then return the tool result as structured output.`,
  tools: [coachAnswerTool],
  outputKey: "coachFeedback",
  outputSchema: coachResultSchema,
  disallowTransferToParent: true,
  disallowTransferToPeers: true,
  beforeModelCallback: ({ request, context }): LlmResponse | undefined => {
    const toolResult = getFunctionResponse(request, "coachAnswer");
    if (toolResult) {
      return toolResultAsModelResponse(toolResult);
    }

    const state = readStateRecord(context.state);
    const currentQuestion = state.currentQuestion as { question?: string } | undefined;
    const question = state.question ?? currentQuestion?.question;
    const answer = typeof state.answer === "string" ? state.answer : undefined;
    const evaluation = readEvaluation(state);
    const jobProfile = state.jobProfile as ParsedJob | undefined;

    if (!question || !answer || !evaluation || !jobProfile) {
      return undefined;
    }

    return forcedToolCall("coachAnswer", {
      question,
      answer,
      evaluation,
      language: readLanguage(state),
      jobProfile: {
        role: jobProfile.role,
        level: jobProfile.level,
        domain: jobProfile.domain,
        skills: jobProfile.skills,
        keywords: jobProfile.keywords,
      },
    });
  },
});
