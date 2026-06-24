import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

process.env.DEEPSEEK_API_KEY = "test-key";

const jobProfileData = {
  role: "Frontend Developer",
  level: "middle",
  skills: ["React", "TypeScript", "CSS"],
  softSkills: [],
  keywords: ["frontend", "web"],
  domain: "web",
  language: "en", minYearsExperience: null,
};

const questionData = {
  question: "Explain the difference between TypeScript interfaces and types.",
  topic: "TypeScript",
  difficulty: "medium",
  questionType: "theoretical_explanation",
  expectedAnswerCriteria: [],
};

const evaluationData = {
  score: 7,
  accuracy: 3,
  depth: 2,
  relevance: 2,
  examples: 0,
  strengths: ["Good understanding of basics"],
  weaknesses: ["Could mention more advanced features"],
  recommendation: "Study generics and utility types",
  antiCheatFlags: [],
  perfectAnswerSummary: "Include advanced features like generics",
};

const coachData = {
  explanation: "Interfaces are extendable, types support unions and intersections.",
  improvedAnswer: "TypeScript interfaces define object shapes and can be extended, while types are more flexible supporting unions, intersections, and mapped types.",
  tips: ["Practice using utility types", "Read the TypeScript handbook", "Build small projects"],
};

const nextQuestionData = {
  question: "What are React hooks?",
  topic: "React",
  difficulty: "easy",
  questionType: "theoretical_explanation",
  expectedAnswerCriteria: [],
};

let fetchCallCount = 0;

const mockRedisStore = new Map<string, string>();

vi.mock("ioredis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    set: vi.fn(async (key: string, value: string) => {
      mockRedisStore.set(key, value);
      return "OK";
    }),
    get: vi.fn(async (key: string) => mockRedisStore.get(key) ?? null),
    del: vi.fn(async (key: string) => {
      mockRedisStore.delete(key);
      return 1;
    }),
    quit: vi.fn(async () => "OK"),
  })),
}));

import { jobParserAgent } from "../agents/job-parser.agent.js";
import { interviewerAgent } from "../agents/interviewer.agent.js";
import { evaluatorAgent } from "../agents/evaluator.agent.js";
import { memoryAgent } from "../agents/memory.agent.js";
import { fetchWeakTopicsTool } from "../tools/fetch-weak-topics.tool.js";
import { defaultGuard } from "../security/toolAccess.js";
import { createSession } from "../storage/session-store.js";

