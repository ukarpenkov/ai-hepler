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
  keywords: string[];
  domain: string;
}

export interface EvaluationResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface QuestionResult {
  question: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
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
