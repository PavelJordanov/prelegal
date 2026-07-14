"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

const NAV_ITEMS = [
  { href: "/dashboard/", label: "Dashboard" },
  { href: "/dashboard/draft/", label: "New Document" },
  { href: "/dashboard/documents/", label: "My Documents" },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.replace("/login/");
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-brand-navy px-4 py-6">
      <Link href="/dashboard/" className="px-2 pb-8 text-lg font-semibold text-white">
        Prelegal
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || `${pathname}/` === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-md bg-brand-yellow px-3 py-2 text-sm font-medium text-brand-navy"
                  : "rounded-md px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <p className="truncate px-2 text-xs text-zinc-400">{userEmail}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 w-full rounded-md px-2 py-2 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
