import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup";

describe("lib/ai.ts", () => {
  let chatCompletion: (
    messages: import("@/lib/ai").ChatMessage[],
    options?: { maxTokens?: number; temperature?: number },
  ) => Promise<string>;
  let streamChatCompletion: (
    messages: import("@/lib/ai").ChatMessage[],
    options?: { maxTokens?: number; temperature?: number },
  ) => Promise<ReadableStream<string>>;
  let MODEL: string;

  beforeEach(async () => {
    vi.resetModules();
    const ai = await import("@/lib/ai");
    chatCompletion = ai.chatCompletion;
    streamChatCompletion = ai.streamChatCompletion;
    MODEL = ai.MODEL;
  });

  describe("chatCompletion", () => {
    it("should call OpenAI with correct default parameters", async () => {
      const mockFn = (
        globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>
      ).__mockChatCompletion;
      mockFn.mockResolvedValueOnce({
        choices: [{ message: { content: "Hello from AI" } }],
      });

      const result = await chatCompletion([
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hi" },
      ]);

      expect(result).toBe("Hello from AI");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: "system", content: "You are helpful" },
            { role: "user", content: "Hi" },
          ],
          max_tokens: 2048,
          temperature: 0.7,
        }),
      );
    });

    it("should use custom maxTokens and temperature", async () => {
      const mockFn = (
        globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>
      ).__mockChatCompletion;
      mockFn.mockResolvedValueOnce({
        choices: [{ message: { content: "Custom" } }],
      });

      await chatCompletion([{ role: "user", content: "Test" }], {
        maxTokens: 4096,
        temperature: 0.3,
      });

      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 4096,
          temperature: 0.3,
        }),
      );
    });

    it("should return empty string when no content", async () => {
      const mockFn = (
        globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>
      ).__mockChatCompletion;
      mockFn.mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      });

      const result = await chatCompletion([{ role: "user", content: "Test" }]);
      expect(result).toBe("");
    });

    it("should propagate API errors", async () => {
      const mockFn = (
        globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>
      ).__mockChatCompletion;
      mockFn.mockRejectedValueOnce(new Error("API rate limit"));

      await expect(
        chatCompletion([{ role: "user", content: "Test" }]),
      ).rejects.toThrow("API rate limit");
    });

    it("should use the MODEL constant", async () => {
      const mockFn = (
        globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>
      ).__mockChatCompletion;
      mockFn.mockResolvedValueOnce({
        choices: [{ message: { content: "ok" } }],
      });

      await chatCompletion([{ role: "user", content: "test" }]);

      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          model: MODEL,
        }),
      );
    });
  });

  describe("streamChatCompletion", () => {
    it("should return a ReadableStream with chunked content", async () => {
      const mockFn = (
        globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>
      ).__mockChatCompletion;

      const chunks = [
        { choices: [{ delta: { content: "Hello" } }] },
        { choices: [{ delta: { content: " world" } }] },
        { choices: [{ delta: { content: "!" } }] },
        { choices: [{ delta: {} }] },
      ];

      const asyncIter = {
        [Symbol.asyncIterator]() {
          let i = 0;
          return {
            next() {
              if (i < chunks.length) {
                return Promise.resolve({ value: chunks[i++], done: false });
              }
              return Promise.resolve({ value: undefined, done: true });
            },
          };
        },
      };

      mockFn.mockResolvedValueOnce(asyncIter);

      const stream = await streamChatCompletion([
        { role: "user", content: "Stream test" },
      ]);

      const reader = stream.getReader();
      const _decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += String(value);
      }

      expect(fullText).toBe("Hello world!");
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({ stream: true }),
      );
    });

    it("should handle stream errors", async () => {
      const mockFn = (
        globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>
      ).__mockChatCompletion;

      const asyncIter = {
        [Symbol.asyncIterator]() {
          return {
            next() {
              return Promise.reject(new Error("Stream broken"));
            },
          };
        },
      };

      mockFn.mockResolvedValueOnce(asyncIter);

      const stream = await streamChatCompletion([
        { role: "user", content: "Error test" },
      ]);

      const reader = stream.getReader();
      await expect(reader.read()).rejects.toThrow("Stream broken");
    });
  });
});
