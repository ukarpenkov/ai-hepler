import { LlmAgent, type LlmResponse } from "@google/adk";
import { z } from "zod";
import { generateQuestionTool } from "../tools/generate-question.tool.js";
import { llm } from "../llm.js";
import type { ParsedJob } from "../types.js";
import { resolveInterviewLanguage } from "../utils/language.js";
import {
  extractPreviousQuestions,
  forcedToolCall,
  getFunctionResponse,
  readStateRecord,
  toolResultAsModelResponse,
} from "../utils/llm-request-helpers.js";

const questionResultSchema = z.object({
  question: z.string(),
  topic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionType: z.enum([
    "theoretical_explanation",
    "practical_implementation",
    "system_design",
    "debugging_scenario",
    "behavioral_experience",
  ]),
  expectedAnswerCriteria: z.array(z.string()),
});

export const interviewerAgent = new LlmAgent({
  name: "InterviewerAgent",
  model: llm,
  description:
    "Generates personalized interview questions based on job profile and user's weak areas",
  instruction: `You generate interview questions using the generateQuestion tool, then return the tool result as structured output.`,
  tools: [generateQuestionTool],
  outputKey: "currentQuestion",
  outputSchema: questionResultSchema,
  disallowTransferToParent: true,
  disallowTransferToPeers: true,
  beforeModelCallback: ({ request, context }): LlmResponse | undefined => {
    const toolResult = getFunctionResponse(request, "generateQuestion");
    if (toolResult) {
      return toolResultAsModelResponse(toolResult);
    }

    const state = readStateRecord(context.state);
    const jobProfile = state.jobProfile as ParsedJob | undefined;
    if (!jobProfile) {
      return undefined;
    }

    const jobText = typeof state.jobText === "string" ? state.jobText : undefined;
    const resolvedProfile: ParsedJob = {
      ...jobProfile,
      language: resolveInterviewLanguage(jobProfile, jobText),
    };

    return forcedToolCall("generateQuestion", {
      jobProfile: resolvedProfile,
      weakSkills: state.weakSkills ?? [],
      previousQuestions: extractPreviousQuestions(state),
      jobText,
    });
  },
});
