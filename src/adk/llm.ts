import { DeepSeekLlm } from "./models/deepseek-llm.js";
import config from "../config.js";

export const llm = new DeepSeekLlm({
  apiKey: config.apiKey,
  baseUrl: config.adkBaseUrl,
  model: config.llmModel,
});
