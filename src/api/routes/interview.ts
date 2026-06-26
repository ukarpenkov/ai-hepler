import type { FastifyInstance } from "fastify";
import type { ParsedJob } from "../../adk/types.js";
import type { InterviewMessage } from "../../storage/session-store.js";
import { interviewerRunner, interviewRunner } from "../../adk/runner.js";
import { isValidSessionId, isValidAnswer } from "../../utils/validators.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";
import { mergeAgentOutput } from "../../adk/utils/extract-output.js";
import { extractPreviousQuestions } from "../../adk/utils/llm-request-helpers.js";

function previousQuestionsFromHistory(history: InterviewMessage[]): string[] {
  return extractPreviousQuestions({ history });
}

function isValidQuestion(value: Record<string, unknown>): boolean {
  return typeof value.question === "string" && typeof value.topic === "string";
}

function isValidEvaluation(value: Record<string, unknown>): boolean {
  return typeof value.score === "number";
}

function isValidCoach(value: Record<string, unknown>): boolean {
  return (
    typeof value.explanation === "string" &&
    value.explanation.length >= 40 &&
    typeof value.improvedAnswer === "string" &&
    value.improvedAnswer.length >= 80 &&
    Array.isArray(value.tips) &&
    value.tips.length >= 2 &&
    value.tips.every((tip) => typeof tip === "string" && tip.length >= 15)
  );
}

function isValidMemoryUpdate(value: Record<string, unknown>): boolean {
  return Array.isArray(value.weakSkills) && Array.isArray(value.answeredTopics);
}

export async function interviewRoutes(app: FastifyInstance) {
  app.post("/interview/start", async (request, reply) => {
    const body = request.body as {
      sessionId?: string;
      jobText?: string;
      jobProfile?: ParsedJob;
      weakSkills?: string[];
      history?: InterviewMessage[];
    };

    if (!body.sessionId || !isValidSessionId(body.sessionId)) {
      return reply.status(400).send({ error: "Valid sessionId UUID is required" });
    }

    if (!body.jobProfile) {
      return reply.status(400).send({ error: "jobProfile is required" });
    }

    try {
      let currentQuestion: Record<string, unknown> = {};
      let updatedHistory: InterviewMessage[] = body.history ?? [];

      for await (const event of interviewerRunner.runEphemeral({
        userId: body.sessionId,
        newMessage: { parts: [{ text: "Generate the first interview question" }] },
        stateDelta: {
          jobProfile: body.jobProfile,
          jobText: body.jobText,
          weakSkills: body.weakSkills ?? [],
          previousQuestions: previousQuestionsFromHistory(body.history ?? []),
        },
      })) {
        currentQuestion = mergeAgentOutput(currentQuestion, event, "currentQuestion", isValidQuestion);
      }

      if (!isValidQuestion(currentQuestion)) {
        request.log.error({ currentQuestion }, "startInterview returned invalid question");
        return reply.status(500).send({ error: "Failed to start interview. Please try again." });
      }

      updatedHistory = [
        ...updatedHistory,
        {
          role: "assistant",
          content: JSON.stringify(currentQuestion),
          timestamp: new Date().toISOString(),
        },
      ];

      return { question: currentQuestion, updatedHistory };
    } catch (e) {
      request.log.error(e, "startInterview failed");
      return reply.status(500).send({ error: "Failed to start interview. Please try again." });
    }
  });

  app.post("/interview/answer", async (request, reply) => {
    const body = request.body as {
      sessionId?: string;
      answer?: string;
      sessionData?: {
        jobText?: string;
        jobProfile: ParsedJob;
        history: InterviewMessage[];
        weakSkills: string[];
      };
    };

    if (!body.sessionId || !isValidSessionId(body.sessionId)) {
      return reply.status(400).send({ error: "Valid sessionId UUID is required" });
    }

    if (!body.answer || !isValidAnswer(body.answer)) {
      return reply.status(400).send({ error: "Answer is required and must be at least 10 characters" });
    }

    if (!body.sessionData?.jobProfile) {
      return reply.status(400).send({ error: "sessionData with jobProfile is required" });
    }

    let sanitized: string;
    try {
      sanitized = sanitizeInput(body.answer);
    } catch (e) {
      if (e instanceof InputValidationError) {
        return reply.status(400).send({ error: e.message });
      }
      throw e;
    }

    try {
      const history = body.sessionData.history ?? [];
      const lastAssistant = history.filter((m) => m.role === "assistant").pop();
      const currentQuestion = lastAssistant
        ? JSON.parse(lastAssistant.content)
        : {
            question: "",
            topic: "",
            difficulty: "easy",
            questionType: "theoretical_explanation",
            expectedAnswerCriteria: [],
          };

      let evaluation: Record<string, unknown> = {};
      let coachFeedback: Record<string, unknown> = {};
      let memoryUpdate: Record<string, unknown> = {};
      let nextQuestion: Record<string, unknown> = {};
      let updatedWeakSkills = body.sessionData.weakSkills ?? [];

      for await (const event of interviewRunner.runEphemeral({
        userId: body.sessionId,
        newMessage: { parts: [{ text: sanitized }] },
        stateDelta: {
          jobProfile: body.sessionData.jobProfile,
          jobText: body.sessionData.jobText,
          weakSkills: body.sessionData.weakSkills ?? [],
          history,
          previousQuestions: previousQuestionsFromHistory(history),
          question: currentQuestion.question,
          answer: sanitized,
          currentQuestion,
        },
      })) {
        evaluation = mergeAgentOutput(evaluation, event, "evaluation", isValidEvaluation);
        coachFeedback = mergeAgentOutput(coachFeedback, event, "coachFeedback", isValidCoach);
        memoryUpdate = mergeAgentOutput(memoryUpdate, event, "memoryUpdate", isValidMemoryUpdate);
        nextQuestion = mergeAgentOutput(nextQuestion, event, "currentQuestion", isValidQuestion);

        if (Array.isArray(memoryUpdate.weakSkills)) {
          updatedWeakSkills = memoryUpdate.weakSkills as string[];
        }
      }

      if (!isValidEvaluation(evaluation) || !isValidCoach(coachFeedback) || !isValidQuestion(nextQuestion)) {
        request.log.error({ evaluation, coachFeedback, nextQuestion }, "processAnswer incomplete pipeline result");
        return reply.status(500).send({ error: "Failed to process answer. Please try again." });
      }

      const updatedHistory: InterviewMessage[] = [
        ...history,
        { role: "user", content: sanitized, timestamp: new Date().toISOString() },
        { role: "assistant", content: JSON.stringify(nextQuestion), timestamp: new Date().toISOString() },
      ];

      return {
        evaluation,
        coach: coachFeedback,
        nextQuestion,
        updatedHistory,
        updatedWeakSkills,
      };
    } catch (e) {
      request.log.error(e, "processAnswer failed");
      return reply.status(500).send({ error: "Failed to process answer. Please try again." });
    }
  });
}
