"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard/");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-brand-navy">Prelegal</h1>
        <p className="mt-1 text-sm text-brand-gray">
          Sign in to start drafting your agreements.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-brand-navy">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              placeholder="you@company.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-brand-navy">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-blue"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-brand-purple px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
