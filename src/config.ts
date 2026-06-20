const openrouterApiKey = process.env.OPENROUTER_API_KEY;

if (!openrouterApiKey) {
  throw new Error("OPENROUTER_API_KEY environment variable is required");
}

const config = {
  openrouterApiKey,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: (process.env.NODE_ENV as "development" | "production") || "development",
} as const;

export default config;
