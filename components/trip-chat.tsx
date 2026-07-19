"use client";

import { Bot, Send, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface TripChatProps {
  tripTitle: string;
  tripContext: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    locations: { locationTitle: string }[];
  };
}

export default function TripChat({ tripTitle, tripContext }: TripChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, startPending] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");

    startPending(async () => {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map((m) => ({ role: m.role, content: m.content })),
            tripContext,
          }),
        });
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        // Add an empty assistant message that we will stream into.
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I could not respond right now. Try again.",
          },
        ]);
      }
    });
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-white shadow-lg transition-colors hover:bg-sky-700"
        >
          <Bot className="h-5 w-5" /> Ask AI
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-sky-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="text-sm font-semibold">AI Travel Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3 text-sm"
          >
            {messages.length === 0 && (
              <p className="text-center text-gray-400">
                Ask me anything about “{tripTitle}” — best times to visit,
                packing tips, hidden gems, and more.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl bg-sky-600 px-3 py-2 text-white"
                      : "max-w-[80%] whitespace-pre-line rounded-2xl bg-white px-3 py-2 text-gray-800 shadow-sm"
                  }
                >
                  {m.content || "…"}
                </div>
              </div>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-gray-200 p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={pending}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
