import type { FastifyInstance } from "fastify";
import { getSession } from "../../storage/session-store.js";
import { isValidSessionId } from "../../utils/validators.js";

export async function sessionRoutes(app: FastifyInstance) {
  app.get("/session/:id", async (request, reply) => {
    const { id } = request.params as { id?: string };

    if (!id || !isValidSessionId(id)) {
      return reply.status(400).send({ error: "Valid session UUID is required" });
    }

    const session = await getSession(app.redis, id);
    if (!session) {
      return reply.status(404).send({ error: "Session not found" });
    }

    return {
      id: session.id,
      jobProfile: session.jobProfile,
      history: session.history,
      weakSkills: session.weakSkills,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  });
}
