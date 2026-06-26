import { BaseLlm, LlmRequest, LlmResponse, BaseLlmConnection } from "@google/adk";
import type { FunctionDeclaration, Type, Content as GenaiContent } from "@google/genai";

interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenAIResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamToolCall {
  index: number;
  id?: string;
  type?: "function";
  function?: {
    name?: string;
    arguments?: string;
  };
}

interface OpenAIStreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      tool_calls?: OpenAIStreamToolCall[];
    };
    finish_reason: string | null;
  }>;
}

interface OpenAIToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

const TYPE_MAP: Record<string, string> = {
  STRING: "string",
  NUMBER: "number",
  INTEGER: "integer",
  BOOLEAN: "boolean",
  ARRAY: "array",
  OBJECT: "object",
};

function googleSchemaToOpenAI(schema: { type?: Type | string; [key: string]: unknown }): Record<string, unknown> {
  if (!schema || typeof schema !== "object") {
    return {};
  }

  const result: Record<string, unknown> = {};

  if (schema.type) {
    result.type = TYPE_MAP[schema.type as string] ?? schema.type;
  }

  if (schema.description) {
    result.description = schema.description;
  }

  if (schema.enum) {
    result.enum = schema.enum;
  }

  if (schema.format) {
    result.format = schema.format;
  }

  if (schema.items) {
    result.items = googleSchemaToOpenAI(schema.items as { type?: Type | string; [key: string]: unknown });
  }

  if (schema.properties) {
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      props[key] = googleSchemaToOpenAI(value as { type?: Type | string; [key: string]: unknown });
    }
    result.properties = props;
  }

  if (schema.required) {
    result.required = schema.required;
  }

  if (schema.nullable) {
    result.nullable = true;
  }

  if (schema.default !== undefined) {
    result.default = schema.default;
  }

  if (schema.example !== undefined) {
    result.examples = [schema.example];
  }

  return result;
}

function declarationsToOpenAITools(declarations: FunctionDeclaration[]): OpenAIToolDefinition[] {
  return declarations
    .filter((d) => d.name)
    .map((d) => ({
      type: "function" as const,
      function: {
        name: d.name!,
        description: d.description || "",
        parameters: d.parameters
          ? googleSchemaToOpenAI(d.parameters as { type?: Type | string; [key: string]: unknown })
          : { type: "object", properties: {} },
      },
    }));
}

function mapRoleToOpenAI(role?: string): OpenAIMessage["role"] {
  if (role === "model" || role === "assistant") return "assistant";
  if (role === "system") return "system";
  if (role === "tool") return "tool";
  return "user";
}

