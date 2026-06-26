import { FunctionTool } from "@google/adk";
import { z } from "zod";
import type { ParsedJob } from "../../agents/types.js";

interface LLMResponse {
  choices: Array<{ message: { content: string } }>;
}

const parseJobParams = z.object({
  jobText: z.string().describe("The job description text to parse"),
});

async function executeParseJob(
  params: z.infer<typeof parseJobParams>,
): Promise<ParsedJob> {
  const config = {
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.LLM_BASE_URL || "https://api.deepseek.com",
    model: process.env.LLM_MODEL || "deepseek-chat",
  };

  if (!config.apiKey) {
    throw new Error("DEEPSEEK_API_KEY environment variable is required");
  }

  const systemPrompt = `You are a job description analyzer. Extract structured data from the job posting.

Be precise. Extract exact technology names as they appear. Separate hard/technical skills from soft skills. Note any experience requirements.`;

  const userPrompt = `Analyze this job description. Extract:

- role: normalized job title (e.g. "Frontend Developer", "Backend Developer", "DevOps Engineer")
- level: junior | middle | senior (based on required experience, title, and responsibilities)
- skills: concrete technical skills/tools/languages (e.g. "Python", "Docker", "AWS", "React", "Kubernetes")
- softSkills: soft skills / interpersonal requirements (e.g. "communication", "team leadership", "agile methodology", "mentoring")
- keywords: key phrases from the description (e.g. "CI/CD", "microservices", "test-driven development")
- domain: industry or domain (e.g. fintech, healthcare, e-commerce, web, cloud, gaming, etc.)
- language: ISO 639-1 code of the language the job description is written in (e.g. "en", "ru", "de", "fr", "es", "zh", etc.)
- minYearsExperience: number of years of experience required if explicitly mentioned, null otherwise

Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "role": string,
  "level": "junior"|"middle"|"senior",
  "skills": string[],
  "softSkills": string[],
  "keywords": string[],
  "domain": string,
  "language": string,
  "minYearsExperience": number|null
}

Job description:
${params.jobText}`;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error(`Invalid JSON in LLM response: ${content.slice(0, 200)}`);
      }
    } else {
      throw new Error(`No JSON found in LLM response: ${content.slice(0, 200)}`);
    }
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

  const language =
    typeof parsed.language === "string" && parsed.language.length > 0
      ? parsed.language
      : "en";

  const softSkills: string[] = Array.isArray(parsed.softSkills)
    ? parsed.softSkills.filter(
        (s: unknown): s is string => typeof s === "string",
      )
    : [];

  let minYearsExperience: number | null = null;
  if (typeof parsed.minYearsExperience === "number") {
    minYearsExperience =
      parsed.minYearsExperience > 0
        ? Math.round(parsed.minYearsExperience)
        : null;
  }

  return {
    role: parsed.role,
    level: parsed.level as ParsedJob["level"],
    skills: parsed.skills,
    softSkills,
    keywords: parsed.keywords,
    domain: parsed.domain,
    language,
    minYearsExperience,
  };
}

export const parseJobTool = new FunctionTool({
  name: "parseJobDescription",
  description:
    "Extracts structured job profile from a job description text. Returns role, level, skills, softSkills, keywords, domain, language, minYearsExperience.",
  parameters: parseJobParams,
  execute: executeParseJob,
});
