"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (!token) {
      router.replace("/auth/Signin");
      return;
    }

    // simpan token agar halaman dashboard kamu bisa akses /api/me
    localStorage.setItem("token", token);

    // arahkan ke halaman dashboard yang SUDAH KAMU PUNYA
    if (role === "super_admin") {
      router.replace("/super-admin/dashboard");
    } else if (role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/user/welcome");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm text-gray-500">Signing you in with Google…</p>
    </div>
  );
}
