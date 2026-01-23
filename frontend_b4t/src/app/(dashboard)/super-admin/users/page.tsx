"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Check,
  X,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  SlidersHorizontal,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IoFilter } from "react-icons/io5";
import { parseApiError, getFieldError } from "@/lib/error-handler";

type BackendUser = {
  id: number | string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  is_approved?: boolean | number | null;
};

type UiUser = {
  id: number | string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: "Approve" | "Pending";
};

function approved(v: any) {
  return v === true || v === 1 || v === "1";
}

export default function SuperAdminUsersPage() {
  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "approve" | "pending">(
    "all"
  );
  const [openFilter, setOpenFilter] = useState(false);

  // tetap dipertahankan (biar tidak merusak struktur), tapi notifikasi utama pakai toast
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UiUser[]>([]);

  // ===== Approve Modal state (sudah ada) =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UiUser | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  /* =======================
     ✅ TOAST (SINGLE, dengan type)
  ======================= */
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const toastTimer = useRef<number | null>(null);

  function getApiErrorMessage(e: any) {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Terjadi kesalahan"
    );
  }

  function showToastSuccess(message: string) {
    setToastMsg(message);
    setToastType("success");
    setToastOpen(true);

    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToastOpen(false);
    }, 3500);
  }

  function showToastError(message: string) {
    setToastMsg(message);
    setToastType("error");
    setToastOpen(true);

    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToastOpen(false);
    }, 3500);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const mapStatus = (u: BackendUser): "Approve" | "Pending" => {
    if (u.is_approved === true || u.is_approved === 1) return "Approve";
    if (u.is_approved === false || u.is_approved === 0) return "Pending";

    const s = String(u.status ?? "").toLowerCase();
    if (s === "approved" || s === "approve") return "Approve";
    if (s === "pending") return "Pending";

    return "Pending";
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/super-admin/users");

      const raw: BackendUser[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const onlyUsers = raw.filter((u) => {
        const r = String(u.role ?? "").toLowerCase();
        return r === "user" || !u.role;
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
      const msg =
      getApiErrorMessage(e) || "Gagal mengambil data users dari backend.";
      setError(msg);
      showToastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [API_BASE_URL]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filteredByStatus =
      statusFilter === "all"
        ? users
        : users.filter((u) =>
            statusFilter === "approve" ? u.status === "Approve" : u.status === "Pending"
          );

    if (!q) return filteredByStatus;

    return filteredByStatus.filter((u) => {
      return (
        String(u.id).toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q)
      );
    });
  }, [search, users, statusFilter]);

  const [sortKey, setSortKey] = useState<
    "id" | "name" | "username" | "email" | "status" | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];

    copy.sort((a, b) => {
      if (sortKey === "id") {
        const left = Number(a.id);
        const right = Number(b.id);
        if (Number.isFinite(left) && Number.isFinite(right)) {
          return sortDir === "asc" ? left - right : right - left;
        }
        const l = String(a.id).toLowerCase();
        const r = String(b.id).toLowerCase();
        return sortDir === "asc" ? l.localeCompare(r) : r.localeCompare(l);
      }

      const left = String(a[sortKey]).toLowerCase();
      const right = String(b[sortKey]).toLowerCase();
      return sortDir === "asc"
        ? left.localeCompare(right)
        : right.localeCompare(left);
    });

    return copy;
  }, [filtered, sortKey, sortDir]);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, sortKey, sortDir, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    pages.add(page);
    pages.add(page - 1);
    pages.add(page + 1);

    const sorted = Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const result: Array<number | "dots"> = [];
    sorted.forEach((p, idx) => {
      if (idx > 0 && p - sorted[idx - 1] > 1) result.push("dots");
      result.push(p);
    });

    return result;
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const pageFrom = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageTo = Math.min(page * pageSize, totalItems);

  const toggleSort = (
    key: "id" | "name" | "username" | "email" | "status"
  ) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const renderSortIcon = (
    key: "id" | "name" | "username" | "email" | "status"
  ) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

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

  const formatId = (id: number | string) => {
    const n = Number(id);
    if (Number.isFinite(n)) return `RQ${String(n).padStart(3, "0")}`;
    return String(id);
  };

  // ====== APPROVE MODAL handlers (sudah ada) ======
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
      await api.post(`/approve-user/${selectedUser.id}`);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "Approve" } : u
        )
      );

      showToastSuccess("User berhasil diapprove.");

      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (e: any) {
      const msg = getApiErrorMessage(e) || "Gagal approve user. Coba lagi.";
      setError(msg);
      showToastError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  /* =========================================================
     ADD USER (via backend /api/register)
     ========================================================= */
  const [openAdd, setOpenAdd] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addFieldErrors, setAddFieldErrors] = useState<Record<string, string>>({});
  const [addForm, setAddForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  function openAddModal() {
    setOpenAdd(true);
    setError(null);
    setAddFieldErrors({});
  }

  function closeAddModal() {
    if (savingAdd) return;
    setOpenAdd(false);
    setShowAddPassword(false);
    setSavingAdd(false);
    setAddForm({ name: "", username: "", email: "", password: "" });
    setAddFieldErrors({});
  }

  async function createUserPending(payload: {
    name: string;
    username: string;
    email?: string;
    password: string;
  }) {
    const res = await api.post("/register", payload);
    return res.data;
  }

  async function approveUserById(userId: number | string) {
    await api.post(`/approve-user/${userId}`);
  }

  async function createUserApproved(payload: {
    name: string;
    username: string;
    email?: string;
    password: string;
  }) {
    const data = await createUserPending(payload);

    const createdId = (data as any)?.id ?? (data as any)?.data?.id ?? null;

    if (createdId != null) {
      await approveUserById(createdId);
      return data;
    }

    const res = await api.get("/super-admin/users");

    const raw: BackendUser[] = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

    const match = raw.find((u) => {
      const un = String(u.username ?? "").toLowerCase();
      const em = String(u.email ?? "").toLowerCase();
      return (
        un === payload.username.toLowerCase() ||
        (!!payload.email && em === payload.email.toLowerCase())
      );
    });

    if (match?.id != null) {
      await approveUserById(match.id);
    }

    return data;
  }

  async function onConfirmAddUser() {
    if (!addForm.name.trim() || !addForm.username.trim() || !addForm.password) {
      showToastError("Name, Username, dan Password wajib diisi.");
      return;
    }

    try {
      setSavingAdd(true);
      setError(null);
      setAddFieldErrors({});

      await createUserApproved({
        name: addForm.name.trim(),
        username: addForm.username.trim(),
        email: addForm.email.trim() || undefined,
        password: addForm.password,
      });

      showToastSuccess("User berhasil ditambahkan.");

      closeAddModal();
      await fetchUsers();
    } catch (e: any) {
      const { mainMessage, fieldErrors } = parseApiError(e);
      setError(mainMessage);
      setAddFieldErrors(fieldErrors);
      showToastError(mainMessage);
    } finally {
      setSavingAdd(false);
    }
  }

  /* =========================================================
     ✅ EDIT USER (backend: PUT /api/users/{id})
     ========================================================= */
  const MASK_PASSWORD = "••••••••";

  const [openEdit, setOpenEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editing, setEditing] = useState<UiUser | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    password: MASK_PASSWORD,
  });

  function openEditModal(u: UiUser) {
    setEditing(u);
    setPasswordChanged(false);
    setShowEditPassword(false);
    setOpenEdit(true);
    setError(null);
    setEditFieldErrors({});
  }

  function closeEditModal() {
    if (editSaving) return;
    setOpenEdit(false);
    setEditing(null);
    setPasswordChanged(false);
    setShowEditPassword(false);
    setEditSaving(false);
    setEditForm({ name: "", username: "", email: "", password: MASK_PASSWORD });
    setEditFieldErrors({});
  }

  useEffect(() => {
    if (!openEdit || !editing) return;
    setEditForm({
      name: String(editing.name ?? ""),
      username: String(editing.username ?? ""),
      email: String(editing.email ?? ""),
      password: MASK_PASSWORD,
    });
  }, [openEdit, editing]);

  async function updateUser(userId: number | string, payload: any) {
    const res = await api.put(`/users/${userId}`, payload);
    return res.data;
  }

  async function onConfirmEditUser() {
    if (!editing) return;

    if (!editForm.name.trim() || !editForm.username.trim()) {
      showToastError("Name dan Username wajib diisi.");
      return;
    }

    try {
      setEditSaving(true);
      setError(null);
      setEditFieldErrors({});

      const payload: any = {
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        email: editForm.email.trim() || undefined,
      };

      if (
        passwordChanged &&
        editForm.password.trim() &&
        editForm.password !== MASK_PASSWORD
      ) {
        payload.password = editForm.password.trim();
      }

      await updateUser(editing.id, payload);

      showToastSuccess("User berhasil diperbarui.");

      closeEditModal();
      await fetchUsers();
    } catch (e: any) {
      const { mainMessage, fieldErrors } = parseApiError(e);
      setError(mainMessage);
      setEditFieldErrors(fieldErrors);
      showToastError(mainMessage);
    } finally {
      setEditSaving(false);
    }
  }

  /* =========================================================
     ✅ DELETE USER (backend: DELETE /api/users/{id})
     ========================================================= */
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleting, setDeleting] = useState<UiUser | null>(null);

  function openDeleteModal(u: UiUser) {
    setDeleting(u);
    setOpenDelete(true);
    setError(null);
  }

  function closeDeleteModal() {
    if (deleteSaving) return;
    setOpenDelete(false);
    setDeleting(null);
    setDeleteSaving(false);
  }

  async function deleteUser(userId: number | string) {
    const res = await api.delete(`/users/${userId}`);
    return res.data;
  }

  async function onConfirmDeleteUser() {
    if (!deleting) return;

    try {
      setDeleteSaving(true);
      setError(null);

      await deleteUser(deleting.id);

      showToastSuccess("User berhasil dihapus.");

      closeDeleteModal();
      await fetchUsers();
    } catch (e: any) {
      const { mainMessage } = parseApiError(e);
      setError(mainMessage);
      showToastError(mainMessage);
    } finally {
      setDeleteSaving(false);
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* TOAST (kanan atas) */}
      {toastOpen && (
        <div className="fixed top-6 right-6 z-[9999]">
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-md min-w-[320px] max-w-[520px] ${
            toastType === "success"
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}>
            <span className={`h-2.5 w-2.5 rounded-full ${
              toastType === "success" ? "bg-green-500" : "bg-red-500"
            }`} />
            <p className={`text-sm font-medium ${
              toastType === "success"
                ? "text-green-800"
                : "text-red-800"
            }`}>{toastMsg}</p>

            <button
              onClick={() => setToastOpen(false)}
              className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                toastType === "success"
                  ? "hover:bg-green-100"
                  : "hover:bg-red-100"
              }`}
              aria-label="Close"
              title="Close"
            >
              <X size={16} className={toastType === "success" ? "text-green-800" : "text-red-800"} />
            </button>
          </div>
        </div>
      )}

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

      <div className="mx-6 mt-4 border-b border-gray-200/60" />

      {/* Card + Table */}
      <div className="px-6 pt-6">
        <div className="w-full max-w-[1200px] rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">List User</h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center mr-2 gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-8 rounded-lg border border-gray-200 bg-white mr-2 px-3 text-sm text-gray-700 outline-none hover:border-gray-300 focus:border-blue-600"
                  aria-label="Rows per page"
                >
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() => setOpenFilter((v) => !v)}
                  >
                    <IoFilter/>Filter
                  </Button>

                  {openFilter && (
                    <div className="absolute right-0 mt-2 w-[200px] rounded-xl border border-gray-200 bg-white p-2 shadow-lg z-20">
                      {[
                        { label: "All Status", value: "all" },
                        { label: "Approve", value: "approve" },
                        { label: "Pending", value: "pending" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt.value as "all" | "approve" | "pending");
                            setOpenFilter(false);
                          }}
                          className={[
                            "w-full rounded-lg px-3 py-2 text-left text-sm",
                            statusFilter === opt.value
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={openAddModal}
                className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          <div className="px-4 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="py-3 px-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort("id")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Id
                        {renderSortIcon("id")}
                      </button>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort("name")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Nama
                        {renderSortIcon("name")}
                      </button>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort("username")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Username
                        {renderSortIcon("username")}
                      </button>
                    </th>
                    <th className="py-3 px-3 font-medium min-w-[260px]">
                      <button
                        type="button"
                        onClick={() => toggleSort("email")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Email
                        {renderSortIcon("email")}
                      </button>
                    </th>
                    <th className="py-3 px-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort("status")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Status
                        {renderSortIcon("status")}
                      </button>
                    </th>
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
                        Data not found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((u) => {
                      const isOk = u.status === "Approve" || approved(u.status);
                      return (
                        <tr
                          key={String(u.id)}
                          className="border-t border-gray-100"
                        >
                          <td className="py-3 px-3">{formatId(u.id)}</td>
                          <td className="py-3 px-3">{u.name}</td>
                          <td className="py-3 px-3">{u.username}</td>
                          <td className="py-3 px-3 min-w-[260px]">{u.email}</td>
                          <td className="py-3 px-3">
                            <StatusBadge status={u.status} />
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                className="h-7 w-7 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                                title="Edit"
                                onClick={() => openEditModal(u)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                className="h-7 w-7 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                                title="Delete"
                                onClick={() => openDeleteModal(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled={u.status === "Approve"}
                                className={[
                                  "h-7 w-7 rounded-md flex items-center justify-center",
                                  u.status === "Approve"
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white",
                                ].join(" ")}
                                title={
                                  u.status === "Approve"
                                    ? "Sudah approve"
                                    : "Approve user"
                                }
                                onClick={() => openApproveModal(u)}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between px-3 text-sm text-gray-500">
              <div>
                Showing {pageFrom} to {pageTo} of {totalItems} entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 rounded-md text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  Previous
                </button>
                {pageItems.map((item, idx) =>
                  item === "dots" ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={[
                        "h-8 min-w-[32px] rounded-md border px-2 text-sm",
                        item === page
                          ? "border-gray-300 text-gray-900 shadow-sm"
                          : "border-transparent text-gray-500 hover:text-gray-900",
                      ].join(" ")}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 rounded-md text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12" />

      {/* =========================================================
          ✅ MODAL ADD USER
         ========================================================= */}
      {openAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[720px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-8 pt-7">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add user</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the details below to create a new user account.
                </p>
              </div>

              <button
                onClick={closeAddModal}
                className="rounded-md p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-8 pb-6 pt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, name: e.target.value }))
                  }
                  className={`h-10 mt-2 ${getFieldError(addFieldErrors, "name") ? "border-red-500" : ""}`}
                  placeholder="e.g. Cipta Azzahra"
                />
                {getFieldError(addFieldErrors, "name") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(addFieldErrors, "name")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Username <span className="text-red-500">*</span>
                </label>
                <Input
                  value={addForm.username}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, username: e.target.value }))
                  }
                  className={`h-10 mt-2 ${getFieldError(addFieldErrors, "username") ? "border-red-500" : ""}`}
                  placeholder="e.g. ciptaazzahra"
                />
                {getFieldError(addFieldErrors, "username") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(addFieldErrors, "username")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Email (optional)
                </label>
                <Input
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className={`h-10 mt-2 ${getFieldError(addFieldErrors, "email") ? "border-red-500" : ""}`}
                  placeholder="e.g. ciptaazzahra@gmail.com"
                  type="email"
                />
                {getFieldError(addFieldErrors, "email") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(addFieldErrors, "email")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <Input
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm((s) => ({ ...s, password: e.target.value }))
                    }
                    className={`h-10 pr-10 ${getFieldError(addFieldErrors, "password") ? "border-red-500" : ""}`}
                    type={showAddPassword ? "text" : "password"}
                  />

                  <button
                    type="button"
                    onClick={() => setShowAddPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-700"
                    aria-label={
                      showAddPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showAddPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {getFieldError(addFieldErrors, "password") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(addFieldErrors, "password")}</p>
                )}
              </div>

              <div className="pt-3 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="h-10 w-[260px]"
                  onClick={closeAddModal}
                  disabled={savingAdd}
                >
                  Cancel
                </Button>

                <Button
                  className="h-10 w-[260px] bg-blue-600 hover:bg-blue-700"
                  onClick={onConfirmAddUser}
                  disabled={savingAdd}
                >
                  {savingAdd ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ✅ MODAL EDIT USER
         ========================================================= */}
      {openEdit && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[720px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-8 pt-7">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit user</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update the user account details below
                </p>
              </div>

              <button
                onClick={closeEditModal}
                className="rounded-md p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-8 pb-6 pt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, name: e.target.value }))
                  }
                  className={`h-10 mt-2 ${getFieldError(editFieldErrors, "name") ? "border-red-500" : ""}`}
                />
                {getFieldError(editFieldErrors, "name") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(editFieldErrors, "name")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Username <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, username: e.target.value }))
                  }
                  className={`h-10 mt-2 ${getFieldError(editFieldErrors, "username") ? "border-red-500" : ""}`}
                />
                {getFieldError(editFieldErrors, "username") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(editFieldErrors, "username")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className={`h-10 mt-2 ${getFieldError(editFieldErrors, "email") ? "border-red-500" : ""}`}
                  type="email"
                />
                {getFieldError(editFieldErrors, "email") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(editFieldErrors, "email")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Password</label>

                <div className="relative mt-2">
                  <Input
                    value={editForm.password}
                    onChange={(e) => {
                      setPasswordChanged(true);
                      setEditForm((s) => ({ ...s, password: e.target.value }));
                    }}
                    className={`h-10 pr-10 ${getFieldError(editFieldErrors, "password") ? "border-red-500" : ""}`}
                    type={showEditPassword ? "text" : "password"}
                  />

                  <button
                    type="button"
                    onClick={() => setShowEditPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-700"
                    aria-label={
                      showEditPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showEditPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {getFieldError(editFieldErrors, "password") && (
                  <p className="text-xs text-red-500 mt-1">{getFieldError(editFieldErrors, "password")}</p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  (Opsional) Ubah password hanya jika kamu mengetik password baru.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="h-10 w-[260px]"
                  onClick={closeEditModal}
                  disabled={editSaving}
                >
                  Cancel
                </Button>

                <Button
                  className="h-10 w-[260px] bg-blue-600 hover:bg-blue-700"
                  onClick={onConfirmEditUser}
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ✅ POPUP DELETE USER
         ========================================================= */}
      {openDelete && deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-6 pt-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete user
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Are you sure you want to delete this user? This action cannot
                    be undone.
                  </p>
                </div>
              </div>

              <button
                onClick={closeDeleteModal}
                className="rounded-md p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pt-4">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">
                  {deleting.name}
                </div>
                <div className="text-sm text-gray-500">
                  {deleting.email || "-"}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                className="h-10 w-[140px]"
                onClick={closeDeleteModal}
                disabled={deleteSaving}
              >
                Cancel
              </Button>

              <Button
                className="h-10 w-[140px] bg-red-600 hover:bg-red-700"
                onClick={onConfirmDeleteUser}
                disabled={deleteSaving}
              >
                {deleteSaving ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL Approve (punyamu) ===== */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeApproveModal}
          />

          <div className="relative z-10 w-[92%] max-w-md rounded-xl bg-white shadow-xl">
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
              <div className="mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <h3 className="text-base font-semibold text-gray-900">Approve User</h3>
              <p className="mt-1 text-sm text-gray-600">
                Are you sure you want to approve this user? They will be granted
                access to the system.
              </p>

              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-gray-600">{selectedUser.email}</div>
              </div>

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
      {/* ===== END MODAL Approve ===== */}
    </div>
  );
}
