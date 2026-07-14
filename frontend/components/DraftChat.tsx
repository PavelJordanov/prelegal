"use client";

import { useState } from "react";
import type { DocumentType } from "@/lib/documents/types";
import { postChatTurn, type ChatMessage } from "@/lib/chat-client";

const GREETING =
  "Tell me what kind of agreement you're looking to put together, and I'll help you draft it.";

export interface DraftTurnResult {
  documentId: number | null;
  documentType: DocumentType | null;
  fields: Record<string, unknown>;
  isComplete: boolean;
}

interface DraftChatProps {
  documentId: number | null;
  documentType: DocumentType | null;
  fields: Record<string, unknown>;
  /** Transcript to resume from, e.g. when reopening a saved draft. Only read
   * on first render - later prop changes don't reset an in-progress chat. */
  initialMessages?: ChatMessage[];
  onTurnComplete: (result: DraftTurnResult) => void;
}

export default function DraftChat({
  documentId,
  documentType,
  fields,
  initialMessages,
  onTurnComplete,
}: DraftChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages && initialMessages.length > 0
      ? initialMessages
      : [{ role: "assistant", content: GREETING }],
  );
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("Something went wrong.");

  async function sendTurn(nextMessages: ChatMessage[]) {
    setMessages(nextMessages);
    setStatus("sending");
    try {
      const response = await postChatTurn(nextMessages, documentId, documentType, fields);
      setMessages([...nextMessages, { role: "assistant", content: response.assistantMessage }]);
      onTurnComplete({
        documentId: response.documentId,
        documentType: response.documentType,
        fields: response.fields,
        isComplete: response.isComplete,
      });
      setStatus("idle");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || status === "sending") return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setDraft("");
    void sendTurn(nextMessages);
  }

  function handleRetry() {
    void sendTurn(messages);
  }

  return (
    <div className="flex h-full flex-col">
      <div role="log" aria-label="Chat transcript" className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "assistant"
                ? "max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-brand-navy"
                : "ml-auto max-w-[85%] rounded-lg bg-brand-blue px-3 py-2 text-sm text-black"
            }
          >
            {message.content}
          </div>
        ))}
        {status === "sending" && (
          <div className="max-w-[85%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-brand-gray">
            Prelegal is thinking…
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="font-medium underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={status === "sending"}
          placeholder="Type your reply…"
          aria-label="Your reply"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-black outline-none focus:border-brand-blue disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "sending" || !draft.trim()}
          className="rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
