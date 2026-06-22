import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { parseJob } from "../../agents/orchestrator.js";
import { isValidJobText } from "../../utils/validators.js";
import { sanitizeJobText } from "../../utils/sanitize.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";
import config from "../../config.js";

export async function jobRoutes(app: FastifyInstance) {
  app.post("/job/parse", async (request, reply) => {
    const { text } = request.body as { text?: string };

    if (!text || !isValidJobText(text)) {
      return reply.status(400).send({ error: "Text is required and must be at least 50 characters" });
    }

    let sanitized: string;
    try {
      sanitized = sanitizeInput(sanitizeJobText(text));
    } catch (e) {
      if (e instanceof InputValidationError) {
        return reply.status(400).send({ error: e.message });
      }
      throw e;
    }

    const tempId = randomUUID();
    const llmConfig = { apiKey: config.apiKey, baseUrl: config.llmBaseUrl, model: config.llmModel };
    const jobProfile = await parseJob(sanitized, tempId, app.redis, llmConfig);

    return { jobProfile };
  });
}
