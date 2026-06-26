import type { FastifyInstance } from "fastify";
import type { ParsedJob } from "../../adk/types.js";
import type { InterviewMessage } from "../../storage/session-store.js";
import { interviewerRunner, interviewRunner } from "../../adk/runner.js";
import { isValidSessionId, isValidAnswer } from "../../utils/validators.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";

export async function interviewRoutes(app: FastifyInstance) {
  app.post("/interview/start", async (request, reply) => {
    const body = request.body as {
      sessionId?: string;
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
          weakSkills: body.weakSkills ?? [],
          previousQuestions: (body.history ?? []).map((m) => m.content),
        },
      })) {
        const delta = event.actions?.stateDelta;
        if (delta && "currentQuestion" in delta) {
          currentQuestion = delta.currentQuestion as Record<string, unknown>;
          updatedHistory = [
            ...updatedHistory,
            { role: "assistant", content: JSON.stringify(currentQuestion), timestamp: new Date().toISOString() },
          ];
        }
      }

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
      const currentQuestion = lastAssistant ? JSON.parse(lastAssistant.content) : { question: "", topic: "", difficulty: "easy", questionType: "theoretical_explanation", expectedAnswerCriteria: [] };

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
          weakSkills: body.sessionData.weakSkills ?? [],
          history,
          question: currentQuestion.question,
          answer: sanitized,
          currentQuestion,
        },
      })) {
        const delta = event.actions?.stateDelta;
        if (!delta) continue;

        if ("evaluation" in delta) {
          evaluation = delta.evaluation as Record<string, unknown>;
        }
        if ("coachFeedback" in delta) {
          coachFeedback = delta.coachFeedback as Record<string, unknown>;
        }
        if ("memoryUpdate" in delta) {
          memoryUpdate = delta.memoryUpdate as Record<string, unknown>;
          if (memoryUpdate.weakSkills) {
            updatedWeakSkills = memoryUpdate.weakSkills as string[];
          }
        }
        if ("currentQuestion" in delta) {
          nextQuestion = delta.currentQuestion as Record<string, unknown>;
        }
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
