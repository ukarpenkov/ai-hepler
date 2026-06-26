import { InMemorySessionService, Runner } from "@google/adk";
import { jobParserAgent } from "./agents/job-parser.agent.js";
import { interviewPipeline } from "./pipeline.js";

const sessionService = new InMemorySessionService();

export const jobParserRunner = new Runner({
  agent: jobParserAgent,
  sessionService,
  appName: "ai-interview-simulator",
});

export const interviewRunner = new Runner({
  agent: interviewPipeline,
  sessionService,
  appName: "ai-interview-simulator",
});

export { sessionService };
