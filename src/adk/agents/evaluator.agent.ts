import { LlmAgent, type LlmResponse } from "@google/adk";
import { z } from "zod";
import { evaluateAnswerTool } from "../tools/evaluate-answer.tool.js";
import { llm } from "../llm.js";
import type { ParsedJob } from "../types.js";
import { resolveInterviewLanguage } from "../utils/language.js";
import {
  forcedToolCall,
  getFunctionResponse,
  getLastUserText,
  readStateRecord,
  toolResultAsModelResponse,
} from "../utils/llm-request-helpers.js";

const evaluationResultSchema = z.object({
  score: z.number(),
  accuracy: z.number(),
  depth: z.number(),
  relevance: z.number(),
  examples: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendation: z.string(),
  antiCheatFlags: z.array(z.string()),
  perfectAnswerSummary: z.string(),
});

export const evaluatorAgent = new LlmAgent({
  name: "EvaluatorAgent",
  model: llm,
  description:
    "Evaluates interview answers and provides detailed feedback with scores",
  instruction: `You evaluate the candidate's answer to the interview question using the evaluateAnswer tool, then return the tool result as structured output.`,
  tools: [evaluateAnswerTool],
  outputKey: "evaluation",
  outputSchema: evaluationResultSchema,
  disallowTransferToParent: true,
  disallowTransferToPeers: true,
  beforeModelCallback: ({ request, context }): LlmResponse | undefined => {
    const toolResult = getFunctionResponse(request, "evaluateAnswer");
    if (toolResult) {
      return toolResultAsModelResponse(toolResult);
    }

    const state = readStateRecord(context.state);
    const currentQuestion = state.currentQuestion as { question?: string } | undefined;
    const question = state.question ?? currentQuestion?.question;
    const answer = state.answer ?? getLastUserText(request);
    const jobProfile = state.jobProfile as ParsedJob | undefined;

    if (!question || !answer || !jobProfile) {
      return undefined;
    }

    const jobText = typeof state.jobText === "string" ? state.jobText : undefined;
    const resolvedProfile: ParsedJob = {
      ...jobProfile,
      language: resolveInterviewLanguage(jobProfile, jobText),
    };

    return forcedToolCall("evaluateAnswer", {
      question,
      answer,
      jobProfile: resolvedProfile,
      jobText,
    });
  },
});
