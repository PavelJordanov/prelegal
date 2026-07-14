import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold text-brand-navy">Welcome to Prelegal</h1>
      <p className="mt-2 max-w-md text-sm text-brand-gray">
        Chat with our AI assistant to draft your first agreement, or pick up where you left off.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/dashboard/draft/"
          className="rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Start a new document
        </Link>
        <Link
          href="/dashboard/documents/"
          className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-brand-navy transition-colors hover:border-brand-blue hover:text-brand-blue"
        >
          View my documents
        </Link>
      </div>
    </main>
  );
}
