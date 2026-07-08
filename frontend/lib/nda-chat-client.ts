import type { MndaFormData } from "@/lib/mnda-content";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface NdaChatResponse {
  assistantMessage: string;
  fields: MndaFormData;
  isComplete: boolean;
}

export async function postNdaChatTurn(
  messages: ChatMessage[],
  currentFields: MndaFormData,
): Promise<NdaChatResponse> {
  const response = await fetch("/api/nda/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, currentFields }),
  });

  if (!response.ok) {
    throw new Error("The AI assistant is temporarily unavailable. Please try again.");
  }

  return response.json();
}
