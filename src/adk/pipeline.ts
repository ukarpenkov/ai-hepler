import { SequentialAgent } from "@google/adk";
import { evaluatorAgent } from "./agents/evaluator.agent.js";
import { coachAgent } from "./agents/coach.agent.js";
import { memoryAgent } from "./agents/memory.agent.js";
import { interviewerAgent } from "./agents/interviewer.agent.js";

export const interviewPipeline = new SequentialAgent({
  name: "InterviewPipeline",
  subAgents: [evaluatorAgent, coachAgent, memoryAgent, interviewerAgent],
  description:
    "Evaluates answer, provides coaching, updates memory, and generates next question",
});
