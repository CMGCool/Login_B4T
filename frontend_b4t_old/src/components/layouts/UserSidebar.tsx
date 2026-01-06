"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { LayoutGrid, LogOut, UserCircle2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type MeResponse = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function roleLabel(role?: string | null) {
  const r = String(role ?? "").toLowerCase();
  if (r === "user") return "User";
  if (r === "admin") return "Admin";
  if (r === "super_admin") return "Super Admin";
  return role ? String(role) : "Unknown";
}

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [me, setMe] = useState<MeResponse>({
    name: null,
    email: null,
    role: null,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: token
        ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        : { Accept: "application/json" },
    });
  }, [API_BASE_URL, token]);

  // active state (USER)
  const isDashboard = pathname.startsWith("/user/dashboard");

  const itemClass = (active: boolean) =>
    [
      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
      active
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    ].join(" ");

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      try {
        const res = await axiosAuth.get("/api/me");
        setMe({
          name: res.data?.name ?? null,
          email: res.data?.email ?? null,
          role: res.data?.role ?? null,
        });
      } catch {
        // ignore (fallback aman)
      }
    };
    fetchMe();
  }, [axiosAuth, token]);

  const onLogout = async () => {
    try {
      if (token) await axiosAuth.post("/api/logout");
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      router.replace("/auth/Signin");
    }
  };

  return (
    <aside className="w-[260px] min-h-screen bg-white px-6 py-6 flex flex-col border-r border-gray-100">
      {/* Logo */}
      <div className="text-xl font-semibold text-gray-900 mb-8">B4T</div>

      {/* Menu User: Dashboard saja */}
      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => router.push("/user/dashboard")}
          className={itemClass(isDashboard)}
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </button>
      </nav>

      <div className="flex-1" />

      {/* Profile + Logout */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircle2 className="h-5 w-5 text-gray-600" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {me.name || "Account"}
            </p>
            <p className="text-xs text-gray-500 truncate">{roleLabel(me.role)}</p>
            <p className="text-xs text-gray-500 truncate">{me.email || "-"}</p>
          </div>
        </div>

        {/* Logout merah */}
        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
