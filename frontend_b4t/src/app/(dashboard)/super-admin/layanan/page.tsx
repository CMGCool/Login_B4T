"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, Plus, X } from "lucide-react";

/* =======================
   ✅ BACKEND TYPES (Layanan)
======================= */
type BackendLayanan = {
  id: number | string;
  nama_layanan?: string | null;
  tanggal_layanan?: string | null; // ✅ date (YYYY-MM-DD)
  pembayaran?: number | string | null; // ✅ integer
};

/* =======================
   ✅ UI TYPES
======================= */
type UiLayanan = {
  id: number | string;
  nama_layanan: string;
  tanggal_layanan: string; // YYYY-MM-DD
  pembayaran: number; // integer
};

/* =======================
   ✅ TOAST
======================= */
type ToastType = "success" | "error";
type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

export default function SuperAdminTestingPage() {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const axiosAuth = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }, [API_BASE_URL, token]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<UiLayanan[]>([]);

  // toast
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(1);

  function pushToast(type: ToastType, message: string) {
    const id = toastIdRef.current++;
    setToasts((prev) => [{ id, type, message }, ...prev]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  function toastSuccess(message: string) {
    pushToast("success", message);
  }

  function toastError(message: string) {
    pushToast("error", message);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function getApiErrorMessage(e: any) {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Terjadi kesalahan"
    );
  }

  /* =======================
     ✅ ENDPOINTS (sesuai routes/api.php)
     /apiResource('layanan', LayananController::class)
     baseURL sudah API_BASE_URL, jadi path cukup "/api/layanan"
  ======================= */
  const ENDPOINT_LIST = "/api/layanan";
  const ENDPOINT_CREATE = "/api/layanan";
  const ENDPOINT_UPDATE = (id: number | string) => `/api/layanan/${id}`;
  const ENDPOINT_DELETE = (id: number | string) => `/api/layanan/${id}`;

  /* =======================
     ✅ FETCH LIST
======================= */
  const fetchLayanan = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosAuth.get(ENDPOINT_LIST);

      // backend kamu: { message: "...", data: [...] }
      const raw: BackendLayanan[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const mapped: UiLayanan[] = raw.map((r) => ({
        id: r.id,
        nama_layanan: String(r.nama_layanan ?? "-"),
        tanggal_layanan: String(r.tanggal_layanan ?? ""), // YYYY-MM-DD
        pembayaran: Number(r.pembayaran ?? 0),
      }));

      setRows(mapped);
    } catch (e: any) {
      const msg = getApiErrorMessage(e) || "Gagal mengambil data layanan.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayanan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE_URL]);

  /* =======================
     ✅ FILTER SEARCH
======================= */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      return (
        String(r.id).toLowerCase().includes(q) ||
        r.nama_layanan.toLowerCase().includes(q) ||
        r.tanggal_layanan.toLowerCase().includes(q) ||
        String(r.pembayaran).toLowerCase().includes(q)
      );
    });
  }, [search, rows]);

  /* =======================
     ✅ HELPERS
======================= */
  function formatIdr(n: number) {
    try {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `Rp ${n.toString()}`;
    }
  }

  function formatDate(date: string) {
    // input: YYYY-MM-DD
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* =========================================================
     ✅ MODAL ADD DATA
========================================================= */
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({
    nama_layanan: "",
    tanggal_layanan: "", // ✅ date (YYYY-MM-DD)
    pembayaran: "", // string input -> number
  });

  function openAddModal() {
    setOpenAdd(true);
    setError(null);
  }

  function closeAddModal() {
    if (saving) return;
    setOpenAdd(false);
    setSaving(false);
    setAddForm({ nama_layanan: "", tanggal_layanan: "", pembayaran: "" });
  }

  async function onConfirmAdd() {
    if (!addForm.nama_layanan.trim() || !addForm.tanggal_layanan) {
      toastError("Nama Layanan dan Tanggal Layanan wajib diisi.");
      return;
    }

    if (!token) {
      toastError(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // backend validate:
      // nama_layanan required|string
      // tanggal_layanan required|date
      // pembayaran required|integer|min:0
      await axiosAuth.post(ENDPOINT_CREATE, {
        nama_layanan: addForm.nama_layanan.trim(),
        tanggal_layanan: addForm.tanggal_layanan, // ✅ YYYY-MM-DD
        pembayaran: Number(addForm.pembayaran || 0),
      });

      toastSuccess("Layanan berhasil dibuat.");
      closeAddModal();
      await fetchLayanan();
    } catch (e: any) {
      const msg = getApiErrorMessage(e);
      setError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     ✅ MODAL EDIT DATA
========================================================= */
  const [openEdit, setOpenEdit] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editing, setEditing] = useState<UiLayanan | null>(null);

  const [editForm, setEditForm] = useState({
    nama_layanan: "",
    tanggal_layanan: "",
    pembayaran: "",
  });

  function openEditModal(row: UiLayanan) {
    setEditing(row);
    setOpenEdit(true);
    setError(null);
  }

  function closeEditModal() {
    if (editSaving) return;
    setOpenEdit(false);
    setEditSaving(false);
    setEditing(null);
    setEditForm({ nama_layanan: "", tanggal_layanan: "", pembayaran: "" });
  }

  useEffect(() => {
    if (!openEdit || !editing) return;
    setEditForm({
      nama_layanan: String(editing.nama_layanan ?? ""),
      tanggal_layanan: String(editing.tanggal_layanan ?? ""), // ✅ YYYY-MM-DD
      pembayaran: String(editing.pembayaran ?? 0),
    });
  }, [openEdit, editing]);

  async function onConfirmEdit() {
    if (!editing) return;

    if (!editForm.nama_layanan.trim() || !editForm.tanggal_layanan) {
      toastError("Nama Layanan dan Tanggal Layanan wajib diisi.");
      return;
    }

    if (!token) {
      toastError(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setEditSaving(true);
      setError(null);

      // backend update validate: sometimes|...
      await axiosAuth.put(ENDPOINT_UPDATE(editing.id), {
        nama_layanan: editForm.nama_layanan.trim(),
        tanggal_layanan: editForm.tanggal_layanan,
        pembayaran: Number(editForm.pembayaran || 0),
      });

      toastSuccess("Layanan berhasil diperbarui.");
      closeEditModal();
      await fetchLayanan();
    } catch (e: any) {
      const msg = getApiErrorMessage(e);
      setError(msg);
      toastError(msg);
    } finally {
      setEditSaving(false);
    }
  }

  /* =========================================================
     ✅ MODAL DELETE DATA
========================================================= */
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleting, setDeleting] = useState<UiLayanan | null>(null);

  function openDeleteModal(row: UiLayanan) {
    setDeleting(row);
    setOpenDelete(true);
    setError(null);
  }

  function closeDeleteModal() {
    if (deleteSaving) return;
    setOpenDelete(false);
    setDeleteSaving(false);
    setDeleting(null);
  }

  async function onConfirmDelete() {
    if (!deleting) return;

    if (!token) {
      toastError(
        'Token belum ditemukan. Silakan login dulu (localStorage key: "token").'
      );
      return;
    }

    try {
      setDeleteSaving(true);
      setError(null);

      await axiosAuth.delete(ENDPOINT_DELETE(deleting.id));

      toastSuccess("Layanan berhasil dihapus.");
      closeDeleteModal();
      await fetchLayanan();
    } catch (e: any) {
      const msg = getApiErrorMessage(e);
      setError(msg);
      toastError(msg);
    } finally {
      setDeleteSaving(false);
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* ===== TOAST (TOP RIGHT) ===== */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`w-[320px] rounded-xl border px-4 py-3 shadow-lg bg-white ${
              t.type === "success" ? "border-green-200" : "border-red-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    t.type === "success" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    t.type === "success" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Header: Testing Service + Search */}
      <div className="flex items-center justify-between gap-4 px-6 pt-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Testing Service
        </h1>

        <div className="w-full max-w-[320px] relative">
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

      {/* Divider */}
      <div className="mx-6 mt-4 border-b border-gray-200/60" />

      {/* Optional error */}
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
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Testing Service Data
            </h2>

            <Button
              type="button"
              onClick={openAddModal}
              className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Data
            </Button>
          </div>

          <div className="px-4 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="py-3 px-3 font-medium w-[70px]">No</th>
                    <th className="py-3 px-3 font-medium">Service Name</th>
                    <th className="py-3 px-3 font-medium w-[180px]">
                      Service Date
                    </th>
                    <th className="py-3 px-3 font-medium w-[220px]">
                      Payment Amount (IDR)
                    </th>
                    <th className="py-3 px-3 font-medium text-center w-[140px]">
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
                    filtered.map((r, idx) => (
                      <tr
                        key={String(r.id)}
                        className="border-t border-gray-100"
                      >
                        <td className="py-3 px-3">{idx + 1}</td>
                        <td className="py-3 px-3">{r.nama_layanan}</td>
                        <td className="py-3 px-3">
                          {formatDate(r.tanggal_layanan)}
                        </td>
                        <td className="py-3 px-3">{formatIdr(r.pembayaran)}</td>

                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(r)}
                              className="h-7 w-7 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(r)}
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

      {/* =========================
          MODAL ADD
         ========================= */}
      {openAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[720px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-8 pt-7">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add data</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the details below to create a new testing service data.
                </p>
              </div>

              <button
                type="button"
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
                  Service Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={addForm.nama_layanan}
                  onChange={(e) =>
                    setAddForm((s) => ({ ...s, nama_layanan: e.target.value }))
                  }
                  className="h-10 mt-2"
                  placeholder="e.g. Chemical Composition Testing"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Service Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={addForm.tanggal_layanan}
                  onChange={(e) =>
                    setAddForm((s) => ({
                      ...s,
                      tanggal_layanan: e.target.value,
                    }))
                  }
                  className="h-10 mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Payment Amount (IDR) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={addForm.pembayaran}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    setAddForm((s) => ({ ...s, pembayaran: v }));
                  }}
                  className="h-10 mt-2"
                  placeholder="e.g. 1500000"
                />
              </div>

              <div className="pt-3 flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-[260px]"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="h-10 w-[260px] bg-blue-600 hover:bg-blue-700"
                  onClick={onConfirmAdd}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODAL EDIT
         ========================= */}
      {openEdit && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[720px] rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between px-8 pt-7">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit data</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update the testing service data details below
                </p>
              </div>

              <button
                type="button"
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
                  Service Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editForm.nama_layanan}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, nama_layanan: e.target.value }))
                  }
                  className="h-10 mt-2"
                  placeholder="Service name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Service Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={editForm.tanggal_layanan}
                  onChange={(e) =>
                    setEditForm((s) => ({
                      ...s,
                      tanggal_layanan: e.target.value,
                    }))
                  }
                  className="h-10 mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">
                  Payment Amount (IDR) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={editForm.pembayaran}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    setEditForm((s) => ({ ...s, pembayaran: v }));
                  }}
                  className="h-10 mt-2"
                  placeholder="Payment amount"
                />
              </div>

              <div className="pt-3 flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-[260px]"
                  onClick={closeEditModal}
                  disabled={editSaving}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="h-10 w-[260px] bg-blue-600 hover:bg-blue-700"
                  onClick={onConfirmEdit}
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          MODAL DELETE
         ========================= */}
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
                    Delete data
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Are you sure you want to delete this data? This action
                    cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
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
                  {deleting.nama_layanan}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(deleting.tanggal_layanan)} •{" "}
                  {formatIdr(deleting.pembayaran)}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-[140px]"
                onClick={closeDeleteModal}
                disabled={deleteSaving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="h-10 w-[140px] bg-red-600 hover:bg-red-700"
                onClick={onConfirmDelete}
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
