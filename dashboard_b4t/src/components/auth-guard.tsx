"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "http://localhost:3000/login";

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setIsAuthed(true); // Authenticated, render children
      } catch (err) {
        setIsAuthed(false); // Not authenticated, redirect without rendering children
        router.push(loginUrl);
      } finally {
        setChecking(false);
      }
    })();
  }, [router, loginUrl]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-800">
        Memeriksa sesi...
      </div>
    );
  }

  // Hanya render children jika authenticated
  if (!isAuthed) {
    return null; // Jangan render apa-apa, redirect akan handle
  }

  return <>{children}</>;
}
