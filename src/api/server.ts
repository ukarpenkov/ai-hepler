import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import config from "../config.js";
import { createRedisClient, closeRedisClient } from "../storage/redis.js";

const redis = createRedisClient(config.redisUrl);

export const server = Fastify({ logger: true });

await server.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
});

await server.register(helmet);

server.get("/health", async () => {
  return { status: "ok" };
});

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

start();