const llmConfig = { apiKey: "test-key", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" };

describe("agent workflow integration", () => {
  beforeEach(() => {
    mockRedisStore.clear();
    fetchCallCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        fetchCallCount++;
        let content = "";

        if (fetchCallCount === 1) {
          content = JSON.stringify(jobProfileData);
        } else if (fetchCallCount === 2) {
          content = JSON.stringify(questionData);
        } else if (fetchCallCount === 3) {
          content = JSON.stringify(evaluationData);
        } else if (fetchCallCount === 4) {
          content = JSON.stringify(coachData);
        } else if (fetchCallCount === 5) {
          content = JSON.stringify(nextQuestionData);
        }

        return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as typeof fetch,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("full interview cycle: parseJob → generateQuestion → evaluateAnswer → updateMemory → fetchWeakTopics", async () => {
    const session = await createSession(null);
    const sessionId = session.id;

    const jobProfile = await jobParserAgent(
      { sessionId, content: "We are looking for a middle Frontend Developer with TypeScript, React, and CSS experience for our web platform." },
      llmConfig,
    );
    const parsedJob = JSON.parse(jobProfile.result);
    expect(parsedJob.role).toBe("Frontend Developer");
    expect(parsedJob.skills).toContain("React");

    const questionOutput = await interviewerAgent({
      input: { sessionId, content: "" },
      jobProfile: parsedJob,
      weakSkills: [],
      previousQuestions: [],
      config: llmConfig,
    });
    const question = JSON.parse(questionOutput.result);
    expect(question.question).toBe("Explain the difference between TypeScript interfaces and types.");
    expect(question.topic).toBe("TypeScript");

    const evalOutput = await evaluatorAgent({
      question: question.question,
      answer: "TypeScript interfaces define object shapes, while types are more flexible and support unions and intersections.",
      jobProfile: parsedJob,
      config: llmConfig,
    });
    const evaluation = JSON.parse(evalOutput.result);
    expect(evaluation.score).toBeGreaterThanOrEqual(1);
    expect(evaluation.score).toBeLessThanOrEqual(10);
    expect(Array.isArray(evaluation.strengths)).toBe(true);
    expect(Array.isArray(evaluation.weaknesses)).toBe(true);

    const memOutput = await memoryAgent({
      sessionId,
      evaluation,
      questionTopic: question.topic,
      redis: null,
    });
    const memoryResult = JSON.parse(memOutput.result);
    expect(Array.isArray(memoryResult.weakSkills)).toBe(true);
    expect(Array.isArray(memoryResult.answeredTopics)).toBe(true);

    const weakTopics = await fetchWeakTopicsTool({ sessionId, redis: null });
    expect(Array.isArray(weakTopics)).toBe(true);

    expect(fetchCallCount).toBeGreaterThanOrEqual(3);
  });

  it("data flows correctly between steps", async () => {
    const session = await createSession(null);
    const sessionId = session.id;

    const jobOutput = await jobParserAgent(
      { sessionId, content: "Senior Backend Developer with Go, Kubernetes, and PostgreSQL experience for distributed systems." },
      llmConfig,
    );
    const job = JSON.parse(jobOutput.result);
    expect(job.level).toBe("middle");

    const questionOutput = await interviewerAgent({
      input: { sessionId, content: "" },
      jobProfile: job,
      weakSkills: ["Go"],
      previousQuestions: [],
      config: llmConfig,
    });
    const q = JSON.parse(questionOutput.result);
    expect(q.question).toBeDefined();
    expect(q.topic).toBeDefined();

    const evalOutput = await evaluatorAgent({
      question: q.question,
      answer: "Go uses goroutines for concurrency, which are lightweight threads managed by the Go runtime.",
      jobProfile: job,
      config: llmConfig,
    });
    const ev = JSON.parse(evalOutput.result);
    expect(ev.score).toBe(7);
    expect(ev.strengths).toHaveLength(1);

    const memOutput = await memoryAgent({
      sessionId,
      evaluation: ev,
      questionTopic: q.topic,
      redis: null,
    });
    const mem = JSON.parse(memOutput.result);
    expect(mem.answeredTopics).toContain(q.topic);
  });

  it("handles errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" });
      }) as typeof fetch,
    );

    const session = await createSession(null);

    await expect(
      jobParserAgent(
        { sessionId: session.id, content: "Senior Backend Developer with Go, Kubernetes, and PostgreSQL experience for distributed systems." },
        llmConfig,
      ),
    ).rejects.toThrow("LLM API error: 500");
  });

  it("Tool Access Control blocks external access to system tools", () => {
    expect(defaultGuard.checkAccess("parseJobDescriptionTool", "external")).toBe(false);
    expect(defaultGuard.checkAccess("generateQuestionTool", "external")).toBe(false);
    expect(defaultGuard.checkAccess("evaluateAnswerTool", "external")).toBe(false);
    expect(defaultGuard.checkAccess("updateMemoryTool", "external")).toBe(false);
    expect(defaultGuard.checkAccess("fetchWeakTopicsTool", "external")).toBe(false);
  });

  it("Tool Access Control allows agent context for all tools", () => {
    expect(defaultGuard.checkAccess("parseJobDescriptionTool", "agent")).toBe(true);
    expect(defaultGuard.checkAccess("generateQuestionTool", "agent")).toBe(true);
    expect(defaultGuard.checkAccess("evaluateAnswerTool", "agent")).toBe(true);
    expect(defaultGuard.checkAccess("updateMemoryTool", "agent")).toBe(true);
    expect(defaultGuard.checkAccess("fetchWeakTopicsTool", "agent")).toBe(true);
  });

  it("Tool Access Control blocks route from accessing system tools", () => {
    expect(defaultGuard.checkAccess("parseJobDescriptionTool", "route")).toBe(false);
    expect(defaultGuard.checkAccess("generateQuestionTool", "route")).toBe(false);
    expect(defaultGuard.checkAccess("evaluateAnswerTool", "route")).toBe(false);
    expect(defaultGuard.checkAccess("updateMemoryTool", "route")).toBe(true);
    expect(defaultGuard.checkAccess("fetchWeakTopicsTool", "route")).toBe(true);
  });
});
