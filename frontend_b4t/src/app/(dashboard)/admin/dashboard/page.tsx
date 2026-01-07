"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Users, Clock } from "lucide-react";
import { ServiceCostRecap } from "@/components/dashboard/Servicecost";
import { TopServicesChart } from "@/components/dashboard/toplayanan";


type AdminDashboardStatsResponse = {
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

export default function AdminDashboardPage() {
  const [search, setSearch] = useState("");
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statsValue, setStatsValue] = useState<AdminDashboardStatsResponse>({
    total_user: 0,
    pending_approval: 0,
  });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const mapApproved = (u: BackendUser) => {
    // Prioritas 1: flag is_approved
    if (u.is_approved === true || u.is_approved === 1) return true;
    if (u.is_approved === false || u.is_approved === 0) return false;

    // Prioritas 2: status string
    const s = String(u.status ?? "").toLowerCase();
    if (s === "approved" || s === "approve") return true;
    if (s === "pending") return false;

    // Default: anggap pending kalau backend belum punya field
    return false;
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const token = getToken();

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/admin/dashboard/stats`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        setStatsValue({
          total_user: Number(res.data?.total_user ?? 0),
          pending_approval: Number(res.data?.pending_approval ?? 0),
        });
      } catch (e: any) {
        // ✅ Opsi B fallback: hitung dari list users admin
        try {
          const res2 = await axios.get(`${API_BASE_URL}/api/admin/users`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });

          const raw: BackendUser[] = Array.isArray(res2.data)
            ? res2.data
            : Array.isArray(res2.data?.data)
            ? res2.data.data
            : [];
          const onlyUsers = raw.filter(
            (u) => String(u.role ?? "").toLowerCase() === "user" || !u.role
          );

          const total_user = onlyUsers.length;
          const pending_approval = onlyUsers.filter((u) => !mapApproved(u))
            .length;

          setStatsValue({ total_user, pending_approval });
        } catch (e2: any) {
          const msg =
            e2?.response?.data?.message ||
            e2?.message ||
            "Gagal mengambil data dashboard admin dari backend.";
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE_URL]);

  const cards = useMemo(
    () => [
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

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      <div className="flex items-center justify-between gap-4 px-6 pt-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        <div className="w-full max-w-[280px]">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
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
      </div>

      {/* Divider tipis */}
      <div className="mx-6 mt-4 border-b border-gray-200/60" />

      {/* Error box */}
      {error && (
        <div className="px-6 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Card */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[520px]">
          {cards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="relative rounded-2xl bg-blue-600 text-white p-5 shadow-sm"
              >
                {/* icon bubble */}
                <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>

                <div className="pt-12">
                  <p className="text-sm text-white/90">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold leading-none">
                    {loading ? "..." : item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ServiceCostRecap month={month} year={year} onMonthChange={setMonth}onYearChange={setYear} />
          <TopServicesChart month={month} year={year} />
        </div>

        {/* Helper kecil kalau token belum ada */}
        {!loading && !error && !getToken() && (
          <p className="mt-4 text-sm text-gray-500">
            Token belum ditemukan. Pastikan kamu sudah login dan token tersimpan
            di localStorage dengan key{" "}
            <span className="font-medium">"token"</span>.
          </p>
        )}
      </div>

      <div className="h-12" />
    </div>
  );
}
