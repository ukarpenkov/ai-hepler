import "dotenv/config";

const apiKey = process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY or DEEPSEEK_API_KEY environment variable is required");
}

const config = {
  apiKey,
  llmBaseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com",
  llmModel: process.env.LLM_MODEL || "deepseek-chat",
  adkModel: process.env.ADK_MODEL || "deepseek/deepseek-chat",
  adkBaseUrl: process.env.ADK_BASE_URL || process.env.LLM_BASE_URL || "https://api.deepseek.com",
  redisUrl: process.env.REDIS_URL || undefined,
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: (process.env.NODE_ENV as "development" | "production") || "development",
} as const;

export default config;
