import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { jobParserRunner } from "../../adk/runner.js";
import { isValidJobText } from "../../utils/validators.js";
import { sanitizeJobText } from "../../utils/sanitize.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";

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

    const userId = randomUUID();
    let parsedJob: Record<string, unknown> = {};

    for await (const event of jobParserRunner.runEphemeral({
      userId,
      newMessage: { parts: [{ text: sanitized }] },
    })) {
      const delta = event.actions?.stateDelta;
      if (delta && "parsedJob" in delta) {
        parsedJob = delta.parsedJob as Record<string, unknown>;
      }
    }

    return { jobProfile: parsedJob };
  });
}
