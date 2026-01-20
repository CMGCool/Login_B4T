"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  LayoutGrid,
  Users,
  UserCog,
  Settings,
  LogOut,
  UserCircle2,
  Menu,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { FaServicestack } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";

type MeResponse = {
  name?: string | null;
  email?: string | null;
  role?: "super_admin" | "admin" | "user" | string | null;
};

function roleLabel(role?: string | null) {
  const r = String(role ?? "").toLowerCase();
  if (r === "super_admin") return "Super admin";
  if (r === "admin") return "Admin";
  if (r === "user") return "User";
  return role ? String(role) : "Unknown";
}

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  active: boolean;
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<MeResponse>({
    name: null,
    email: null,
    role: null,
  });

  // collapsed like screenshot
  const [collapsed, setCollapsed] = useState(false);

  // Active states
  const isDashboard = pathname.startsWith("/super-admin/dashboard");
  const isUsers = pathname.startsWith("/super-admin/users");
  const isAdmin = pathname.startsWith("/super-admin/admin");
  const isLayanan = pathname.startsWith("/super-admin/layanan");
  const isTarget = pathname.startsWith("/super-admin/target");
  const isSettings = pathname.startsWith("/super-admin/settings");

  // 🔥 Push width info to layout via CSS variable
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
        const data = res.data;
        setMe({
          name: data?.name ?? null,
          email: data?.email ?? null,
          role: data?.role ?? null,
        });
      } catch {
        setMe({ name: null, email: null, role: null });
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

  const navItems: NavItem[] = useMemo(
    () => [
      {
        key: "dashboard",
        label: "Dashboard",
        href: "/super-admin/dashboard",
        icon: <LayoutGrid className="h-[18px] w-[18px]" />,
        active: isDashboard,
      },
      {
        key: "users",
        label: "Users",
        href: "/super-admin/users",
        icon: <Users className="h-[18px] w-[18px]" />,
        active: isUsers,
      },
      {
        key: "admin",
        label: "Admin",
        href: "/super-admin/admin",
        icon: <UserCog className="h-[18px] w-[18px]" />,
        active: isAdmin,
      },
      {
        key: "layanan",
        label: "Layanan",
        href: "/super-admin/layanan",
        icon: <FaServicestack className="h-[18px] w-[18px]" />,
        active: isLayanan,
      },
      {
        key: "target",
        label: "Revenue Target",
        href: "/super-admin/target",
        icon: <FaArrowTrendUp className="h-[18px] w-[18px]" />,
        active: isTarget,
      },
      {
        key: "dashb4t",
        label: "Dashboard B4T",
        href: "http://localhost:3001/dashboard/super-admin/dashboard",
        icon: <MdDashboard className="h-[18px] w-[18px]" />,
        active: false,
      },
    ],
    [isDashboard, isUsers, isAdmin, isLayanan, isTarget]
  );

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
        collapsed ? "w-[76px]" : "w-[280px]",
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

      {/* ✅ Menu turun */}
      <nav className={[collapsed ? "px-2" : "px-5", "pt-6"].join(" ")}>
        <div className="space-y-1">
          {navItems.map((it) => (
            <button
              key={it.key}
              type="button"
              onClick={() => router.push(it.href)}
              className={itemClass(it.active)}
              title={collapsed ? it.label : undefined}
            >
              <span className="shrink-0 text-slate-700">{it.icon}</span>
              {!collapsed && <span className="truncate">{it.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1" />

      {/* Settings */}
      <div className={collapsed ? "px-2" : "px-5"}>
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => router.push("/super-admin/settings")}
            className={itemClass(isSettings)}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-[18px] w-[18px]" />
            {!collapsed && <span className="truncate">Settings</span>}
          </button>
        </div>
      </div>

      {/* ✅ Profile + Logout (collapsed: profile atas, logout bawah) */}
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
