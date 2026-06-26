import { FunctionTool } from "@google/adk";
import { z } from "zod";

const fetchWeakTopicsParams = z.object({
  sessionId: z.string().describe("The session ID to fetch weak topics for"),
});

async function executeFetchWeakTopics(
  params: z.infer<typeof fetchWeakTopicsParams>,
): Promise<{ weakSkills: string[] }> {
  const { sessionId: _sessionId } = params;

  return { weakSkills: [] };
}

export const fetchWeakTopicsTool = new FunctionTool({
  name: "fetchWeakTopics",
  description:
    "Fetches the list of weak topics/skills for a given session",
  parameters: fetchWeakTopicsParams,
  execute: executeFetchWeakTopics,
});
