import { FunctionTool } from "@google/adk";
import { z } from "zod";
import type { MemoryUpdate } from "../../agents/types.js";

const updateMemoryParams = z.object({
  evaluation: z
    .object({
      score: z.number(),
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
    })
    .describe("The evaluation result"),
  topic: z.string().describe("The question topic"),
});

async function executeUpdateMemory(
  params: z.infer<typeof updateMemoryParams>,
): Promise<MemoryUpdate> {
  const { evaluation, topic } = params;

  const weakSkills: string[] = [];
  const answeredTopics: string[] = [];

  if (evaluation.score < 5) {
    weakSkills.push(topic);
  }

  if (evaluation.score >= 7) {
    const idx = weakSkills.indexOf(topic);
    if (idx !== -1) {
      weakSkills.splice(idx, 1);
    }
  }

  answeredTopics.push(topic);

  return {
    weakSkills,
    answeredTopics,
  };
}

export const updateMemoryTool = new FunctionTool({
  name: "updateMemory",
  description:
    "Updates user memory with weak skills and answered topics based on evaluation",
  parameters: updateMemoryParams,
  execute: executeUpdateMemory,
});
