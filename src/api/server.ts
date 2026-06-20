import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import config from "../config.js";
import { createRedisClient, closeRedisClient } from "../storage/redis.js";
import { jobRoutes } from "./routes/job.js";
import { interviewRoutes } from "./routes/interview.js";
import { sessionRoutes } from "./routes/session.js";

const redis = config.redisUrl ? createRedisClient(config.redisUrl) : null;

export const server = Fastify({ logger: true });

server.decorate("redis", redis);

await server.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
});

await server.register(helmet);

server.get("/health", async () => {
  return { status: "ok" };
});

server.setErrorHandler((error, _request, reply) => {
  server.log.error(error);
  reply.status(500).send({ error: "Internal server error" });
});

await server.register(jobRoutes);
await server.register(interviewRoutes);
await server.register(sessionRoutes);

const shutdown = async () => {
  server.log.info("Shutting down...");
  await closeRedisClient(redis);
  await server.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

const start = async () => {
  try {
    await server.listen({ port: config.port, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

const isMain = process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js");
if (isMain) {
  start();
}
