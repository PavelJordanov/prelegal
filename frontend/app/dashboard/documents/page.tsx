"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DOCUMENT_REGISTRY } from "@/lib/documents/registry";
import { deleteDocument, listDocuments, type DocumentSummary } from "@/lib/documents-client";

/** SQLite's `datetime('now')` returns "YYYY-MM-DD HH:MM:SS" in UTC with no
 * timezone marker - append one so `Date` parses it as UTC, not local time. */
function formatUpdatedAt(sqliteUtcTimestamp: string): string {
  const date = new Date(`${sqliteUtcTimestamp.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return sqliteUtcTimestamp;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function fetchDocuments() {
    listDocuments()
      .then(setDocuments)
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  function handleRetry() {
    setLoadError(false);
    setDocuments(null);
    fetchDocuments();
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments((current) => current?.filter((doc) => doc.id !== id) ?? current);
      setConfirmingId(null);
    } catch {
      setLoadError(true);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-brand-navy">My Documents</h1>
        <p className="text-sm text-brand-gray">
          Resume a draft or revisit a document you&apos;ve completed.
        </p>
      </header>

      <main className="flex-1 px-6 py-6">
        {loadError && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm text-red-700">Couldn&apos;t load your documents. Please try again.</p>
            <button
              type="button"
              onClick={handleRetry}
              className="text-sm font-medium text-red-700 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {!loadError && documents === null && (
          <p className="text-sm text-brand-gray">Loading your documents…</p>
        )}

        {!loadError && documents !== null && documents.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center">
            <p className="text-sm font-medium text-brand-navy">No documents yet</p>
            <p className="max-w-sm text-sm text-brand-gray">
              Start a conversation with the assistant to draft your first agreement.
            </p>
            <Link
              href="/dashboard/draft/"
              className="mt-2 rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Start a new document
            </Link>
          </div>
        )}

        {!loadError && documents !== null && documents.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const title = DOCUMENT_REGISTRY[doc.documentType]?.title ?? doc.documentType;
              return (
                <article
                  key={doc.id}
                  className="flex flex-col justify-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-zinc-900">{title}</h2>
                      <span
                        className={
                          doc.isComplete
                            ? "shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : "shrink-0 rounded-full bg-brand-yellow/25 px-2 py-0.5 text-xs font-medium text-amber-800"
                        }
                      >
                        {doc.isComplete ? "Complete" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-gray">
                      Updated {formatUpdatedAt(doc.updatedAt)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={`/dashboard/draft/?id=${doc.id}`}
                      className="text-sm font-medium text-brand-blue hover:underline"
                    >
                      {doc.isComplete ? "View" : "Continue"}
                    </Link>

                    {confirmingId === doc.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
                        >
                          {deletingId === doc.id ? "Deleting…" : "Confirm delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="text-sm text-brand-gray hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(doc.id)}
                        className="text-sm text-brand-gray hover:text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
