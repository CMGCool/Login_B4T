"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || "http://localhost:3000/login";

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
      } catch (err) {
        router.push(`${loginUrl}`);
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

  return <>{children}</>;
}
