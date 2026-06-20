import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseJob, startInterview, sendAnswer, getSession } from "../lib/api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("API client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("parseJob calls POST /job/parse", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessionId: "s1", jobProfile: {} }),
    });

    await parseJob("job text");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/job/parse",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ text: "job text" }),
      })
    );
  });

  it("startInterview calls POST /interview/start", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ question: {} }),
    });

    await startInterview("s1");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/interview/start",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ sessionId: "s1" }),
      })
    );
  });

  it("sendAnswer calls POST /interview/answer", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          evaluation: {},
          coach: {},
          memory: {},
          nextQuestion: {},
        }),
    });

    await sendAnswer("s1", "my answer");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/interview/answer",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ sessionId: "s1", answer: "my answer" }),
      })
    );
  });

  it("getSession calls GET /session/:id", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "s1" }),
    });

    await getSession("s1");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/session/s1",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Not found" }),
    });

    await expect(getSession("bad")).rejects.toThrow("Not found");
  });
});
