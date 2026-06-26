import { LlmAgent } from "@google/adk";
import { parseJobTool } from "../tools/parse-job.tool.js";

export const jobParserAgent = new LlmAgent({
  name: "JobParserAgent",
  model: process.env.LLM_MODEL || "deepseek/deepseek-chat",
  description:
    "Parses job descriptions and extracts structured data including role, level, skills, and domain",
  instruction: `You are a job description analyzer. Your task is to extract structured data from job postings.

When given a job description text, use the parseJobDescription tool to extract:
- role: normalized job title
- level: junior/middle/senior
- skills: technical skills
- softSkills: interpersonal skills
- keywords: key phrases
- domain: industry
- language: ISO code
- minYearsExperience: years required

Always call the parseJobDescription tool with the provided job text.`,
  tools: [parseJobTool],
  outputKey: "parsedJob",
});
