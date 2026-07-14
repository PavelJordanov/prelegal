import type { DocumentType } from "@/lib/documents/types";
import type { ChatMessage } from "@/lib/chat-client";
import { extractErrorMessage } from "@/lib/api-error";

export interface DocumentSummary {
  id: number;
  documentType: DocumentType;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail extends DocumentSummary {
  fields: Record<string, unknown>;
  messages: ChatMessage[];
}

export async function listDocuments(): Promise<DocumentSummary[]> {
  const response = await fetch("/api/documents");
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Couldn't load your documents. Please try again."));
  }
  return response.json();
}

export async function getDocument(id: number): Promise<DocumentDetail> {
  const response = await fetch(`/api/documents/${id}`);
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Couldn't load that document."));
  }
  return response.json();
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, "Couldn't delete that document."));
  }
}
