"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import DraftChat, { type DraftTurnResult } from "@/components/DraftChat";
import DocumentPreview from "@/components/DocumentPreview";
import DocumentPdfDocument from "@/components/DocumentPdfDocument";
import { DOCUMENT_REGISTRY } from "@/lib/documents/registry";
import type { DocumentType } from "@/lib/documents/types";
import { getDocument } from "@/lib/documents-client";
import type { ChatMessage } from "@/lib/chat-client";

function DraftPageContent({ resumeId }: { resumeId: string | null }) {
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [initialMessages, setInitialMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(Boolean(resumeId));
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    getDocument(Number(resumeId))
      .then((document) => {
        if (cancelled) return;
        setDocumentId(document.id);
        setDocumentType(document.documentType);
        setFields(document.fields);
        setInitialMessages(document.messages);
        setIsComplete(document.isComplete);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDraft(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  const content = documentType ? DOCUMENT_REGISTRY[documentType] : null;
  const data = content ? content.hydrate(fields) : null;

  function handleTurnComplete(result: DraftTurnResult) {
    setDocumentId(result.documentId);
    setDocumentType(result.documentType);
    setFields(result.fields);
    setIsComplete(result.isComplete);
  }

  async function handleDownload() {
    if (!content || !data) return;
    setIsGeneratingPdf(true);
    setDownloadError(false);
    try {
      const blob = await pdf(<DocumentPdfDocument content={content} data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = content.pdfFilename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  if (isLoadingDraft) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-brand-gray">Loading your draft…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-brand-navy">
              {content?.title ?? "New Document"}
            </h1>
            <p className="text-sm text-brand-gray">
              {isComplete
                ? "Your document is ready — download it below."
                : "Chat with the assistant to figure out what you need and fill in the details."}
            </p>
            {loadError && (
              <p className="text-sm text-red-700">
                Couldn&apos;t load that draft. Starting a new document instead.
              </p>
            )}
            {downloadError && (
              <p className="text-sm text-red-700">
                Something went wrong generating the PDF. Please try again.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!content || !isComplete || isGeneratingPdf}
            className="rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </header>

      <main className="grid flex-1 items-start grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
        <section className="flex h-[35vh] flex-col rounded-lg border border-zinc-200 bg-white p-5 lg:h-[calc(100vh-14rem)]">
          <DraftChat
            documentId={documentId}
            documentType={documentType}
            fields={fields}
            initialMessages={initialMessages}
            onTurnComplete={handleTurnComplete}
          />
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          {content && data ? (
            <DocumentPreview content={content} data={data} />
          ) : (
            <p className="text-sm text-brand-gray">
              Your document preview will appear here once we know what you&apos;re drafting.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function DraftPageParams() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  // Keying by resumeId forces a full remount (and thus a fresh state reset)
  // whenever the target document changes - e.g. following the sidebar's
  // "New Document" link while an existing draft is open. Without this, the
  // App Router keeps this component instance alive across the query-param
  // change, since it's the same route, and stale draft state would silently
  // carry over into what the user believes is a new document.
  return <DraftPageContent key={resumeId ?? "new"} resumeId={resumeId} />;
}

export default function DraftPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-brand-gray">Loading…</p>
        </div>
      }
    >
      <DraftPageParams />
    </Suspense>
  );
}
