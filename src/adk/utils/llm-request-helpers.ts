import { randomUUID } from "node:crypto";
import type { LlmRequest, LlmResponse } from "@google/adk";

export function getLastUserText(request: LlmRequest): string {
  for (let i = request.contents.length - 1; i >= 0; i--) {
    const content = request.contents[i];
    if (content.role === "user" && content.parts) {
      const text = content.parts
        .filter((p) => p.text)
        .map((p) => p.text!)
        .join("\n");
      if (text) return text;
    }
  }
  return "";
}

export function hasFunctionResponse(request: LlmRequest, name: string): boolean {
  return request.contents.some((c) =>
    c.parts?.some((p) => p.functionResponse?.name === name),
  );
}

export function getFunctionResponse(request: LlmRequest, name: string): unknown | undefined {
  for (const content of request.contents) {
    for (const part of content.parts ?? []) {
      if (part.functionResponse?.name === name) {
        return part.functionResponse.response;
      }
    }
  }
  return undefined;
}

export function toolResultAsModelResponse(result: unknown): LlmResponse {
  const text = typeof result === "string" ? result : JSON.stringify(result);
  return {
    content: {
      role: "model",
      parts: [{ text }],
    },
    turnComplete: true,
  };
}

export function forcedToolCall(toolName: string, args: Record<string, unknown>): LlmResponse {
  return {
    content: {
      role: "model",
      parts: [
        {
          functionCall: {
            id: `adk-${randomUUID()}`,
            name: toolName,
            args,
          },
        },
      ],
    },
    turnComplete: true,
  };
}

export function extractPreviousQuestions(state: Record<string, unknown>): string[] {
  if (Array.isArray(state.previousQuestions)) {
    return state.previousQuestions.filter((q): q is string => typeof q === "string");
  }

  const history = state.history;
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (m) =>
        m &&
        typeof m === "object" &&
        (m as { role?: string }).role === "assistant",
    )
    .map((m) => {
      const content = (m as { content?: string }).content ?? "";
      try {
        const parsed = JSON.parse(content) as { question?: string };
        return typeof parsed.question === "string" ? parsed.question : content;
      } catch {
        return content;
      }
    });
}

export function readStateRecord(state: unknown): Record<string, unknown> {
  if (
    state &&
    typeof state === "object" &&
    "toRecord" in state &&
    typeof (state as { toRecord: () => Record<string, unknown> }).toRecord === "function"
  ) {
    return (state as { toRecord: () => Record<string, unknown> }).toRecord();
  }

  if (state && typeof state === "object") {
    return state as Record<string, unknown>;
  }

  return {};
}
