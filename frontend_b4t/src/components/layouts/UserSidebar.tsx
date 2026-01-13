"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
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

  const [me, setMe] = useState<MeResponse>({
    name: null,
    email: null,
    role: null,
  });



  // active state (USER)
  const isDashboard =
    pathname.startsWith("/user/dashboard") || pathname.startsWith("/user/welcome");

  const itemClass = (active: boolean) =>
    [
      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
      active
        ? "bg-gray-100 text-gray-900"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    ].join(" ");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get<any>("/user/welcome");
        const data = res.data?.user ?? res.data?.data ?? res.data ?? {};

        setMe({
          name: data?.name ?? data?.full_name ?? data?.username ?? null,
          email: data?.email ?? data?.user_email ?? null,
          role: data?.role ?? "user",
        });
      } catch {
        // ignore (fallback aman)
      }
    };

    fetchMe();
  }, []);

  const onLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // ignore
    } finally {
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
              {me.name || me.email || "Account"}
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
