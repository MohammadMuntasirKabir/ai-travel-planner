// OpenRouter AI client - uses OpenAI-compatible API via OpenRouter
// We use the `openai` SDK pointed at OpenRouter's endpoint

import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-preview";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: options?.maxTokens ?? 2048,
    temperature: options?.temperature ?? 0.7,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<ReadableStream<string>> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: options?.maxTokens ?? 2048,
    temperature: options?.temperature ?? 0.7,
    stream: true,
  });

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
