import type { AgentInput, AgentOutput } from "./types.js";
import { parseJobDescriptionTool } from "../tools/parse-job-description.tool.js";
import { sanitizeJobText } from "../utils/sanitize.js";
import { isValidJobText } from "../utils/validators.js";
import { defaultGuard } from "../security/toolAccess.js";

export async function jobParserAgent(
  input: AgentInput,
  config: { apiKey: string; baseUrl: string; model: string }
): Promise<AgentOutput> {
  if (!defaultGuard.checkAccess("parseJobDescriptionTool", "agent")) {
    throw new Error("Access denied: parseJobDescriptionTool not allowed in current context");
  }

  if (!isValidJobText(input.content)) {
    throw new Error("Invalid job text: must be at least 50 characters");
  }

  const sanitized = sanitizeJobText(input.content);
  const parsed = await parseJobDescriptionTool(sanitized, config);

  return {
    agentName: "job-parser",
    result: JSON.stringify(parsed),
    metadata: { sessionId: input.sessionId },
  };
}
