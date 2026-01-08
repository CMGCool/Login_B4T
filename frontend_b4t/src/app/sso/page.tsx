"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // baca query params dari browser URL untuk menghindari error saat rendering di server
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const token = params?.get("token");
    const role = params?.get("role");

    if (!token) {
      router.replace("/auth/Signin");
      return;
    }

    localStorage.setItem("token", token);
    // Set cookie shared agar dashboard_b4t bisa pakai sesi yang sama
    document.cookie = `token=${token}; path=/; domain=localhost; SameSite=Lax`;

    if (role === "super_admin") {
      router.replace("/super-admin/dashboard");
    } else if (role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/user/welcome");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm text-gray-500">Signing you in with Google…</p>
    </div>
  );
}
