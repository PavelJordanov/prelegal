"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, type AuthUser } from "@/lib/auth-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((currentUser) => {
      if (cancelled) return;
      if (currentUser === null) {
        router.replace("/login/");
        return;
      }
      setUser(currentUser);
      setIsChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isChecking || user === null) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50">
        <p className="text-sm text-brand-gray">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar userEmail={user.email} />
      <div className="flex flex-1 flex-col overflow-y-auto bg-zinc-50">{children}</div>
    </div>
  );
}
