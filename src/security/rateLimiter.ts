import type { FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 30,
};

export const rateLimitStore = new Map<string, RateLimitEntry>();

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function startCleanup(intervalMs: number): void {
  if (cleanupInterval !== null) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, intervalMs);
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

function getClientIp(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return request.socket?.remoteAddress ?? "127.0.0.1";
}

export const createRateLimiter = fp(
  async function rateLimiter(app, opts?: Partial<RateLimitConfig>) {
    const cfg = { ...DEFAULT_CONFIG, ...opts };

    startCleanup(cfg.windowMs);

    app.addHook(
      "onRequest",
      async (request: FastifyRequest, reply: FastifyReply) => {
        const ip = getClientIp(request);
        const now = Date.now();
        const entry = rateLimitStore.get(ip);

        if (!entry || now > entry.resetTime) {
          rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + cfg.windowMs,
          });

          reply.header("X-RateLimit-Limit", cfg.maxRequests);
          reply.header(
            "X-RateLimit-Remaining",
            cfg.maxRequests - 1,
          );
          reply.header(
            "X-RateLimit-Reset",
            Math.ceil((now + cfg.windowMs) / 1000),
          );
          return;
        }

        entry.count += 1;
        const remaining = Math.max(0, cfg.maxRequests - entry.count);
        const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

        reply.header("X-RateLimit-Limit", cfg.maxRequests);
        reply.header("X-RateLimit-Remaining", remaining);
        reply.header(
          "X-RateLimit-Reset",
          Math.ceil(entry.resetTime / 1000),
        );

        if (entry.count > cfg.maxRequests) {
          reply.code(429).send({
            error: "Rate limit exceeded",
            retryAfter: resetSeconds,
          });
        }
      },
    );
  },
  { name: "rate-limiter" },
);
