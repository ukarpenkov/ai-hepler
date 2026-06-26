import { BaseLlm, LlmRequest, LlmResponse, BaseLlmConnection } from "@google/adk";

interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
}

interface OpenAIResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class DeepSeekLlm extends BaseLlm {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: DeepSeekConfig) {
    super({ model: config.model });
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async *generateContentAsync(
    llmRequest: LlmRequest,
    stream?: boolean,
  ): AsyncGenerator<LlmResponse, void> {
    const messages = this.convertToOpenAIMessages(llmRequest);
    const model = llmRequest.model || this.model;

    if (stream) {
      yield* this.streamResponse(messages, model);
    } else {
      yield* this.nonStreamingResponse(messages, model);
    }
  }

  async connect(_llmRequest: LlmRequest): Promise<BaseLlmConnection> {
    throw new Error("Live connection not supported for DeepSeek");
  }

  private convertToOpenAIMessages(llmRequest: LlmRequest): OpenAIMessage[] {
    const messages: OpenAIMessage[] = [];

    if (llmRequest.config?.systemInstruction) {
      const sysText = this.extractText(llmRequest.config.systemInstruction);
      if (sysText) {
        messages.push({ role: "system", content: sysText });
      }
    }

    for (const content of llmRequest.contents) {
      if (!content.parts) continue;
      const role = content.role || "user";
      const textParts = content.parts
        .filter((p) => p.text)
        .map((p) => p.text!);
      if (textParts.length > 0) {
        messages.push({
          role: role as "user" | "assistant" | "system" | "tool",
          content: textParts.join("\n"),
        });
      }

      const functionCalls = content.parts.filter((p) => p.functionCall);
      for (const fc of functionCalls) {
        messages.push({
          role: "assistant",
          content: JSON.stringify({
            function_call: fc.functionCall,
          }),
        });
      }

      const functionResponses = content.parts.filter((p) => p.functionResponse);
      for (const fr of functionResponses) {
        messages.push({
          role: "tool",
          content: JSON.stringify(fr.functionResponse),
        });
      }
    }

    return messages;
  }

  private extractText(content: unknown): string {
    if (typeof content === "string") {
      return content;
    }
    if (content && typeof content === "object") {
      if ("text" in content && typeof content.text === "string") {
        return content.text;
      }
      if ("parts" in content && Array.isArray(content.parts)) {
        return content.parts
          .map((p: unknown) => this.extractText(p))
          .filter(Boolean)
          .join("\n");
      }
    }
    if (Array.isArray(content)) {
      return content
        .map((item) => this.extractText(item))
        .filter(Boolean)
        .join("\n");
    }
    return "";
  }

  private async *nonStreamingResponse(
    messages: OpenAIMessage[],
    model: string,
  ): AsyncGenerator<LlmResponse, void> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      yield {
        errorCode: String(response.status),
        errorMessage: `DeepSeek API error: ${response.status} ${response.statusText}`,
      };
      return;
    }

    const data = (await response.json()) as OpenAIResponse;
    const choice = data.choices?.[0];

    if (!choice) {
      yield {
        errorCode: "NO_CONTENT",
        errorMessage: "No response from DeepSeek API",
      };
      return;
    }

    yield this.convertToLlmResponse(choice.message.content, choice.finish_reason, data.usage);
  }

  private async *streamResponse(
    messages: OpenAIMessage[],
    model: string,
  ): AsyncGenerator<LlmResponse, void> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      yield {
        errorCode: String(response.status),
        errorMessage: `DeepSeek API error: ${response.status} ${response.statusText}`,
      };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield {
        errorCode: "NO_READER",
        errorMessage: "Cannot read response stream",
      };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const chunk = JSON.parse(data) as OpenAIStreamChunk;
            const choice = chunk.choices?.[0];
            if (!choice) continue;

            const content = choice.delta?.content || "";
            const finishReason = choice.finish_reason;

            if (content) {
              fullContent += content;
              yield {
                content: {
                  parts: [{ text: content }],
                  role: "model",
                },
                partial: !finishReason,
                turnComplete: false,
              };
            }

            if (finishReason) {
              yield this.convertToLlmResponse(fullContent, finishReason, undefined);
              yield { turnComplete: true };
            }
          } catch {
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private convertToLlmResponse(
    content: string,
    finishReason: string,
    usage?: OpenAIResponse["usage"],
  ): LlmResponse {
    return {
      content: {
        parts: [{ text: content }],
        role: "model",
      },
      turnComplete: true,
      finishReason: finishReason as LlmResponse["finishReason"],
      usageMetadata: usage
        ? {
            promptTokenCount: usage.prompt_tokens,
            candidatesTokenCount: usage.completion_tokens,
            totalTokenCount: usage.total_tokens,
          }
        : undefined,
    };
  }
}
