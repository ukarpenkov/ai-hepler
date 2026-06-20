import type { Redis } from "ioredis";
import type {
  ParsedJob,
  QuestionResult,
  EvaluationResult,
  CoachResult,
  MemoryUpdate,
} from "./types.js";
import { jobParserAgent } from "./job-parser.agent.js";
import { interviewerAgent } from "./interviewer.agent.js";
import { evaluatorAgent } from "./evaluator.agent.js";
import { coachAgent } from "./coach.agent.js";
import { memoryAgent } from "./memory.agent.js";
import { getSession, updateSession } from "../storage/session-store.js";

export async function parseJob(
  text: string,
  sessionId: string,
  redis: Redis,
  config: { apiKey: string }
): Promise<ParsedJob> {
  const output = await jobParserAgent(
    { sessionId, content: text },
    config
  );

  const parsed: ParsedJob = JSON.parse(output.result);
  await updateSession(redis, sessionId, { jobProfile: parsed });
  return parsed;
}

export async function startInterview(
  sessionId: string,
  redis: Redis,
  config: { apiKey: string }
): Promise<QuestionResult> {
  const session = await getSession(redis, sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  const output = await interviewerAgent({
    input: { sessionId, content: "" },
    jobProfile: session.jobProfile! as ParsedJob,
    weakSkills: session.weakSkills,
    previousQuestions: session.history.map((m) => m.content),
    config,
  });

  const question: QuestionResult = JSON.parse(output.result);
  await updateSession(redis, sessionId, {
    history: [
      ...session.history,
      { role: "assistant", content: output.result, timestamp: new Date().toISOString() },
    ],
  });
  return question;
}

export async function processAnswer(
  sessionId: string,
  answer: string,
  redis: Redis,
  config: { apiKey: string }
): Promise<{
  evaluation: EvaluationResult;
  coach: CoachResult;
  memory: MemoryUpdate;
  nextQuestion: QuestionResult;
}> {
  const session = await getSession(redis, sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  const lastMessage = session.history.filter((m) => m.role === "assistant").pop();
  const currentQuestion: QuestionResult = lastMessage
    ? JSON.parse(lastMessage.content)
    : { question: "", topic: "", difficulty: "easy" };

  const evalOutput = await evaluatorAgent({
    question: currentQuestion.question,
    answer,
    jobProfile: session.jobProfile! as ParsedJob,
    config,
  });
  const evaluation: EvaluationResult = JSON.parse(evalOutput.result);

  const coachOutput = await coachAgent({
    question: currentQuestion.question,
    answer,
    evaluation,
    jobProfile: session.jobProfile! as ParsedJob,
    config,
  });
  const coachResult: CoachResult = JSON.parse(coachOutput.result);

  const memOutput = await memoryAgent({
    sessionId,
    evaluation,
    questionTopic: currentQuestion.topic,
    redis,
  });
  const memoryUpdate: MemoryUpdate = JSON.parse(memOutput.result);

  const updatedSession = await getSession(redis, sessionId);
  const questionOutput = await interviewerAgent({
    input: { sessionId, content: "" },
    jobProfile: session.jobProfile! as ParsedJob,
    weakSkills: updatedSession?.weakSkills ?? [],
    previousQuestions: updatedSession?.history.map((m) => m.content) ?? [],
    config,
  });
  const nextQuestion: QuestionResult = JSON.parse(questionOutput.result);

  await updateSession(redis, sessionId, {
    history: [
      ...session.history,
      { role: "user", content: answer, timestamp: new Date().toISOString() },
      { role: "assistant", content: questionOutput.result, timestamp: new Date().toISOString() },
    ],
  });

  return { evaluation, coach: coachResult, memory: memoryUpdate, nextQuestion };
}
