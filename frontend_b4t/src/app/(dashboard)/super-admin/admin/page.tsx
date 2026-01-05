"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, Plus, Eye, EyeOff, X } from "lucide-react";

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

  // ✅ Tambahan: format ID seperti RQ001 (sesuai gambar)
  const formatId = (id: number | string) => {
    const n = Number(id);
    if (Number.isFinite(n)) return `RQ${String(n).padStart(3, "0")}`;
    return String(id);
  };

  // ✅ Tambahan: handler dummy (tidak mengubah apa-apa)
  function onEditAdmin(u: UiAdmin) {
    // ✅ tambahan: buka modal edit (bukan alert lagi)
    openEditModal(u);
  }
  function onDeleteAdmin(u: UiAdmin) {
    // ✅ tambahan: buka modal delete (bukan alert)
    openDeleteModal(u);
  }

  /* =========================================================
     ✅ MODAL ADD ADMIN (sesuai gambar)
     ========================================================= */
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  function onAddAdmin() {
    setOpenAdd(true);
  }

  function closeAddModal() {
    setOpenAdd(false);
    setSaving(false);
    setShowPassword(false);
    setForm({ name: "", username: "", email: "", password: "" });
  }

  // ✅ tambahan helper error message (biar rapi)
  function getApiErrorMessage(e: any) {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Terjadi kesalahan"
    );
  }

  // ✅ tambahan: call backend create admin (TANPA ubah backend)
  async function createAdmin(payload: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    /**
     * Endpoint ini mengikuti pola:
     * SuperAdminController@createAdmin
     * Biasanya: POST /api/super-admin/create-admin
     *
     * Kalau route kamu beda, ganti string endpoint di bawah ini saja.
     */
    const res = await axiosAuth.post("/api/super-admin/create-admin", payload);
    return res.data;
  }

  async function onConfirmAddAdmin() {
    // ✅ sekarang benar-benar CALL backend
    if (
      !form.name.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      alert("Name, Username, Email, dan Password wajib diisi.");
      return;
    }

    // kalau token tidak ada, stop (biar tidak error aneh)
    if (!token) {
      alert(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setSaving(true);

      await createAdmin({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      closeAddModal();
      await fetchAdmins(); // refresh list admin setelah berhasil
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     ✅ MODAL EDIT ADMIN (sesuai gambar)
     ========================================================= */
  const MASK_PASSWORD = "••••••••";

  const [openEdit, setOpenEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editing, setEditing] = useState<UiAdmin | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    password: MASK_PASSWORD,
  });

  function openEditModal(u: UiAdmin) {
    setEditing(u);
    setPasswordChanged(false);
    setShowEditPassword(false);
    setOpenEdit(true);
  }

  function closeEditModal() {
    setOpenEdit(false);
    setEditSaving(false);
    setShowEditPassword(false);
    setEditing(null);
    setPasswordChanged(false);
    setEditForm({ name: "", username: "", email: "", password: MASK_PASSWORD });
  }

  // auto isi data saat modal edit dibuka
  useEffect(() => {
    if (!openEdit || !editing) return;

    setEditForm({
      name: String(editing.name ?? ""),
      username: String(editing.username ?? ""),
      email: String(editing.email ?? ""),
      password: MASK_PASSWORD,
    });
  }, [openEdit, editing]);

  // ✅ tambahan: call backend update admin (pakai endpoint existing /api/users/{id})
  async function updateAdmin(userId: number | string, payload: any) {
    const res = await axiosAuth.put(`/api/users/${userId}`, payload);
    return res.data;
  }

  async function onConfirmEditAdmin() {
    if (!editing) return;

    if (
      !editForm.name.trim() ||
      !editForm.username.trim() ||
      !editForm.email.trim()
    ) {
      alert("Name, Username, dan Email wajib diisi.");
      return;
    }

    if (!token) {
      alert(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setEditSaving(true);

      const payload: any = {
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        email: editForm.email.trim(),
      };

      // password hanya dikirim kalau user benar-benar mengganti
      if (
        passwordChanged &&
        editForm.password.trim() &&
        editForm.password !== MASK_PASSWORD
      ) {
        payload.password = editForm.password.trim();
      }

      await updateAdmin(editing.id, payload);

      closeEditModal();
      await fetchAdmins(); // refresh list setelah update
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    } finally {
      setEditSaving(false);
    }
  }

  /* =========================================================
     ✅ MODAL DELETE ADMIN (sesuai gambar) - NEW (tambahan)
     ========================================================= */
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleting, setDeleting] = useState<UiAdmin | null>(null);

  function openDeleteModal(u: UiAdmin) {
    setDeleting(u);
    setOpenDelete(true);
  }

  function closeDeleteModal() {
    setOpenDelete(false);
    setDeleteSaving(false);
    setDeleting(null);
  }

  // ✅ call backend delete admin (endpoint existing /api/users/{id})
  async function deleteAdmin(userId: number | string) {
    const res = await axiosAuth.delete(`/api/users/${userId}`);
    return res.data;
  }

  async function onConfirmDeleteAdmin() {
    if (!deleting) return;

    if (!token) {
      alert(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setDeleteSaving(true);

      await deleteAdmin(deleting.id);

      closeDeleteModal();
      await fetchAdmins(); // refresh list setelah delete
    } catch (e: any) {
      alert(getApiErrorMessage(e));
    } finally {
      setDeleteSaving(false);
    }
  }

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
        <div className="w-full max-w-[980px] rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* ✅ Header card + tombol Add Admin */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-base font-semibold text-gray-900">List Admin</h2>

            <Button
              onClick={onAddAdmin}
              className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
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
                    <th className="py-3 px-3 font-medium text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-800">
                  {loading ? (
                    <tr>
                      <td className="py-6 px-3 text-gray-500" colSpan={5}>
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="py-6 px-3 text-gray-500" colSpan={5}>
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr
                        key={String(u.id)}
                        className="border-t border-gray-100"
                      >
                        <td className="py-3 px-3">{formatId(u.id)}</td>
                        <td className="py-3 px-3">{u.name}</td>
                        <td className="py-3 px-3">{u.username}</td>
                        <td className="py-3 px-3">{u.email}</td>

                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEditAdmin(u)}
                              className="h-7 w-7 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteAdmin(u)}
                              className="h-7 w-7 rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

      {/* =========================================================
          ✅ MODAL ADD ADMIN (sesuai gambar)
         ========================================================= */}
      {openAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[720px] rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-7">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add admin</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the details below to create a new admin account.
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

            {/* Form */}
            <div className="px-8 pb-6 pt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  className="h-10 mt-2"
                  placeholder="e.g. Rahma Alia"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Username <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, username: e.target.value }))
                  }
                  className="h-10 mt-2"
                  placeholder="e.g. Rahma Alia"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className="h-10 mt-2"
                  placeholder="e.g. rahma@mail.com"
                  type="email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <Input
                    value={form.password}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, password: e.target.value }))
                    }
                    className="h-10 pr-10"
                    placeholder=""
                    type={showPassword ? "text" : "password"}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="pt-3 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="h-10 w-[260px]"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  className="h-10 w-[260px] bg-blue-600 hover:bg-blue-700"
                  onClick={onConfirmAddAdmin}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          ✅ MODAL EDIT ADMIN (sesuai gambar)
         ========================================================= */}
      {openEdit && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[720px] rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-7">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit admin</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update the admin account details below
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

            {/* Form */}
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
                  placeholder="e.g. Rahma Alia"
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
                  placeholder="e.g. Rahma Alia"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className="h-10 mt-2"
                  placeholder="e.g. rahma@mail.com"
                  type="email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Password <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-2">
                  <Input
                    value={editForm.password}
                    onChange={(e) => {
                      setPasswordChanged(true);
                      setEditForm((s) => ({ ...s, password: e.target.value }));
                    }}
                    className="h-10 pr-10"
                    placeholder=""
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
              </div>

              {/* Footer buttons */}
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
                  onClick={onConfirmEditAdmin}
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
          ✅ MODAL DELETE ADMIN (sesuai gambar) - NEW
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
                    Delete admin
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Are you sure you want to delete this admin? This action
                    cannot be undone.
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
                onClick={onConfirmDeleteAdmin}
                disabled={deleteSaving}
              >
                {deleteSaving ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
