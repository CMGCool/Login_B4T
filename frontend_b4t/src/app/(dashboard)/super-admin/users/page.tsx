"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  approveUser,
  createUser,
  getSuperAdminUsers,
  updateUser,
  deleteUser,
  type User,
} from "@/lib/user";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, Check, Eye, EyeOff, X } from "lucide-react";

function approved(v: any) {
  return v === true || v === 1 || v === "1";
}

type Notice = { type: "success" | "error"; message: string } | null;

export default function SuperAdminUsersPage() {
  const router = useRouter();

  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [notice, setNotice] = useState<Notice>(null);
  const [q, setQ] = useState("");

  // modal add user
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  // modal edit user
  const [openEdit, setOpenEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  // ✅ password edit dibuat kosong (optional)
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  // modal delete user
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);

  // modal approve user
  const [openApprove, setOpenApprove] = useState(false);
  const [approveSaving, setApproveSaving] = useState(false);
  const [approving, setApproving] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (u) =>
        String(u.name ?? "").toLowerCase().includes(s) ||
        String(u.username ?? "").toLowerCase().includes(s) ||
        String(u.email ?? "").toLowerCase().includes(s)
    );
  }, [items, q]);

  function showNotice(n: Notice) {
    setNotice(n);
    if (!n) return;
    window.setTimeout(() => setNotice(null), 3000);
  }

  function getApiErrorMessage(e: any) {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Terjadi kesalahan"
    );
  }

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await getSuperAdminUsers();
      setItems(
        (Array.isArray(data) ? data : []).filter(
          (u: any) => String(u?.role ?? "").toLowerCase() === "user"
        )
      );
    } catch (e: any) {
      setErr(getApiErrorMessage(e));
      if (e?.response?.status === 401) router.replace("/auth/Signin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onApprove(id: number) {
    try {
      await approveUser(id);
      await load();
      showNotice({ type: "success", message: "User berhasil di-approve." });
    } catch (e: any) {
      showNotice({ type: "error", message: getApiErrorMessage(e) });
    }
  }

  async function onCreate() {
    try {
      setSaving(true);

      if (!form.name.trim() || !form.username.trim() || !form.password) {
        showNotice({
          type: "error",
          message: "Name, Username, dan Password wajib diisi.",
        });
        return;
      }

      await createUser(
        {
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim() || undefined,
          password: form.password,
        },
        "super_admin"
      );

      setOpenAdd(false);
      setShowPassword(false);
      setForm({ name: "", username: "", email: "", password: "" });

      await load();
      showNotice({ type: "success", message: "User berhasil dibuat." });
    } catch (e: any) {
      showNotice({ type: "error", message: getApiErrorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(u: User) {
    setEditing(u);
    setShowEditPassword(false);
    setOpenEdit(true);
  }

  // auto isi data saat modal edit dibuka
  useEffect(() => {
    if (!openEdit || !editing) return;
    setEditForm({
      name: String(editing.name ?? ""),
      username: String(editing.username ?? ""),
      email: String(editing.email ?? ""),
      password: "", // ✅ kosongkan (optional)
    });
  }, [openEdit, editing]);

  async function onUpdate() {
    if (!editing) return;

    if (!editForm.name.trim() || !editForm.username.trim()) {
      showNotice({ type: "error", message: "Name dan Username wajib diisi." });
      return;
    }

    try {
      setEditSaving(true);

      const payload: any = {
        name: editForm.name.trim(),
        username: editForm.username.trim(),
        email: editForm.email?.trim() || undefined,
      };

      // ✅ kirim password hanya jika diisi (optional)
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      await updateUser(editing.id, payload);
      await load();

      setOpenEdit(false);
      setEditing(null);

      showNotice({ type: "success", message: "User berhasil diperbarui." });
    } catch (e: any) {
      showNotice({ type: "error", message: getApiErrorMessage(e) });
      if (e?.response?.status === 401) router.replace("/auth/Signin");
    } finally {
      setEditSaving(false);
    }
  }

  function openDeleteModal(u: User) {
    setDeleting(u);
    setOpenDelete(true);
  }

  async function onDelete() {
    if (!deleting) return;

    try {
      setDeleteSaving(true);
      await deleteUser(deleting.id);
      await load();

      setOpenDelete(false);
      setDeleting(null);

      showNotice({ type: "success", message: "User berhasil dihapus." });
    } catch (e: any) {
      showNotice({ type: "error", message: getApiErrorMessage(e) });
      if (e?.response?.status === 401) router.replace("/auth/Signin");
    } finally {
      setDeleteSaving(false);
    }
  }

  function openApproveModal(u: User) {
    setApproving(u);
    setOpenApprove(true);
  }

  async function onApproveConfirm() {
    if (!approving) return;
    try {
      setApproveSaving(true);
      await onApprove(approving.id);
      setOpenApprove(false);
      setApproving(null);
    } finally {
      setApproveSaving(false);
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* ✅ TOAST / POPUP (gaya sama seperti Admin) */}
      {notice && (
        <div className="fixed top-4 right-4 z-[9999] space-y-2">
          <div
            className={`w-[320px] rounded-xl border px-4 py-3 shadow-lg bg-white ${
              notice.type === "success" ? "border-green-200" : "border-red-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    notice.type === "success" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    notice.type === "success" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {notice.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNotice(null)}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-8 pt-7">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>

        <div className="w-full max-w-[320px] relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="pl-9 h-10 bg-white"
          />
        </div>
      </div>

      <div className="mx-8 mt-5 border-b border-gray-200/60" />

      {/* error */}
      {err && (
        <div className="px-8 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        </div>
      )}

      {/* Card table */}
      <div className="px-8 pt-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm font-semibold text-gray-900">List User</div>

            <Button
              type="button"
              onClick={() => setOpenAdd(true)}
              className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              + Add User
            </Button>
          </div>

          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-3 pr-3">Id</th>
                    <th className="py-3 pr-3">Nama</th>
                    <th className="py-3 pr-3">Username</th>
                    <th className="py-3 pr-3">Email</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Data not found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const isOk = approved((u as any).is_approved);
                      return (
                        <tr key={u.id} className="border-b last:border-b-0">
                          <td className="py-3 pr-3">{`RQ${String(u.id).padStart(
                            3,
                            "0"
                          )}`}</td>
                          <td className="py-3 pr-3">{u.name}</td>
                          <td className="py-3 pr-3">{u.username || "-"}</td>
                          <td className="py-3 pr-3">{u.email || "-"}</td>

                          <td className="py-3 pr-3">
                            {isOk ? (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                Approve
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3 pr-3">
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
                                disabled={isOk}
                                className={[
                                  "h-7 w-7 rounded-md flex items-center justify-center",
                                  isOk
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white",
                                ].join(" ")}
                                title={isOk ? "Sudah approved" : "Approve"}
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
          </div>
        </div>
      </div>

      {/* Modal Add User */}
      {openAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[560px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add user</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the details below to create a new user account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenAdd(false);
                  setShowPassword(false);
                  setForm({ name: "", username: "", email: "", password: "" });
                }}
                className="rounded-md p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-4 space-y-4">
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
                  placeholder="Name"
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
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Email (optional)
                </label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  className="h-10 mt-2"
                  placeholder="Email"
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
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-[140px]"
                  onClick={() => {
                    setOpenAdd(false);
                    setShowPassword(false);
                    setForm({ name: "", username: "", email: "", password: "" });
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="h-10 w-[140px] bg-blue-600 hover:bg-blue-700"
                  onClick={onCreate}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[560px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit user</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update the user's information below
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenEdit(false);
                  setEditing(null);
                }}
                className="rounded-md p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-4 space-y-4">
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
                  placeholder="Name"
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
                  placeholder="Username"
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
                  placeholder="Email"
                  type="email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Password <span className="text-gray-400">(optional)</span>
                </label>

                <div className="relative mt-2">
                  <Input
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, password: e.target.value }))
                    }
                    className="h-10 pr-10"
                    placeholder="Isi jika ingin ganti password"
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

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-[140px]"
                  onClick={() => {
                    setOpenEdit(false);
                    setEditing(null);
                  }}
                  disabled={editSaving}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="h-10 w-[140px] bg-blue-600 hover:bg-blue-700"
                  onClick={onUpdate}
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete User */}
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
                    Are you sure you want to delete this user? This action
                    cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenDelete(false);
                  setDeleting(null);
                }}
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
                type="button"
                variant="outline"
                className="h-10 w-[140px]"
                onClick={() => {
                  setOpenDelete(false);
                  setDeleting(null);
                }}
                disabled={deleteSaving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="h-10 w-[140px] bg-red-600 hover:bg-red-700"
                onClick={onDelete}
                disabled={deleteSaving}
              >
                {deleteSaving ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Approve User */}
      {openApprove && approving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-6 pt-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Approve User
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Are you sure you want to approve this user? They will be
                    granted access to the system.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpenApprove(false);
                  setApproving(null);
                }}
                className="rounded-md p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pt-4">
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">
                  {approving.name}
                </div>
                <div className="text-sm text-gray-500">
                  {approving.email || "-"}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-[140px]"
                onClick={() => {
                  setOpenApprove(false);
                  setApproving(null);
                }}
                disabled={approveSaving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="h-10 w-[140px] bg-green-600 hover:bg-green-700"
                onClick={onApproveConfirm}
                disabled={approveSaving}
              >
                {approveSaving ? "Approving..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
