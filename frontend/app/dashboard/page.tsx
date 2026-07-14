import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-lg font-semibold text-brand-navy">Prelegal</h1>
          <Link
            href="/login/"
            className="text-sm font-medium text-brand-gray hover:text-brand-navy"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <h2 className="text-xl font-semibold text-brand-navy">Welcome to Prelegal</h2>
        <p className="mt-2 max-w-md text-sm text-brand-gray">
          Chat with our AI assistant to draft your first agreement.
        </p>
        <Link
          href="/dashboard/draft/"
          className="mt-6 rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          Start a new document
        </Link>
      </main>
    </div>
  );
}
