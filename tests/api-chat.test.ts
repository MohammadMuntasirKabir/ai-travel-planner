import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup";
import { createMockNextRequest } from "./setup";

const mockAuth = vi.hoisted(() => vi.fn());
const mockStreamChat = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/ai", () => ({ streamChatCompletion: mockStreamChat }));

import { POST } from "@/app/api/ai/chat/route";

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockStreamChat.mockReset();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await POST(
      createMockNextRequest({ messages: [{ role: "user", content: "Hello" }] }),
    );
    expect(res.status).toBe(401);
  });

  it("should return streaming response with correct headers", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });

    // The streamChatCompletion returns ReadableStream<string> where each
    // element is a string delta. The route handler wraps it in a
    // ReadableStream that encodes strings to Uint8Array.
    const mockStream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue("Hello");
        controller.enqueue(" from AI!");
        controller.close();
      },
    });

    mockStreamChat.mockResolvedValueOnce(mockStream);

    const res = await POST(
      createMockNextRequest({
        messages: [{ role: "user", content: "Best places?" }],
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(res.headers.get("Transfer-Encoding")).toBe("chunked");

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value as BufferSource);
    }
    expect(text).toBe("Hello from AI!");
  });

  it("should include trip context in system message when provided", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockStreamChat.mockResolvedValueOnce(
      new ReadableStream({
        start(c) {
          c.close();
        },
      }),
    );
    await POST(
      createMockNextRequest({
        messages: [{ role: "user", content: "Suggest activities" }],
        tripContext: { title: "Japan Trip", locations: ["Tokyo"] },
      }),
    );
    expect(mockStreamChat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("Japan Trip"),
        }),
      ]),
      expect.anything(),
    );
  });

  it("should use default system message without trip context", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockStreamChat.mockResolvedValueOnce(
      new ReadableStream({
        start(c) {
          c.close();
        },
      }),
    );
    await POST(
      createMockNextRequest({ messages: [{ role: "user", content: "Hello" }] }),
    );
    expect(mockStreamChat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("travel assistant"),
        }),
      ]),
      expect.anything(),
    );
  });

  it("should return 500 on streaming error", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockStreamChat.mockRejectedValueOnce(new Error("API unavailable"));
    const res = await POST(
      createMockNextRequest({ messages: [{ role: "user", content: "Hello" }] }),
    );
    expect(res.status).toBe(500);
  });
});
