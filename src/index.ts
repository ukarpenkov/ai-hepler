import jobParserAgent from "./agents/job-parser.agent.js";
import interviewerAgent from "./agents/interviewer.agent.js";
import evaluatorAgent from "./agents/evaluator.agent.js";
import coachAgent from "./agents/coach.agent.js";
import memoryAgent from "./agents/memory.agent.js";
import orchestrator from "./agents/orchestrator.js";

import { parseJobDescriptionTool } from "./tools/parse-job-description.tool.js";
import { generateQuestionTool } from "./tools/generate-question.tool.js";
import evaluateAnswerTool from "./tools/evaluate-answer.tool.js";
import updateMemoryTool from "./tools/update-memory.tool.js";
import fetchWeakTopicsTool from "./tools/fetch-weak-topics.tool.js";

import { createRedisClient, closeRedisClient } from "./storage/redis.js";
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
} from "./storage/session-store.js";

export {
  jobParserAgent,
  interviewerAgent,
  evaluatorAgent,
  coachAgent,
  memoryAgent,
  orchestrator,
  parseJobDescriptionTool,
  generateQuestionTool,
  evaluateAnswerTool,
  updateMemoryTool,
  fetchWeakTopicsTool,
  createRedisClient,
  closeRedisClient,
  createSession,
  getSession,
  updateSession,
  deleteSession,
};

export default {};
