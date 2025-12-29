"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type BackendUser = {
  id: number | string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
};

type UiAdmin = {
  id: number | string;
  name: string;
  username: string;
  email: string;
  role: string;
};

export default function SuperAdminAdminPage() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [admins, setAdmins] = useState<UiAdmin[]>([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }, [API_BASE_URL, token]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ambil dari endpoint yang sudah ada
      // GET /api/super-admin/users (lalu filter role=admin)
      const res = await axiosAuth.get("/api/super-admin/users");

      const raw: BackendUser[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      // ✅ FILTER: hanya role admin
      const onlyAdmins = raw.filter(
        (u) => String(u.role ?? "").toLowerCase() === "admin"
      );

      const mapped: UiAdmin[] = onlyAdmins.map((u) => ({
        id: u.id,
        name: u.name ?? "-",
        username: u.username ?? "-",
        email: u.email ?? "-",
        role: String(u.role ?? "admin"),
      }));

      setAdmins(mapped);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Gagal mengambil data admin dari backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;

    return admins.filter((u) => {
      return (
        String(u.id).toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [search, admins]);

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* Header: Admin + Search */}
      <div className="flex items-center justify-between gap-4 px-6 pt-6">
        <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>

        <div className="w-full max-w-[280px] relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-9 h-10 bg-white"
          />
        </div>
      </div>

      {/* Divider tipis */}
      <div className="mx-6 mt-4 border-b border-gray-200/60" />

      {/* Error */}
      {error && (
        <div className="px-6 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Card + Table */}
      <div className="px-6 pt-6">
        <div className="w-full max-w-[900px] rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 pt-5 pb-2">
            <h2 className="text-base font-semibold text-gray-900">List Admin</h2>
          </div>

          <div className="px-4 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="py-3 px-3 font-medium">Id</th>
                    <th className="py-3 px-3 font-medium">Nama</th>
                    <th className="py-3 px-3 font-medium">Username</th>
                    <th className="py-3 px-3 font-medium">Email</th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-800">
                  {loading ? (
                    <tr>
                      <td className="py-6 px-3 text-gray-500" colSpan={4}>
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="py-6 px-3 text-gray-500" colSpan={4}>
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr
                        key={String(u.id)}
                        className="border-t border-gray-100"
                      >
                        <td className="py-3 px-3">{u.id}</td>
                        <td className="py-3 px-3">{u.name}</td>
                        <td className="py-3 px-3">{u.username}</td>
                        <td className="py-3 px-3">{u.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!token && !loading && (
              <p className="mt-4 text-sm text-gray-500">
                Token belum ditemukan. Pastikan kamu sudah login dan token
                tersimpan di localStorage dengan key{" "}
                <span className="font-medium">"token"</span>.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="h-12" />
    </div>
  );
}
