interface AgentEvent {
  actions?: { stateDelta?: Record<string, unknown> };
  content?: {
    parts?: Array<{
      text?: string;
      functionResponse?: { response?: unknown };
    }>;
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseJsonRecord(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function mergeAgentOutput<T extends Record<string, unknown>>(
  current: T,
  event: AgentEvent,
  outputKey: string,
  matchesResponse: (_resp: Record<string, unknown>) => boolean,
): T {
  let result = { ...current };

  const delta = event.actions?.stateDelta;
  if (delta && outputKey in delta) {
    const parsed = parseJsonRecord(delta[outputKey]);
    if (parsed) result = parsed as T;
  }

  for (const part of event.content?.parts ?? []) {
    if (part.functionResponse?.response) {
      const resp = parseJsonRecord(part.functionResponse.response);
      if (resp && matchesResponse(resp)) {
        result = resp as T;
      }
    }

    if (part.text && (!result || Object.keys(result).length === 0)) {
      const parsed = parseJsonRecord(part.text);
      if (parsed && matchesResponse(parsed)) {
        result = parsed as T;
      }
    }
  }

  return result;
}
