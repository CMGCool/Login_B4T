"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

type BackendUser = {
  id: number | string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null; // kalau backend kirim status
  is_approved?: boolean | number | null; // kalau backend pakai flag
};

type UiUser = {
  id: number | string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: "Approve" | "Pending";
};

export default function AdminUsersPage() {
  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UiUser[]>([]);

  // Popup state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UiUser | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

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

  const mapStatus = (u: BackendUser): "Approve" | "Pending" => {
    // Prioritas 1: is_approved flag kalau ada
    if (u.is_approved === true || u.is_approved === 1) return "Approve";
    if (u.is_approved === false || u.is_approved === 0) return "Pending";

    // Prioritas 2: status string kalau ada
    const s = String(u.status ?? "").toLowerCase();
    if (s === "approved" || s === "approve") return "Approve";
    if (s === "pending") return "Pending";

    // Default jika backend belum punya status
    return "Pending";
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ ADMIN endpoint
      const res = await axiosAuth.get("/api/admin/users");

      const raw: BackendUser[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      // ✅ hanya role user (kalau backend belum filter)
      const onlyUsers = raw.filter((u) => {
        const r = String(u.role ?? "").toLowerCase();
        return r === "user" || !u.role; // aman kalau role tidak dikirim
      });

      const mapped: UiUser[] = onlyUsers.map((u) => ({
        id: u.id,
        name: u.name ?? "-",
        username: u.username ?? "-",
        email: u.email ?? "-",
        role: String(u.role ?? "user"),
        status: mapStatus(u),
      }));

      setUsers(mapped);
    } catch (e: any) {
      const status = e?.response?.status;

      // kalau unauthorized, redirect login
      if (status === 401) {
        localStorage.removeItem("token");
        router.replace("/auth/Signin");
        return;
      }

      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Gagal mengambil data users dari backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return (
        String(u.id).toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
      );
    });
  }, [search, users]);

  const StatusBadge = ({ status }: { status: "Approve" | "Pending" }) => {
    const isApproved = status === "Approve";
    return (
      <span
        className={[
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          isApproved
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-700",
        ].join(" ")}
      >
        {status}
      </span>
    );
  };

  // ====== MODAL handlers ======
  const openApproveModal = (user: UiUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setError(null);
  };

  const closeApproveModal = () => {
    if (confirmLoading) return;
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const confirmApprove = async () => {
    if (!selectedUser) return;

    setConfirmLoading(true);
    setError(null);

    try {
      // ✅ ADMIN approve endpoint
      await axiosAuth.post(`/api/admin/approve-user/${selectedUser.id}`);

      // 🔁 Kalau backend kamu masih pakai endpoint lama (global), pakai ini:
      // await axiosAuth.post(`/api/approve-user/${selectedUser.id}`);

      // Update UI langsung
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "Approve" } : u
        )
      );

      // tutup modal
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Gagal approve user. Coba lagi."
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* Header: Users + Search */}
      <div className="flex items-center justify-between gap-4 px-6 pt-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>

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
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">List User</h2>

            <Button
              type="button"
              variant="outline"
              onClick={fetchUsers}
              disabled={loading}
              className="h-9"
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
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
                    <th className="py-3 px-3 font-medium">Status</th>
                    <th className="py-3 px-3 font-medium text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-800">
                  {loading ? (
                    <tr>
                      <td className="py-6 px-3 text-gray-500" colSpan={6}>
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="py-6 px-3 text-gray-500" colSpan={6}>
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
                        <td className="py-3 px-3">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center">
                            <Button
                              type="button"
                              size="icon"
                              className="h-7 w-7 rounded-md bg-green-500 hover:bg-green-600"
                              disabled={u.status === "Approve"}
                              onClick={() => openApproveModal(u)}
                              title={
                                u.status === "Approve"
                                  ? "Sudah approve"
                                  : "Approve user"
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
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

      {/* ===== MODAL Approve ===== */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeApproveModal}
          />

          {/* modal box */}
          <div className="relative z-10 w-[92%] max-w-md rounded-xl bg-white shadow-xl">
            {/* top right close */}
            <button
              type="button"
              onClick={closeApproveModal}
              className="absolute right-3 top-3 rounded-md p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
              disabled={confirmLoading}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {/* icon */}
              <div className="mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <h3 className="text-base font-semibold text-gray-900">
                Approve User
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Are you sure you want to approve this user? They will be granted
                access to the system.
              </p>

              {/* info user kecil */}
              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-gray-600">{selectedUser.email}</div>
              </div>

              {/* actions */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeApproveModal}
                  disabled={confirmLoading}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={confirmApprove}
                  disabled={confirmLoading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {confirmLoading ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ===== END MODAL ===== */}
    </div>
  );
}
