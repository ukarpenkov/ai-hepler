import type { FastifyInstance } from "fastify";
import type { ParsedJob } from "../../agents/types.js";
import type { InterviewMessage } from "../../storage/session-store.js";
import { startInterviewStateless, processAnswerStateless } from "../../agents/orchestrator.js";
import { isValidSessionId, isValidAnswer } from "../../utils/validators.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";
import config from "../../config.js";

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

    const llmConfig = { apiKey: config.apiKey, baseUrl: config.llmBaseUrl, model: config.llmModel };
    try {
      const result = await startInterviewStateless(
        {
          sessionId: body.sessionId,
          jobProfile: body.jobProfile,
          weakSkills: body.weakSkills ?? [],
          history: body.history ?? [],
        },
        llmConfig
      );
      return { question: result.question, updatedHistory: result.updatedHistory };
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

    const llmConfig = { apiKey: config.apiKey, baseUrl: config.llmBaseUrl, model: config.llmModel };
    try {
      const result = await processAnswerStateless(
        {
          sessionId: body.sessionId,
          jobProfile: body.sessionData.jobProfile,
          history: body.sessionData.history ?? [],
          weakSkills: body.sessionData.weakSkills ?? [],
        },
        sanitized,
        llmConfig
      );
      return {
        evaluation: result.evaluation,
        coach: result.coach,
        nextQuestion: result.nextQuestion,
        updatedHistory: result.updatedHistory,
        updatedWeakSkills: result.updatedWeakSkills,
      };
    } catch (e) {
      request.log.error(e, "processAnswer failed");
      return reply.status(500).send({ error: "Failed to process answer. Please try again." });
    }
  });
}
