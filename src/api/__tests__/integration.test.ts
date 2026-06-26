import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

process.env.DEEPSEEK_API_KEY = "test-key";

vi.mock("../../storage/redis.js", () => ({
  createRedisClient: vi.fn(() => ({})),
  closeRedisClient: vi.fn(),
}));

vi.mock("../../adk/runner.js", () => ({
  jobParserRunner: {
    runEphemeral: vi.fn(),
  },
  interviewerRunner: {
    runEphemeral: vi.fn(),
  },
  interviewRunner: {
    runEphemeral: vi.fn(),
  },
  sessionService: {},
}));

function makeEvent(stateDelta: Record<string, unknown>) {
  return {
    actions: {
      stateDelta,
      artifactDelta: {},
      requestedAuthConfigs: {},
      requestedToolConfirmations: {},
    },
    content: { parts: [{ text: "" }] },
    id: "test-event",
    invocationId: "test-invocation",
    timestamp: Date.now(),
  };
}

const jobProfileResponse = {
  role: "Frontend Developer",
  level: "middle",
  skills: ["TypeScript", "React", "CSS"],
  softSkills: [],
  keywords: ["frontend", "web"],
  domain: "web",
  language: "en", minYearsExperience: null,
};

const questionResponse = {
  question: "Explain the difference between TypeScript interfaces and types.",
  topic: "TypeScript",
  difficulty: "medium",
  questionType: "theoretical_explanation",
  expectedAnswerCriteria: ["Mention interfaces are extendable", "Mention types support unions"],
};

const evaluationResponse = {
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

const coachResponse = {
  explanation: "Interfaces are extendable, types support unions and intersections.",
  improvedAnswer: "TypeScript interfaces define object shapes and can be extended, while types are more flexible supporting unions, intersections, and mapped types.",
  tips: ["Practice using utility types", "Read the TypeScript handbook", "Build small projects"],
};

const nextQuestionResponse = {
  question: "What are React hooks?",
  topic: "React",
  difficulty: "easy",
  questionType: "theoretical_explanation",
  expectedAnswerCriteria: [],
};

describe("API integration test", () => {
  beforeAll(async () => {
    const { jobParserRunner, interviewerRunner, interviewRunner } = await import("../../adk/runner.js");

    async function* jobParserGenerator() {
      yield makeEvent({ parsedJob: jobProfileResponse });
    }
    vi.mocked(jobParserRunner.runEphemeral).mockImplementation(() => jobParserGenerator());

    async function* interviewerGenerator() {
      yield makeEvent({ currentQuestion: questionResponse });
    }
    vi.mocked(interviewerRunner.runEphemeral).mockImplementation(() => interviewerGenerator());

    async function* interviewGenerator() {
      yield makeEvent({
        evaluation: evaluationResponse,
        coachFeedback: coachResponse,
        memoryUpdate: { weakSkills: [], answeredTopics: ["TypeScript"] },
        currentQuestion: nextQuestionResponse,
      });
    }
    vi.mocked(interviewRunner.runEphemeral).mockImplementation(() => interviewGenerator());
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("full interview flow works end-to-end", async () => {
    const { server } = await import("../server.js");
    await server.ready();

    const parseResponse = await server.inject({
      method: "POST",
      url: "/job/parse",
      payload: {
        text: "We are looking for a middle Frontend Developer with TypeScript, React, and CSS experience for our web platform.",
      },
    });

    expect(parseResponse.statusCode).toBe(200);
    const parseBody = JSON.parse(parseResponse.payload);
    expect(parseBody.jobProfile.role).toBe("Frontend Developer");
    expect(parseBody.jobProfile.level).toBe("middle");
    expect(parseBody.jobProfile.skills).toEqual(["TypeScript", "React", "CSS"]);

    const jobProfile = parseBody.jobProfile;
    const sessionId = "550e8400-e29b-41d4-a716-446655440000";

    const startResponse = await server.inject({
      method: "POST",
      url: "/interview/start",
      payload: { sessionId, jobProfile, weakSkills: [], history: [] },
    });

    expect(startResponse.statusCode).toBe(200);
    const startBody = JSON.parse(startResponse.payload);
    expect(startBody.question.question).toBe("Explain the difference between TypeScript interfaces and types.");
    expect(startBody.question.topic).toBe("TypeScript");
    expect(startBody.question.difficulty).toBe("medium");

    const updatedHistory = startBody.updatedHistory;

    const answerResponse = await server.inject({
      method: "POST",
      url: "/interview/answer",
      payload: {
        sessionId,
        answer: "TypeScript interfaces define object shapes, while types are more flexible and support unions and intersections.",
        sessionData: { jobProfile, history: updatedHistory, weakSkills: [] },
      },
    });

    expect(answerResponse.statusCode).toBe(200);
    const answerBody = JSON.parse(answerResponse.payload);
    expect(answerBody.evaluation.score).toBe(7);
    expect(answerBody.coach.explanation).toBe("Interfaces are extendable, types support unions and intersections.");
    expect(answerBody.coach.improvedAnswer).toBeDefined();
    expect(Array.isArray(answerBody.coach.tips)).toBe(true);
    expect(answerBody.nextQuestion.question).toBe("What are React hooks?");
    expect(answerBody.nextQuestion.topic).toBe("React");
    expect(answerBody.nextQuestion.difficulty).toBe("easy");
    expect(answerBody.updatedHistory).toBeDefined();
    expect(answerBody.updatedWeakSkills).toBeDefined();

    await server.close();
  });
});
