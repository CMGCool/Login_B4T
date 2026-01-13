"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Users, UserCog, Clock } from "lucide-react";

import { ServiceCostRecap } from "@/components/dashboard/Servicecost";
import { TopServicesChart } from "@/components/dashboard/toplayanan";
import { RevenuePerformanceChart } from "@/components/dashboard/RevenuePerformanceChart";
import { api } from "@/lib/api";

/* =======================
   TYPES
======================= */
type DashboardStatsResponse = {
  total_admin: number;
  total_user: number;
  pending_approval: number;
};

type BackendUser = {
  id: number | string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  is_approved?: boolean | number | null;
};

/* =======================
   COMPONENT
======================= */
export default function SuperAdminDashboardPage() {
  /* ===== UI STATE ===== */
  const [search, setSearch] = useState("");

  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===== DATA STATE ===== */
  const [statsValue, setStatsValue] = useState<DashboardStatsResponse>({
    total_admin: 0,
    total_user: 0,
    pending_approval: 0,
  });

  /* =======================
     HELPERS
  ======================= */
  const mapApproved = (u: BackendUser) => {
    if (u.is_approved === true || u.is_approved === 1) return true;
    if (u.is_approved === false || u.is_approved === 0) return false;

    const s = String(u.status ?? "").toLowerCase();
    if (s === "approved" || s === "approve") return true;
    if (s === "pending") return false;

    return false;
  };

  /* =======================
     FETCH DASHBOARD STATS
  ======================= */
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1️⃣ Stats utama
        const resStats = await api.get<any>("/super-admin/dashboard-stats");
        const statsPayload = resStats.data;

        const statsData = statsPayload?.data ?? statsPayload ?? {};

        const total_admin = Number(statsData?.total_admin ?? 0);
        const total_user = Number(statsData?.total_user ?? 0);

        // 2️⃣ Users untuk pending approval
        const resUsers = await api.get<any>("/super-admin/users");
        const usersPayload = resUsers.data;

        const raw: BackendUser[] = Array.isArray(usersPayload)
          ? usersPayload
          : Array.isArray(usersPayload?.data)
            ? usersPayload.data
            : [];

        const onlyUsers = raw.filter((u) => {
          const r = String(u.role ?? "").toLowerCase();
          return r === "user" || r === "";
        });

        const pending_approval = onlyUsers.filter((u) => !mapApproved(u)).length;

        setStatsValue({
          total_admin,
          total_user,
          pending_approval,
        });
      } catch (e: any) {
        setError(
          e?.message ||
          "Gagal mengambil data dashboard super admin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  /* =======================
     CARDS
  ======================= */
  const stats = useMemo(
    () => [
      {
        key: "total-admin",
        label: "Total Admin",
        value: statsValue.total_admin,
        icon: UserCog,
      },
      {
        key: "total-user",
        label: "Total User",
        value: statsValue.total_user,
        icon: Users,
      },
      {
        key: "pending",
        label: "Pending Approval",
        value: statsValue.pending_approval,
        icon: Clock,
      },
    ],
    [statsValue]
  );

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 px-6 pt-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        <div className="w-full max-w-[280px] relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-9 h-10 bg-white"
          />
        </div>
      </div>

      <div className="mx-6 mt-4 border-b border-gray-200/60" />

      {/* ERROR */}
      {error && (
        <div className="px-6 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[780px]">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="relative rounded-2xl bg-[#4385F6] text-white p-5 shadow-sm"
              >
                <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95">
                  <Icon className="h-5 w-5 text-[#4385F6]" />
                </div>

                <div className="pt-12">
                  <p className="text-sm text-white/90">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? "..." : item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHARTS */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ServiceCostRecap
            month={month}
            year={year}
            onMonthChange={setMonth}
            onYearChange={setYear}
          />
          <TopServicesChart month={month} year={year} />
          <div className="lg:col-span-2">
            <RevenuePerformanceChart />
          </div>
        </div>
      </div>

      <div className="h-12" />
    </div>
  );
}
