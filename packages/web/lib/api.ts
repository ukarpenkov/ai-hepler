import type { ParsedJob, QuestionResult, EvaluationResult, CoachResult, MemoryUpdate, SessionData } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export function parseJob(text: string): Promise<{ sessionId: string; jobProfile: ParsedJob }> {
  return request("/job/parse", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function startInterview(sessionId: string): Promise<{ question: QuestionResult }> {
  return request("/interview/start", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export function sendAnswer(
  sessionId: string,
  answer: string
): Promise<{ evaluation: EvaluationResult; coach: CoachResult; memory: MemoryUpdate; nextQuestion: QuestionResult }> {
  return request("/interview/answer", {
    method: "POST",
    body: JSON.stringify({ sessionId, answer }),
  });
}

export function getSession(id: string): Promise<SessionData> {
  return request(`/session/${id}`);
}
