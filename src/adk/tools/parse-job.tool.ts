import { FunctionTool } from "@google/adk";
import { z } from "zod";
import type { ParsedJob } from "../types.js";
import { resolveInterviewLanguage } from "../utils/language.js";

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

  const systemPrompt = `You are a job description and resume analyzer. Extract structured data from the posting or candidate resume text for ANY profession — IT, logistics, retail, manufacturing, healthcare, finance, engineering, and others.

Be precise. Extract exact skill and tool names as they appear in the text. Separate hard/professional skills from soft skills. Note any experience requirements.

SKILL EXTRACTION (critical):
- Extract skills ONLY from duties, requirements, and qualifications sections — not from company marketing ("innovative", "AI-driven company", "R&D center", "использование ИИ").
- Do NOT infer programming, frontend, cloud, or software skills unless the posting explicitly requires software development in duties or requirements.
- Distinguish design/engineering roles (electrical, mechanical, CAD, ЕСКД) from software development roles.
- For "инженер-проектировщик" / design engineer roles: extract CAD tools, standards, and domain skills (e.g. КОМПАС, ЕСКД, Э3/Э4, electrical schematics, protection devices) — never Python, AWS, or Vue.js unless explicitly listed in requirements.
- Put marketing phrases ("инновационный подход", "собственный R&D") in keywords only if needed for context — never in skills.

LANGUAGE DETECTION (critical):
- Detect the language of the INPUT TEXT itself — the language the candidate or employer wrote in.
- The "language" field drives the interview language — questions and feedback must match the posting language.
- Do NOT infer language from company location, city names, or Latin-script tool names (React, CAD, API).
- Do NOT set language to "en" just because some skills are in English — if duties and requirements are in Russian, language MUST be "ru".
- If the text is mostly in Russian, language MUST be "ru". If mostly in English, language MUST be "en". Same rule for de, fr, es, etc.
- If the posting requires English proficiency (e.g. "fluent English", "английский язык") — put that in softSkills, NOT in the language field unless the posting itself is written in English.
- Return ISO 639-1 code only (e.g. "en", "ru", "de", "fr", "es", "zh").`;

  const userPrompt = `Analyze this job description or resume text. Extract:

- role: normalized job title (e.g. "Frontend Developer", "Warehouse Worker", "Electrical Design Engineer", "Sales Manager", "Accountant")
- level: junior | middle | senior (based on required experience, title, and responsibilities; use middle when unclear for non-IT roles)
- skills: concrete professional skills, tools, systems, certifications (e.g. "Python", "1C", "WMS", "КОМПАС 3D", "ЕСКД", "electrical schematics", "forklift license", "inventory management", "Excel")
- softSkills: soft skills / interpersonal requirements (e.g. "communication", "team leadership", "attention to detail", "customer service")
- keywords: key phrases from the description (e.g. "CI/CD", "FIFO", "shift work", "quality control", "explosion-proof equipment", "control panels")
- domain: industry or domain (e.g. fintech, logistics, retail, manufacturing, electrical equipment, healthcare, web, cloud, gaming, etc.)
- language: ISO 639-1 code of the language this text is written in (e.g. "en", "ru", "de", "fr", "es", "zh", etc.)
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

  const language = resolveInterviewLanguage(
    {
      language:
        typeof parsed.language === "string" ? parsed.language : undefined,
      role: parsed.role as string,
      domain: parsed.domain as string,
      skills: parsed.skills as string[],
      softSkills: Array.isArray(parsed.softSkills)
        ? (parsed.softSkills as string[])
        : [],
      keywords: parsed.keywords as string[],
    },
    params.jobText,
  );

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
