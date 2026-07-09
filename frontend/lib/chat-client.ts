import type { DocumentType } from "@/lib/documents/types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatTurnResponse {
  documentType: DocumentType | null;
  assistantMessage: string;
  fields: Record<string, unknown>;
  isComplete: boolean;
}

export async function postChatTurn(
  messages: ChatMessage[],
  documentType: DocumentType | null,
  currentFields: Record<string, unknown>,
): Promise<ChatTurnResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, documentType, currentFields }),
  });

  if (!response.ok) {
    throw new Error("The AI assistant is temporarily unavailable. Please try again.");
  }

  return response.json();
}
