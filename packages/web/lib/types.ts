export interface ParsedJob {
  role: string;
  level: "junior" | "middle" | "senior";
  skills: string[];
  keywords: string[];
  domain: string;
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
