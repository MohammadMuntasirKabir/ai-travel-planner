// POST /api/ai/chat
// Streaming chat endpoint for the AI travel assistant

import { auth } from "@/auth";
import { streamChatCompletion } from "@/lib/ai";
import { PROMPTS } from "@/lib/ai-prompts";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const { messages, tripContext } = await req.json();

    const systemMessage = tripContext
      ? `${PROMPTS.chatSystem}\n\nCurrent trip context: ${JSON.stringify(tripContext)}`
      : PROMPTS.chatSystem;

    const chatMessages = [
      { role: "system" as const, content: systemMessage },
      ...messages,
    ];

    const stream = await streamChatCompletion(chatMessages, { maxTokens: 2048 });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(encoder.encode(value));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export const POST = withRateLimit(handler);
