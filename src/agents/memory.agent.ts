import type { Redis } from "ioredis";
import type { AgentOutput, EvaluationResult, MemoryUpdate } from "./types.js";
import { updateMemoryTool } from "../tools/update-memory.tool.js";
import { fetchWeakTopicsTool } from "../tools/fetch-weak-topics.tool.js";
import { defaultGuard } from "../security/toolAccess.js";

export async function memoryAgent(params: {
  sessionId: string;
  evaluation: EvaluationResult;
  questionTopic: string;
  redis: Redis | null;
}): Promise<AgentOutput> {
  const { sessionId, evaluation, questionTopic, redis } = params;

  if (!defaultGuard.checkAccess("updateMemoryTool", "agent")) {
    throw new Error("Access denied: updateMemoryTool not allowed in current context");
  }

  if (!defaultGuard.checkAccess("fetchWeakTopicsTool", "agent")) {
    throw new Error("Access denied: fetchWeakTopicsTool not allowed in current context");
  }

  const memoryUpdate = await updateMemoryTool({
    sessionId,
    evaluation,
    questionTopic,
    redis,
  });

  const weakSkills = await fetchWeakTopicsTool({ sessionId, redis });

  const result: MemoryUpdate = {
    weakSkills,
    answeredTopics: memoryUpdate.answeredTopics,
  };

  return {
    agentName: "memory",
    result: JSON.stringify(result),
  };
}