function parseToolArguments(raw: string): Record<string, unknown> {
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
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

    const tools = this.extractTools(llmRequest);

    if (stream) {
      yield* this.streamResponse(messages, model, tools, llmRequest);
    } else {
      yield* this.nonStreamingResponse(messages, model, tools, llmRequest);
    }
  }

  async connect(_llmRequest: LlmRequest): Promise<BaseLlmConnection> {
    throw new Error("Live connection not supported for DeepSeek");
  }

  private extractTools(llmRequest: LlmRequest): OpenAIToolDefinition[] {
    const declarations: FunctionDeclaration[] = [];

    for (const tool of Object.values(llmRequest.toolsDict)) {
      const decl = tool._getDeclaration?.();
      if (decl) {
        declarations.push(decl);
      }
    }

    if (declarations.length === 0) {
      return [];
    }

    return declarationsToOpenAITools(declarations);
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

      const textParts = content.parts
        .filter((p) => p.text)
        .map((p) => p.text!);

      const functionCalls = content.parts
        .filter((p) => p.functionCall)
        .map((p) => p.functionCall!);

      const functionResponses = content.parts
        .filter((p) => p.functionResponse)
        .map((p) => p.functionResponse!);

      if (textParts.length > 0 && functionCalls.length === 0) {
        messages.push({
          role: mapRoleToOpenAI(content.role),
          content: textParts.join("\n"),
        });
      }

      if (functionCalls.length > 0) {
        const toolCalls: OpenAIToolCall[] = functionCalls.map((fc, i) => ({
          id: fc.id || `call_${i}`,
          type: "function" as const,
          function: {
            name: fc.name || "",
            arguments: JSON.stringify(fc.args || {}),
          },
        }));
        messages.push({
          role: "assistant",
          content: textParts.length > 0 ? textParts.join("\n") : null,
          tool_calls: toolCalls,
        });
      }

      for (const fr of functionResponses) {
        messages.push({
          role: "tool",
          content: typeof fr.response === "string"
            ? fr.response
            : JSON.stringify(fr.response),
          tool_call_id: fr.id || "",
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

  private buildRequestBody(
    messages: OpenAIMessage[],
    model: string,
    tools: OpenAIToolDefinition[],
    llmRequest: LlmRequest,
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model,
      messages,
      stream: false,
    };

    if (tools.length > 0) {
      body.tools = tools;

      const mode = llmRequest.config?.toolConfig?.functionCallingConfig?.mode;
      const allowedNames =
        llmRequest.config?.toolConfig?.functionCallingConfig?.allowedFunctionNames;

      if (mode === "ANY" && allowedNames?.length === 1) {
        body.tool_choice = {
          type: "function",
          function: { name: allowedNames[0] },
        };
      } else if (mode === "ANY") {
        body.tool_choice = "required";
      }
    }

    if (llmRequest.config?.responseMimeType === "application/json") {
      body.response_format = { type: "json_object" };
    }

    return body;
  }

  private async *nonStreamingResponse(
    messages: OpenAIMessage[],
    model: string,
    tools: OpenAIToolDefinition[],
    llmRequest: LlmRequest,
  ): AsyncGenerator<LlmResponse, void> {
    const body = this.buildRequestBody(messages, model, tools, llmRequest);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const parts: GenaiContent["parts"] = choice.message.tool_calls.map((tc) => ({
        functionCall: {
          id: tc.id,
          name: tc.function.name,
          args: parseToolArguments(tc.function.arguments),
        },
      }));

      if (choice.message.content) {
        parts.unshift({ text: choice.message.content });
      }

      yield {
        content: { parts, role: "model" },
        turnComplete: true,
        finishReason: choice.finish_reason as LlmResponse["finishReason"],
        usageMetadata: data.usage
          ? {
              promptTokenCount: data.usage.prompt_tokens,
              candidatesTokenCount: data.usage.completion_tokens,
              totalTokenCount: data.usage.total_tokens,
            }
          : undefined,
      };
      return;
    }

    yield this.convertToLlmResponse(choice.message.content, choice.finish_reason, data.usage);
  }

  private async *streamResponse(
    messages: OpenAIMessage[],
    model: string,
    tools: OpenAIToolDefinition[],
    llmRequest: LlmRequest,
  ): AsyncGenerator<LlmResponse, void> {
    const body = {
      ...this.buildRequestBody(messages, model, tools, llmRequest),
      stream: true,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    const streamedToolCalls: Map<number, OpenAIToolCall> = new Map();

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

            if (choice.delta?.tool_calls) {
              for (const tc of choice.delta.tool_calls) {
                const existing = streamedToolCalls.get(tc.index);
                if (existing) {
                  existing.function.name += tc.function?.name || "";
                  existing.function.arguments += tc.function?.arguments || "";
                } else {
                  streamedToolCalls.set(tc.index, {
                    id: tc.id || `call_${tc.index}`,
                    type: "function",
                    function: {
                      name: tc.function?.name || "",
                      arguments: tc.function?.arguments || "",
                    },
                  });
                }
              }
            }

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
              if (streamedToolCalls.size > 0) {
                const parts: GenaiContent["parts"] = Array.from(streamedToolCalls.values()).map((tc) => ({
                  functionCall: {
                    id: tc.id,
                    name: tc.function.name,
                    args: parseToolArguments(tc.function.arguments),
                  },
                }));

                if (fullContent) {
                  parts.unshift({ text: fullContent });
                }

                yield {
                  content: { parts, role: "model" },
                  turnComplete: true,
                  finishReason: finishReason as LlmResponse["finishReason"],
                };
              } else {
                yield this.convertToLlmResponse(fullContent, finishReason, undefined);
              }
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
    content: string | null,
    finishReason: string,
    usage?: OpenAIResponse["usage"],
  ): LlmResponse {
    return {
      content: {
        parts: [{ text: content || "" }],
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
