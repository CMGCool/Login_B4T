"use client";

import { useEffect, useState } from "react";
import {
  LayoutGrid,
  LogOut,
  UserCircle2,
  Menu,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { GiBackForth } from "react-icons/gi";

type MeResponse = {
  name?: string | null;
  email?: string | null;
  role?: "super_admin" | "admin" | "user" | string | null;
};

function roleLabel(role?: string | null) {
  const r = String(role ?? "").toLowerCase();
  if (r === "super_admin") return "Super Admin";
  if (r === "admin") return "Admin";
  if (r === "user") return "User";
  return role ? String(role) : "Unknown";
}

export default function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<MeResponse>({ name: null, email: null, role: null });

  // Active states (Super Admin routes)
  const isDashboard = pathname.startsWith("/dashboard/super-admin/dashboard");
  const isUsers = pathname.startsWith("/dashboard/super-admin/users");
  const isAdmin = pathname.startsWith("/dashboard/super-admin/admin");
  const isTesting = pathname.startsWith("/dashboard/super-admin/layanan");
  const isTarget = pathname.startsWith("/dashboard/super-admin/target");
  const isSettings = pathname.startsWith("/dashboard/super-admin/settings");

  useEffect(() => {
    const w = collapsed ? "76px" : "280px";
    document.documentElement.style.setProperty("--sidebar-w", w);
    return () => {
      document.documentElement.style.removeProperty("--sidebar-w");
    };
  }, [collapsed]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get<any>("/me");
        const payload = res.data;
        console.log("Sidebar fetchMe payload:", payload);
        setMe({
          name: payload?.name ?? null,
          email: payload?.email ?? null,
          role: payload?.role ?? null,
        });
      } catch (err) {
        console.error("Sidebar fetchMe error:", err);
        setMe({ name: null, email: null, role: null });
      }
    };
    fetchMe();
  }, []);

  const onLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
      // abaikan kalau gagal
    } finally {
      // Clear cookie
      document.cookie = "token=; path=/; domain=localhost; Max-Age=0";
      router.replace("/");
    }
  };

  const itemClass = (active: boolean) =>
    [
      "w-full flex items-center rounded-lg text-[13px] transition select-none",
      collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
      active
        ? "bg-slate-100 text-slate-900"
        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
    ].join(" ");

  return (
    <aside
      className={[
        "h-full bg-white border-r border-slate-100 flex flex-col",
        "transition-all duration-300",
      ].join(" ")}
    >
      {/* Header: logo only when expanded, when collapsed show only hamburger */}
      <div
        className={[
          "flex items-center",
          collapsed ? "justify-center" : "justify-between",
          "px-5 py-4",
        ].join(" ")}
      >
        {!collapsed && (
          <Image
            src="/images/Logo-B4T.png"
            alt="B4T"
            width={54}
            height={32}
            className="h-auto w-auto"
            priority
          />
        )}

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="p-2 rounded-lg hover:bg-slate-50 text-slate-700"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Menu (Super Admin) */}
      <nav className="space-y-1 px-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/super-admin/dashboard")}
          className={itemClass(isDashboard)}
        >
          <LayoutGrid className="h-4 w-4" />
          {!collapsed && "Dashboard"}
        </button>
      </nav>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => router.push("http://localhost:3000/super-admin/dashboard")}
        className={itemClass(false)}
      >
        <GiBackForth className="h-4 w-4" />
        {!collapsed && "Kembali"}
      </button>

      {/* Profile + Logout */}
      <div className={[collapsed ? "px-2 pb-4" : "px-5 pb-5", "mt-4"].join(" ")}>
        <div className="border-t border-slate-100 pt-4">
          {collapsed ? (
            // COLLAPSED: stack vertical
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                <UserCircle2 className="h-6 w-6 text-slate-600" />
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg transition text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : (
            // EXPANDED: normal (profile kiri, logout kanan)
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <UserCircle2 className="h-6 w-6 text-slate-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">
                    {me.name || "Account"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {roleLabel(me.role)}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {me.email || "-"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg transition text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
