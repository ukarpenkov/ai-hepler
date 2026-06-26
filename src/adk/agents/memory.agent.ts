import { LlmAgent } from "@google/adk";
import { updateMemoryTool } from "../tools/update-memory.tool.js";
import { llm } from "../llm.js";

export const memoryAgent = new LlmAgent({
  name: "MemoryAgent",
  model: llm,
  description: "Updates user memory with weak skills and answered topics",
  instruction: `You are a memory manager for the interview system. Update the user's skill memory based on their performance.

Use the updateMemory tool with:
- evaluation: the evaluation result
- topic: the question topic

The tool will update weakSkills based on the score:
- Score < 5: topic added to weakSkills
- Score >= 7: topic removed from weakSkills

Return the updated memory state.`,
  tools: [updateMemoryTool],
  outputKey: "memoryUpdate",
});
