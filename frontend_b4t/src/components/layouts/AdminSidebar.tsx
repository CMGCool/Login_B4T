"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LayoutGrid, Users, Settings, LogOut, UserCircle2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FaServicestack } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";

type MeResponse = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

function roleLabel(role?: string | null) {
  const r = String(role ?? "").toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "super_admin") return "Super Admin";
  if (r === "user") return "User";
  return role ? String(role) : "Unknown";
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<MeResponse>({
    name: null,
    email: null,
    role: null,
  });



  // active states (ADMIN)
  const isDashboard = pathname.startsWith("/admin/dashboard");
  const isUsers = pathname.startsWith("/admin/users");
  const isSettings = pathname.startsWith("/admin/settings");
  const isTesting = pathname.startsWith("/admin/layanan");
  const isTarget = pathname.startsWith("/admin/target");

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
        const res = await api.get<any>("/me");
        const data = res.data;
        setMe({
          name: data?.name ?? null,
          email: data?.email ?? null,
          role: data?.role ?? null,
        });
      } catch {
        // fallback aman
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
    <aside
      className={[
        // ✅ bikin sidebar "nempel" dan tidak ikut scroll konten
        "fixed left-0 top-0 z-40",
        // ukuran sidebar (samakan dengan layout konten kamu)
        "w-[260px]",
        // tinggi full layar + scroll internal kalau kontennya kepanjangan
        "h-screen overflow-y-auto",
        // style existing
        "bg-white px-6 py-6 flex flex-col border-r border-gray-100",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="text-xl font-semibold text-gray-900 mb-8">B4T</div>

      {/* Menu Admin: hanya Dashboard + Users */}
      <nav className="space-y-1">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className={itemClass(isDashboard)}
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className={itemClass(isUsers)}
        >
          <Users className="h-4 w-4" />
          Users
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/layanan")}
          className={itemClass(isTesting)}
        >
          < FaServicestack className="h-4 w-4" />
          Layanan
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/target")}
          className={itemClass(isTarget)}
        >
          <FaArrowTrendUp className="h-4 w-4" />
          Revenue Target
        </button>
      </nav>

      <div className="flex-1" />

      {/* Settings */}
      <div className="pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push("/admin/settings")}
          className={itemClass(isSettings)}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

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
            <p className="text-xs text-gray-500 truncate">
              {roleLabel(me.role)}
            </p>
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
