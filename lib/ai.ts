// OpenRouter AI client - uses OpenAI-compatible API via OpenRouter
// We use the `openai` SDK pointed at OpenRouter's endpoint

import OpenAI from "openai";

// Lazily instantiate the client so that build-time page-data collection
// (next build) does not require credentials to be present in the environment.
let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY!,
    });
  }
  return client;
}

export const MODEL =
  process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1_000;

function isRetryable(err: unknown): boolean {
  // Defensive: OpenAI.APIError may not exist in mock/test environments
  try {
    if (OpenAI.APIError && err instanceof OpenAI.APIError) {
      return (
        err.status === 429 || err.status === 500 || err.status === 502 ||
        err.status === 503 || err.status === 504
      );
    }
  } catch {
    // instanceof can throw if the class is not available
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("econnreset") || msg.includes("etimedout") ||
      msg.includes("socket hang up") || msg.includes("network error")
    );
  }
  return false;
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === MAX_RETRIES) {
        throw err;
      }
      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `${label}: attempt ${attempt}/${MAX_RETRIES} failed (${err}), retrying in ${delay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastErr;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const response = await withRetry(
    () =>
      getClient().chat.completions.create({
        model: MODEL,
        messages,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      }),
    "chatCompletion"
  );

  return response.choices[0]?.message?.content ?? "";
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<ReadableStream<string>> {
  const stream = await withRetry(
    () =>
      getClient().chat.completions.create({
        model: MODEL,
        messages,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
    "streamChatCompletion"
  );

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(delta);
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
