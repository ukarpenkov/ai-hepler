import { LlmAgent, type LlmResponse } from "@google/adk";
import { z } from "zod";
import { updateMemoryTool } from "../tools/update-memory.tool.js";
import { llm } from "../llm.js";
import {
  forcedToolCall,
  getFunctionResponse,
  readStateRecord,
  toolResultAsModelResponse,
} from "../utils/llm-request-helpers.js";

const memoryUpdateSchema = z.object({
  weakSkills: z.array(z.string()),
  answeredTopics: z.array(z.string()),
});

export const memoryAgent = new LlmAgent({
  name: "MemoryAgent",
  model: llm,
  description: "Updates user memory with weak skills and answered topics",
  instruction: `You update the user's skill memory using the updateMemory tool, then return the tool result as structured output.`,
  tools: [updateMemoryTool],
  outputKey: "memoryUpdate",
  outputSchema: memoryUpdateSchema,
  disallowTransferToParent: true,
  disallowTransferToPeers: true,
  beforeModelCallback: ({ request, context }): LlmResponse | undefined => {
    const toolResult = getFunctionResponse(request, "updateMemory");
    if (toolResult) {
      return toolResultAsModelResponse(toolResult);
    }

    const state = readStateRecord(context.state);
    const currentQuestion = state.currentQuestion as { topic?: string } | undefined;
    const evaluation = state.evaluation;
    const topic =
      currentQuestion?.topic ??
      (typeof state.topic === "string" ? state.topic : undefined);

    if (!evaluation || !topic) {
      return undefined;
    }

    return forcedToolCall("updateMemory", { evaluation, topic });
  },
});
