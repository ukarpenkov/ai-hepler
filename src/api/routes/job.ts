import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { jobParserRunner } from "../../adk/runner.js";
import { isValidJobText } from "../../utils/validators.js";
import { sanitizeJobText } from "../../utils/sanitize.js";
import { sanitizeInput, InputValidationError } from "../../security/sanitizer.js";
import { mergeAgentOutput } from "../../adk/utils/extract-output.js";

function isValidParsedJob(value: Record<string, unknown>): boolean {
  return (
    typeof value.role === "string" &&
    typeof value.level === "string" &&
    Array.isArray(value.skills) &&
    typeof value.language === "string" &&
    value.language.length > 0
  );
}

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

    try {
      for await (const event of jobParserRunner.runEphemeral({
        userId,
        newMessage: { parts: [{ text: sanitized }] },
      })) {
        parsedJob = mergeAgentOutput(parsedJob, event, "parsedJob", isValidParsedJob);
      }
    } catch (e) {
      request.log.error(e, "parseJob failed");
      return reply.status(500).send({ error: "Failed to parse job description. Please try again." });
    }

    if (!isValidParsedJob(parsedJob)) {
      request.log.error({ parsedJob }, "parseJob returned invalid profile");
      return reply.status(500).send({ error: "Failed to parse job description. Please try again." });
    }

    return { jobProfile: parsedJob };
  });
}
