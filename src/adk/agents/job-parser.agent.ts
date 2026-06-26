import { LlmAgent, type LlmResponse } from "@google/adk";
import { z } from "zod";
import { parseJobTool } from "../tools/parse-job.tool.js";
import { llm } from "../llm.js";
import { getLastUserText, getFunctionResponse, forcedToolCall, toolResultAsModelResponse } from "../utils/llm-request-helpers.js";

const parsedJobSchema = z.object({
  role: z.string(),
  level: z.enum(["junior", "middle", "senior"]),
  skills: z.array(z.string()),
  softSkills: z.array(z.string()),
  keywords: z.array(z.string()),
  domain: z.string(),
  language: z.string(),
  minYearsExperience: z.number().nullable(),
});

export const jobParserAgent = new LlmAgent({
  name: "JobParserAgent",
  model: llm,
  description:
    "Parses job descriptions and extracts structured data including role, level, skills, and domain",
  instruction: `You are a job description analyzer. The user's message IS the full job description text.

Your workflow:
1. Call parseJobDescription with jobText set to the user's message.
2. After the tool returns, call set_model_response with the exact tool result.

Never ask the user to provide the job description again. Never reply with plain text.`,
  tools: [parseJobTool],
  outputKey: "parsedJob",
  outputSchema: parsedJobSchema,
  disallowTransferToParent: true,
  disallowTransferToPeers: true,
  beforeModelCallback: ({ request }): LlmResponse | undefined => {
    const toolResult = getFunctionResponse(request, "parseJobDescription");
    if (toolResult) {
      return toolResultAsModelResponse(toolResult);
    }

    const jobText = getLastUserText(request);
    if (!jobText.trim()) {
      return undefined;
    }

    return forcedToolCall("parseJobDescription", { jobText });
  },
});
