import type { DocumentType } from "@/lib/documents/types";
import { extractErrorMessage } from "@/lib/api-error";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatTurnResponse {
  documentId: number | null;
  documentType: DocumentType | null;
  assistantMessage: string;
  fields: Record<string, unknown>;
  isComplete: boolean;
}

export async function postChatTurn(
  messages: ChatMessage[],
  documentId: number | null,
  documentType: DocumentType | null,
  currentFields: Record<string, unknown>,
): Promise<ChatTurnResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, documentId, documentType, currentFields }),
  });

  if (response.status === 401) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "The AI assistant is temporarily unavailable. Please try again."),
    );
  }

  return response.json();
}
