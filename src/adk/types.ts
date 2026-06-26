export type AgentName = "job-parser" | "interviewer" | "evaluator" | "coach" | "memory";

export interface AgentInput {
  sessionId: string;
  content: string;
  context?: Record<string, unknown>;
}

export interface AgentOutput {
  agentName: AgentName;
  result: string;
  metadata?: Record<string, unknown>;
}

export interface ParsedJob {
  role: string;
  level: "junior" | "middle" | "senior";
  skills: string[];
  softSkills: string[];
  keywords: string[];
  domain: string;
  language: string;
  minYearsExperience: number | null;
}

export interface EvaluationResult {
  score: number;
  accuracy: number;
  depth: number;
  relevance: number;
  examples: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  antiCheatFlags: string[];
  perfectAnswerSummary: string;
}

export interface QuestionResult {
  question: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questionType: "theoretical_explanation" | "practical_implementation" | "system_design" | "debugging_scenario" | "behavioral_experience";
  expectedAnswerCriteria: string[];
}

export interface CoachResult {
  explanation: string;
  improvedAnswer: string;
  tips: string[];
}

export interface MemoryUpdate {
  weakSkills: string[];
  answeredTopics: string[];
}

export interface InterviewState {
  sessionId: string;
  currentQuestion: QuestionResult | null;
  questionCount: number;
  scores: number[];
}
