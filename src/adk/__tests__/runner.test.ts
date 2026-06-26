import { describe, it, expect } from "vitest";
import { jobParserRunner, interviewRunner, sessionService } from "../runner.js";
import { Runner, InMemorySessionService } from "@google/adk";

describe("jobParserRunner", () => {
  it("is a Runner instance", () => {
    expect(jobParserRunner).toBeInstanceOf(Runner);
  });
});

describe("interviewRunner", () => {
  it("is a Runner instance", () => {
    expect(interviewRunner).toBeInstanceOf(Runner);
  });
});

describe("sessionService", () => {
  it("is an InMemorySessionService instance", () => {
    expect(sessionService).toBeInstanceOf(InMemorySessionService);
  });
});
