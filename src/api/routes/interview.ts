import type { FastifyInstance } from "fastify";
import { getSession } from "../../storage/session-store.js";
import { startInterview, processAnswer } from "../../agents/orchestrator.js";
import { isValidSessionId, isValidAnswer } from "../../utils/validators.js";
import { sanitizeInput } from "../../utils/sanitize.js";
import config from "../../config.js";

export async function interviewRoutes(app: FastifyInstance) {
  app.post("/interview/start", async (request, reply) => {
    const { sessionId } = request.body as { sessionId?: string };

    if (!sessionId || !isValidSessionId(sessionId)) {
      return reply.status(400).send({ error: "Valid sessionId UUID is required" });
    }

    const session = await getSession(app.redis, sessionId);
    if (!session) {
      return reply.status(404).send({ error: "Session not found" });
    }

    const question = await startInterview(sessionId, app.redis, { apiKey: config.openrouterApiKey });
    return { question };
  });

  app.post("/interview/answer", async (request, reply) => {
    const { sessionId, answer } = request.body as { sessionId?: string; answer?: string };

    if (!sessionId || !isValidSessionId(sessionId)) {
      return reply.status(400).send({ error: "Valid sessionId UUID is required" });
    }

    if (!answer || !isValidAnswer(answer)) {
      return reply.status(400).send({ error: "Answer is required and must be at least 10 characters" });
    }

    const session = await getSession(app.redis, sessionId);
    if (!session) {
      return reply.status(404).send({ error: "Session not found" });
    }

    const sanitized = sanitizeInput(answer);
    const result = await processAnswer(sessionId, sanitized, app.redis, { apiKey: config.openrouterApiKey });
    return result;
  });
}
