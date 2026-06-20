import "dotenv/config";

const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

if (!deepseekApiKey) {
  throw new Error("DEEPSEEK_API_KEY environment variable is required");
}

const config = {
  deepseekApiKey,
  llmBaseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com",
  llmModel: process.env.LLM_MODEL || "deepseek-chat",
  redisUrl: process.env.REDIS_URL || undefined,
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: (process.env.NODE_ENV as "development" | "production") || "development",
} as const;

export default config;
