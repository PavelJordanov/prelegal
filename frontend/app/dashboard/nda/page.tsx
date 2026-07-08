"use client";

import { useState } from "react";
import Link from "next/link";
import { pdf } from "@react-pdf/renderer";
import NdaChat from "@/components/NdaChat";
import MndaPreview from "@/components/MndaPreview";
import MndaPdfDocument from "@/components/MndaPdfDocument";
import { defaultMndaFormData, type MndaFormData } from "@/lib/mnda-content";

export default function NdaChatPage() {
  const [fields, setFields] = useState<MndaFormData>(defaultMndaFormData);
  const [isComplete, setIsComplete] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  async function handleDownload() {
    setIsGeneratingPdf(true);
    setDownloadError(false);
    try {
      const blob = await pdf(<MndaPdfDocument data={fields} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Mutual-NDA.pdf";
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
            <h1 className="text-lg font-semibold text-brand-navy">Mutual NDA Creator</h1>
            <p className="text-sm text-brand-gray">
              {isComplete
                ? "Your NDA is ready — download it below."
                : "Chat with the assistant to fill in the details."}
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
            disabled={!isComplete || isGeneratingPdf}
            className="rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
        <section className="flex h-[35vh] flex-col rounded-lg border border-zinc-200 bg-white p-5">
          <NdaChat fields={fields} onFieldsChange={setFields} onCompleteChange={setIsComplete} />
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <MndaPreview data={fields} />
        </section>
      </main>
    </div>
  );
}
