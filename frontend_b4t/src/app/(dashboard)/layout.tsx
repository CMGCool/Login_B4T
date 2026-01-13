"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    api
      .get("/me")
      .then(() => {
        // ✅ Login valid
        console.log("Auth check success");
        setCheckingAuth(false);
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        router.replace("/auth/Signin");
      });
  }, [router]);

  if (checkingAuth) {
    return (
      <div style={{ padding: 20 }}>
        <p>Checking authentication...</p>
      </div>
    );
  }
  console.log("🔥 DASHBOARD LAYOUT MOUNTED");
  return <>{children}</>;
}
