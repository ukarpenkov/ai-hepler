export interface ParsedJob {
  title: string;
  company: string;
  seniority: string;
  domain: string;
  skills: string[];
  requirements: string[];
}

export interface QuestionResult {
  question: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface EvaluationResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface CoachResult {
  explanation: string;
  improvedAnswer: string;
  tips: string[];
}

export interface MemoryUpdate {
  weakTopics: string[];
  progress: Record<string, number>;
}

export interface SessionData {
  id: string;
  jobProfile: ParsedJob;
  questions: QuestionResult[];
  history: Array<{ role: string; content: string }>;
  weakTopics: string[];
}
