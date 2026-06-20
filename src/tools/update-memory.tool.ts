import type { Redis } from "ioredis";
import type { EvaluationResult, MemoryUpdate } from "../agents/types.js";
import { getSession, updateSession } from "../storage/session-store.js";

export async function updateMemoryTool(params: {
  sessionId: string;
  evaluation: EvaluationResult;
  questionTopic: string;
  redis: Redis;
}): Promise<MemoryUpdate> {
  const { sessionId, evaluation, questionTopic, redis } = params;

  const session = await getSession(redis, sessionId);

  const weakSkills = session?.weakSkills ? [...session.weakSkills] : [];

  if (evaluation.score < 5) {
    if (!weakSkills.includes(questionTopic)) {
      weakSkills.push(questionTopic);
    }
  } else if (evaluation.score >= 7) {
    const index = weakSkills.indexOf(questionTopic);
    if (index !== -1) {
      weakSkills.splice(index, 1);
    }
  }

  await updateSession(redis, sessionId, { weakSkills });

  return {
    weakSkills,
    answeredTopics: [questionTopic],
  };
}
