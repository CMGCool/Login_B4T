"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function AdminUsersPage() {
  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UiUser[]>([]);

  // ===== Approve Modal state (sudah ada) =====
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

  function getApiErrorMessage(e: any) {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Terjadi kesalahan"
    );
  }

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
      // ✅ ADMIN endpoint
      const res = await axiosAuth.get("/api/admin/users");

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
      const status = e?.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        router.replace("/auth/Signin");
        return;
      }

      setError(
        getApiErrorMessage(e) || "Gagal mengambil data users dari backend."
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
      // ✅ approve endpoint (sesuai routes/api.php)
      await axiosAuth.post(`/api/approve-user/${selectedUser.id}`);

      // Update UI langsung
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "Approve" } : u
        )
      );

      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (e: any) {
      setError(getApiErrorMessage(e) || "Gagal approve user. Coba lagi.");
    } finally {
      setConfirmLoading(false);
    }
  };

  /* =========================================================
     ✅ ADD USER (via backend /api/register supaya PENDING)
     ========================================================= */
  const [openAdd, setOpenAdd] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  function openAddModal() {
    setOpenAdd(true);
    setError(null);
  }

  function closeAddModal() {
    if (savingAdd) return;
    setOpenAdd(false);
    setShowAddPassword(false);
    setSavingAdd(false);
    setAddForm({ name: "", username: "", email: "", password: "" });
  }

  async function createUserPending(payload: {
    name: string;
    username: string;
    email?: string;
    password: string;
  }) {
    // ✅ AuthController@register -> is_approved = false (Pending)
    const res = await axiosAuth.post("/api/register", payload);
    return res.data;
  }

  async function onConfirmAddUser() {
    if (!addForm.name.trim() || !addForm.username.trim() || !addForm.password) {
      setError("Name, Username, dan Password wajib diisi.");
      return;
    }

    try {
      setSavingAdd(true);
      setError(null);

      await createUserPending({
        name: addForm.name.trim(),
        username: addForm.username.trim(),
        email: addForm.email.trim() || undefined,
        password: addForm.password,
      });

      closeAddModal();
      await fetchUsers(); // refresh list
    } catch (e: any) {
      setError(getApiErrorMessage(e));
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
  }

  function closeEditModal() {
    if (editSaving) return;
    setOpenEdit(false);
    setEditing(null);
    setPasswordChanged(false);
    setShowEditPassword(false);
    setEditSaving(false);
    setEditForm({ name: "", username: "", email: "", password: MASK_PASSWORD });
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
    const res = await axiosAuth.put(`/api/users/${userId}`, payload);
    return res.data;
  }

  async function onConfirmEditUser() {
    if (!editing) return;

    if (!editForm.name.trim() || !editForm.username.trim()) {
      setError("Name dan Username wajib diisi.");
      return;
    }

    if (!token) {
      setError(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setEditSaving(true);
      setError(null);

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

      closeEditModal();
      await fetchUsers();
    } catch (e: any) {
      setError(getApiErrorMessage(e));
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
    const res = await axiosAuth.delete(`/api/users/${userId}`);
    return res.data;
  }

  async function onConfirmDeleteUser() {
    if (!deleting) return;

    if (!token) {
      setError(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setDeleteSaving(true);
      setError(null);

      await deleteUser(deleting.id);

      closeDeleteModal();
      await fetchUsers();
    } catch (e: any) {
      setError(getApiErrorMessage(e));
    } finally {
      setDeleteSaving(false);
    }
  }

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
        {/* ✅ dibuat lebih lebar + hilang tombol refresh */}
        <div className="w-full max-w-[1200px] rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">List User</h2>

            <div className="flex items-center gap-2">
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
                    <th className="py-3 px-3 font-medium">Id</th>
                    <th className="py-3 px-3 font-medium">Nama</th>
                    <th className="py-3 px-3 font-medium">Username</th>
                    {/* ✅ kolom email dibuat lebih lebar */}
                    <th className="py-3 px-3 font-medium min-w-[260px]">
                      Email
                    </th>
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
                    filtered.map((u) => {
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

                          {/* ✅ Actions: Edit / Delete / Approve */}
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

      {/* =========================================================
          ✅ MODAL ADD USER (sesuai gambar Add admin yg kamu pakai)
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
                  className="h-10 mt-2"
                  placeholder="e.g. Cipta Azzahra"
                />
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
                  className="h-10 mt-2"
                  placeholder="e.g. ciptaazzahra"
                />
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
                  className="h-10 mt-2"
                  placeholder="e.g. ciptaazzahra@gmail.com"
                  type="email"
                />
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
                    className="h-10 pr-10"
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
          ✅ MODAL EDIT USER (mirip edit admin)
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
                  className="h-10 mt-2"
                />
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
                  className="h-10 mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className="h-10 mt-2"
                  type="email"
                />
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
                    className="h-10 pr-10"
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
          ✅ POPUP DELETE USER (sesuai gambar delete admin)
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
                <div className="text-sm text-gray-500">{deleting.email || "-"}</div>
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
