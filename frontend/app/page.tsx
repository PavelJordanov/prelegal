"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import MndaForm from "@/components/MndaForm";
import MndaPreview from "@/components/MndaPreview";
import MndaPdfDocument from "@/components/MndaPdfDocument";
import { defaultMndaFormData, type MndaFormData } from "@/lib/mnda-content";

export default function Home() {
  const [formData, setFormData] = useState<MndaFormData>(defaultMndaFormData);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  async function handleDownload() {
    setIsGeneratingPdf(true);
    try {
      const blob = await pdf(<MndaPdfDocument data={formData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Mutual-NDA.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              Mutual NDA Creator
            </h1>
            <p className="text-sm text-zinc-500">
              Fill in the details below to generate a Mutual Non-Disclosure Agreement.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGeneratingPdf}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {isGeneratingPdf ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <MndaForm value={formData} onChange={setFormData} />
        </section>
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <MndaPreview data={formData} />
        </section>
      </main>
    </div>
  );
}
