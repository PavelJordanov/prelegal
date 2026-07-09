"use client";

import { useState } from "react";
import Link from "next/link";
import { pdf } from "@react-pdf/renderer";
import DraftChat, { type DraftTurnResult } from "@/components/DraftChat";
import DocumentPreview from "@/components/DocumentPreview";
import DocumentPdfDocument from "@/components/DocumentPdfDocument";
import { DOCUMENT_REGISTRY } from "@/lib/documents/registry";
import type { DocumentType } from "@/lib/documents/types";

export default function DraftPage() {
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const content = documentType ? DOCUMENT_REGISTRY[documentType] : null;
  const data = content ? content.hydrate(fields) : null;

  function handleTurnComplete(result: DraftTurnResult) {
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

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <Link href="/dashboard/" className="text-sm font-medium text-brand-gray hover:text-brand-navy">
              &larr; Back to dashboard
            </Link>
            <h1 className="text-lg font-semibold text-brand-navy">{content?.title ?? "New Document"}</h1>
            <p className="text-sm text-brand-gray">
              {isComplete
                ? "Your document is ready — download it below."
                : "Chat with the assistant to figure out what you need and fill in the details."}
            </p>
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

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
        <section className="flex h-[35vh] flex-col rounded-lg border border-zinc-200 bg-white p-5">
          <DraftChat documentType={documentType} fields={fields} onTurnComplete={handleTurnComplete} />
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
