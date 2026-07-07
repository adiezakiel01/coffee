"use client";

import { useState, useEffect, useRef } from "react";
import { chatApi } from "@/lib/api";
import { generateSessionId } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ASSISTANT_ENABLED = process.env.NEXT_PUBLIC_ASSISTANT_ENABLED === "true";

const SUGGESTED_QUESTIONS = [
  "What has worked well for my best-rated bean?",
  "How should I adjust my next brew to improve the rating?",
  "Which of my beans tends to brew better as iced filter?",
  "What's been inconsistent across my recent brews?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useState<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatApi.send({
        session_id: sessionId,
        message: text.trim(),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.response,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the assistant. Make sure your backend is running locally with Ollama.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  if (!ASSISTANT_ENABLED) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-4">☕</div>
        <h2 className="text-lg font-medium text-ink mb-2">
          Assistant available locally
        </h2>
        <p className="text-sm text-ink/60 max-w-sm leading-relaxed">
          The brew assistant runs on your local machine via Ollama to keep your
          brew data completely private. Run the app locally to use it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4 flex-shrink-0">
        <p className="text-xs text-accent uppercase tracking-wide mb-1">
          assistant
        </p>
        <h1 className="text-xl font-medium">Brew assistant</h1>
        <p className="text-xs text-ink/50 mt-1">
          Ask anything about your brew history — powered by your local data.
        </p>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          /* Empty state with suggested questions */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-3xl mb-4">💬</div>
            <p className="text-sm text-ink/60 mb-6 max-w-sm">
              Ask about your brew history, parameter patterns, or what to try
              next.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="text-left text-sm bg-card text-accent text-card-ink px-4 py-2.5 rounded-xl hover:shadow-md transition-shadow"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-accent-strong text-ink rounded-br-sm"
                      : "bg-card text-accent-roast rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <p
                    className={`text-xs text-accent mt-1 ${
                      msg.role === "user"
                        ? "text-ink/60"
                        : "text-card-ink-muted"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-1.5 h-1.5 bg-card-ink-muted rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-card-ink-muted rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-card-ink-muted rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar — fixed at bottom */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 flex gap-2 items-end"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask about your brews..."
          rows={1}
          disabled={loading}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm bg-card text-accent-roast text-card-ink border border-card-ink-muted/20 resize-none disabled:opacity-50 focus:outline-none focus:border-accent/40"
          style={{ minHeight: 44, maxHeight: 120 }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-accent-strong text-ink rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50 flex-shrink-0 h-11"
        >
          Send
        </button>
      </form>
    </div>
  );
}
