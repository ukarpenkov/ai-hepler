import { LlmAgent } from "@google/adk";
import { parseJobTool } from "../tools/parse-job.tool.js";
import { llm } from "../llm.js";

export const jobParserAgent = new LlmAgent({
  name: "JobParserAgent",
  model: llm,
  description:
    "Parses job descriptions and extracts structured data including role, level, skills, and domain",
  instruction: `You are a job description analyzer. Your task is to extract structured data from job postings.

When given a job description text, IMMEDIATELY call the parseJobDescription tool with the provided job text as the jobText parameter.

Do NOT respond with text. Do NOT ask for more input. Do NOT acknowledge the request.

ONLY call the parseJobDescription tool. Extract:
- role: normalized job title
- level: junior/middle/senior
- skills: technical skills
- softSkills: interpersonal skills
- keywords: key phrases
- domain: industry
- language: ISO code
- minYearsExperience: years required`,
  tools: [parseJobTool],
  outputKey: "parsedJob",
});
