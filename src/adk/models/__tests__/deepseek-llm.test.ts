import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeepSeekLlm } from "../deepseek-llm.js";
import { BaseLlm } from "@google/adk";
import type { LlmRequest, LlmResponse } from "@google/adk";

describe("DeepSeekLlm", () => {
  const config = {
    apiKey: "test-api-key",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("extends BaseLlm", () => {
    const llm = new DeepSeekLlm(config);
    expect(llm).toBeInstanceOf(BaseLlm);
  });

  it("has correct model name", () => {
    const llm = new DeepSeekLlm(config);
    expect(llm.model).toBe("deepseek-chat");
  });

  it("throws error for connect method", async () => {
    const llm = new DeepSeekLlm(config);
    const request: LlmRequest = {
      contents: [],
      liveConnectConfig: {},
      toolsDict: {},
    };

    await expect(llm.connect(request)).rejects.toThrow(
      "Live connection not supported for DeepSeek",
    );
  });

  describe("generateContentAsync", () => {
    it("makes correct API call for non-streaming response", async () => {
      const mockResponse = {
        choices: [
          {
            message: { content: '{"role":"developer"}' },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }),
      );

      const llm = new DeepSeekLlm(config);
      const request: LlmRequest = {
        contents: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
        ],
        liveConnectConfig: {},
        toolsDict: {},
        config: {
          systemInstruction: { text: "You are a helpful assistant" },
        },
      };

      const responses: LlmResponse[] = [];
      for await (const response of llm.generateContentAsync(request)) {
        responses.push(response);
      }

      expect(fetch).toHaveBeenCalledWith(
        "https://api.deepseek.com/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer test-api-key",
            "Content-Type": "application/json",
          },
        }),
      );

      const body = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(body.model).toBe("deepseek-chat");
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0]).toEqual({
        role: "system",
        content: "You are a helpful assistant",
      });
      expect(body.messages[1]).toEqual({
        role: "user",
        content: "Hello",
      });

      expect(responses).toHaveLength(1);
      expect(responses[0].content?.parts?.[0]?.text).toBe(
        '{"role":"developer"}',
      );
      expect(responses[0].turnComplete).toBe(true);
    });

    it("handles streaming response", async () => {
      const streamChunks = [
        "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"},\"finish_reason\":null}]}\n",
        "data: {\"choices\":[{\"delta\":{\"content\":\" World\"},\"finish_reason\":null}]}\n",
        "data: {\"choices\":[{\"delta\":{\"content\":\"!\"},\"finish_reason\":\"stop\"}]}\n",
        "data: [DONE]\n",
      ];

      const reader = {
        read: vi.fn(),
        releaseLock: vi.fn(),
      };
      let callCount = 0;
      reader.read.mockImplementation(() => {
        if (callCount < streamChunks.length) {
          return Promise.resolve({
            done: false,
            value: new TextEncoder().encode(streamChunks[callCount++]),
          });
        }
        return Promise.resolve({ done: true, value: undefined });
      });

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          body: { getReader: () => reader },
        }),
      );

      const llm = new DeepSeekLlm(config);
      const request: LlmRequest = {
        contents: [{ role: "user", parts: [{ text: "Hi" }] }],
        liveConnectConfig: {},
        toolsDict: {},
      };

      const responses: LlmResponse[] = [];
      for await (const response of llm.generateContentAsync(request, true)) {
        responses.push(response);
      }

      expect(responses.length).toBeGreaterThan(0);
      expect(responses.some((r) => r.partial === true)).toBe(true);
      expect(responses.some((r) => r.turnComplete === true)).toBe(true);
    });

    it("handles API error response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
        }),
      );

      const llm = new DeepSeekLlm(config);
      const request: LlmRequest = {
        contents: [{ role: "user", parts: [{ text: "Test" }] }],
        liveConnectConfig: {},
        toolsDict: {},
      };

      const responses: LlmResponse[] = [];
      for await (const response of llm.generateContentAsync(request)) {
        responses.push(response);
      }

      expect(responses).toHaveLength(1);
      expect(responses[0].errorCode).toBe("429");
      expect(responses[0].errorMessage).toContain("DeepSeek API error");
    });
  });
});
