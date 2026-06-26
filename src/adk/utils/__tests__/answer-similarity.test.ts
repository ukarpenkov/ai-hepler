import { describe, it, expect } from "vitest";
import {
  isParaphrasingQuestion,
  wordOverlapRatio,
} from "../answer-similarity.js";

describe("answer-similarity", () => {
  const question =
    "Design a URL shortening service like TinyURL. Walk me through your approach, including database schema, API design, and scaling.";

  it("detects exact copy of the question", () => {
    expect(isParaphrasingQuestion(question, question)).toBe(true);
  });

  it("detects near copy with minor edits", () => {
    const answer =
      "Design a URL shortening service like TinyURL. Walk me through your approach, including database schema, API design, and scaling considerations.";
    expect(isParaphrasingQuestion(question, answer)).toBe(true);
  });

  it("does not flag a short genuine answer", () => {
    expect(isParaphrasingQuestion("What is REST?", "REST is an API")).toBe(false);
  });

  it("does not flag an answer that quotes the question then adds substance", () => {
    const answer = `${question} I would start with a hash-based short code in base62, store mappings in PostgreSQL with a Redis cache for hot redirects, and shard by hash prefix as traffic grows.`;
    expect(isParaphrasingQuestion(question, answer)).toBe(false);
  });

  it("does not flag a genuine answer without repeating the question", () => {
    const answer =
      "I would use a distributed key-value store such as Redis for hot mappings, PostgreSQL for durable storage, base62 encoding for short codes, and a read-through cache in front of redirect lookups.";
    expect(isParaphrasingQuestion(question, answer)).toBe(false);
    expect(wordOverlapRatio(question, answer)).toBeLessThan(0.5);
  });
});
