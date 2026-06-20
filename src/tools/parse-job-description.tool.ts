import type { ParsedJob } from "../agents/types.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function parseJobDescriptionTool(
  text: string,
  config: { apiKey: string; baseUrl: string; model: string }
): Promise<ParsedJob> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "user",
          content: `Analyze this job description and extract: role, level (junior/middle/senior), skills array, keywords array, domain. Return ONLY valid JSON matching this schema: { role: string, level: string, skills: string[], keywords: string[], domain: string }\n\nJob description:\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as LLMResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content in LLM response");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Invalid JSON in LLM response");
  }

  if (
    typeof parsed.role !== "string" ||
    typeof parsed.level !== "string" ||
    !Array.isArray(parsed.skills) ||
    !Array.isArray(parsed.keywords) ||
    typeof parsed.domain !== "string"
  ) {
    throw new Error("Missing required fields in parsed job");
  }

  return {
    role: parsed.role,
    level: parsed.level as ParsedJob["level"],
    skills: parsed.skills,
    keywords: parsed.keywords,
    domain: parsed.domain,
  };
}
