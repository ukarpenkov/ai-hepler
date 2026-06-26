import { LlmAgent } from "@google/adk";
import { generateQuestionTool } from "../tools/generate-question.tool.js";
import { llm } from "../llm.js";

export const interviewerAgent = new LlmAgent({
  name: "InterviewerAgent",
  model: llm,
  description:
    "Generates personalized interview questions based on job profile and user's weak areas",
  instruction: `You are an expert technical interviewer. Generate interview questions based on:
- The job profile (role, level, skills)
- User's weak skills (focus more on these)
- Previous questions (avoid repetition)

Use the generateQuestion tool with:
- jobProfile: the parsed job profile from session state
- weakSkills: array of weak skill topics
- previousQuestions: array of previously asked questions

Generate questions appropriate for the seniority level.`,
  tools: [generateQuestionTool],
  outputKey: "currentQuestion",
});
