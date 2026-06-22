import type { FastifyInstance } from "fastify";

export async function sessionRoutes(app: FastifyInstance) {
  app.get("/sessions", async () => {
    return [];
  });

  app.get("/session/:id", async (_request, reply) => {
    return reply.status(404).send({ error: "Session not found" });
  });
}