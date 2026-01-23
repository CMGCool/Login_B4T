"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Upload,
} from "lucide-react";
import { AiFillFileExcel } from "react-icons/ai";
import { FaFileCsv, FaFilePdf } from "react-icons/fa";
import { IoPrintSharp } from "react-icons/io5";
import axios from "axios";
import { IoFilter } from "react-icons/io5";

type BackendLayanan = {
  id: number | string;
  nama_layanan?: string | null;
  tanggal_layanan?: string | null; // ✅ date (YYYY-MM-DD)
  pembayaran?: number | string | null; // ✅ integer
};


type UiLayanan = {
  id: number | string;
  nama_layanan: string;
  tanggal_layanan: string; // YYYY-MM-DD
  pembayaran: number; // integer
};

export default function SuperAdminTestingPage() {


  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<UiLayanan[]>([]);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<number | null>(null);

  function showToast(message: string) {
    setToastMsg(message);
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

  function getApiErrorMessage(e: any) {
    return (
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Terjadi kesalahan"
    );
  }

  function normalizeDate(dateStr: any): string {
    if (!dateStr) return "";
    // Ambil hanya YYYY-MM-DD tanpa timezone info
    return String(dateStr).substring(0, 10);
  }


  const ENDPOINT_LIST = "/layanan";
  const ENDPOINT_CREATE = "/layanan";
  const ENDPOINT_UPDATE = (id: number | string) => `/layanan/${id}`;
  const ENDPOINT_DELETE = (id: number | string) => `/layanan/${id}`;

  const fetchLayanan = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get<any>(ENDPOINT_LIST);

      const raw: BackendLayanan[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      const mapped: UiLayanan[] = raw.map((r) => ({
        id: r.id,
        nama_layanan: String(r.nama_layanan ?? "-"),
        tanggal_layanan: normalizeDate(r.tanggal_layanan),
        pembayaran: Number(r.pembayaran ?? 0),
      }));

      setRows(mapped);
    } catch (e: any) {
      const msg = getApiErrorMessage(e) || "Gagal mengambil data layanan.";
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dateFrom = startDate ? Date.parse(startDate) : null;
    const dateTo = endDate ? Date.parse(endDate) : null;

    return rows.filter((r) => {
      const matchesSearch = !q
        ? true
        : String(r.id).toLowerCase().includes(q) ||
          r.nama_layanan.toLowerCase().includes(q) ||
          r.tanggal_layanan.toLowerCase().includes(q) ||
          String(r.pembayaran).toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (!dateFrom && !dateTo) return true;

      const rowDate = Date.parse(r.tanggal_layanan || "");
      if (Number.isNaN(rowDate)) return false;

      if (dateFrom != null && rowDate < dateFrom) return false;
      if (dateTo != null && rowDate > dateTo) return false;

      return true;
    });
  }, [search, rows, startDate, endDate]);

  const [sortKey, setSortKey] = useState<
    "nama_layanan" | "tanggal_layanan" | "pembayaran" | null
  >(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];

    copy.sort((a, b) => {
      if (sortKey === "nama_layanan") {
        const left = a.nama_layanan.toLowerCase();
        const right = b.nama_layanan.toLowerCase();
        return sortDir === "asc"
          ? left.localeCompare(right)
          : right.localeCompare(left);
      }

      if (sortKey === "tanggal_layanan") {
        const left = Date.parse(a.tanggal_layanan || "");
        const right = Date.parse(b.tanggal_layanan || "");
        const l = Number.isNaN(left) ? 0 : left;
        const r = Number.isNaN(right) ? 0 : right;
        return sortDir === "asc" ? l - r : r - l;
      }

      const l = Number(a.pembayaran || 0);
      const r = Number(b.pembayaran || 0);
      return sortDir === "asc" ? l - r : r - l;
    });

    return copy;
  }, [filtered, sortKey, sortDir]);

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, sortKey, sortDir, startDate, endDate]);

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
    key: "nama_layanan" | "tanggal_layanan" | "pembayaran"
  ) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDir("asc");
  };

  const renderSortIcon = (
    key: "nama_layanan" | "tanggal_layanan" | "pembayaran"
  ) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

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
    if (!date) return "-";
    // Return format YYYY-MM-DD seperti di database
    return String(date).substring(0, 10);
  }

  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({
    nama_layanan: "",
    tanggal_layanan: "",
    pembayaran: "",
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
      showToast("Nama Layanan dan Tanggal Layanan wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await api.post<any>(ENDPOINT_CREATE, {
        nama_layanan: addForm.nama_layanan.trim(),
        tanggal_layanan: addForm.tanggal_layanan,
        pembayaran: Number(addForm.pembayaran || 0),
      });

      showToast("Layanan berhasil dibuat.");
      closeAddModal();
      await fetchLayanan();
    } catch (e: any) {
      const msg = getApiErrorMessage(e);
      setError(msg);
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }
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

  const handleDownload = (type: "excel" | "pdf" | "csv" | "print") => {
  let url = "";

  if (type === "excel") {
    url = "http://localhost:8000/api/export/layanan/excel";
  } else if (type === "pdf") {
    url = "http://localhost:8000/api/export/layanan/pdf";
  } else if (type === "csv") {
    url = "http://localhost:8000/api/export/layanan/csv";
  } else if (type === "print") {
    url = "http://localhost:8000/api/print/layanan";
  }
  window.open(url, "_blank");
};

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
      tanggal_layanan: normalizeDate(editing.tanggal_layanan),
      pembayaran: String(editing.pembayaran ?? 0),
    });
  }, [openEdit, editing]);

  async function onConfirmEdit() {
    if (!editing) return;

    if (!editForm.nama_layanan.trim() || !editForm.tanggal_layanan) {
      showToast("Nama Layanan dan Tanggal Layanan wajib diisi.");
      return;
    }

    try {
      setEditSaving(true);
      setError(null);

      await api.put<any>(ENDPOINT_UPDATE(editing.id), {
        nama_layanan: editForm.nama_layanan.trim(),
        tanggal_layanan: editForm.tanggal_layanan,
        pembayaran: Number(editForm.pembayaran || 0),
      });

      showToast("Layanan berhasil diperbarui.");
      closeEditModal();
      await fetchLayanan();
    } catch (e: any) {
      const msg = getApiErrorMessage(e);
      setError(msg);
      showToast(msg);
    } finally {
      setEditSaving(false);
    }
  }
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

    try {
      setDeleteSaving(true);
      setError(null);

      await api.delete<any>(ENDPOINT_DELETE(deleting.id));

      showToast("Layanan berhasil dihapus.");
      closeDeleteModal();
      await fetchLayanan();
    } catch (e: any) {
      const msg = getApiErrorMessage(e);
      setError(msg);
      showToast(msg);
    } finally {
      setDeleteSaving(false);
    }
  }

  const [fileLayanan, setFileLayanan] = useState<File | null>(null);
  const [loadingImportLayanan, setLoadingImportLayanan] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const closeImportModal = () => {
    if (loadingImportLayanan) return;
    setOpenImport(false);
    setFileLayanan(null);
  };
  const handleImportLayanan = async () => {
  if (!fileLayanan) {
    alert("Pilih file terlebih dahulu");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileLayanan);

  try {
    setLoadingImportLayanan(true);

    const res = await axios.post(
      "http://localhost:8000/api/import/layanan",
      formData,
      { withCredentials: true }
    );

    // notif sukses
    alert(res.data.message || "Import layanan berhasil 🎉");

    // 🔄 refresh data tabel (PAKAI LOGIC YANG SAMA SEPERTI fetchLayanan)
    const refresh = await api.get("/layanan");

    const raw: BackendLayanan[] = Array.isArray(refresh.data?.data)
      ? refresh.data.data
      : Array.isArray(refresh.data)
        ? refresh.data
        : [];

    const mapped: UiLayanan[] = raw.map((r) => ({
      id: r.id,
      nama_layanan: String(r.nama_layanan ?? "-"),
      tanggal_layanan: String(r.tanggal_layanan ?? ""),
      pembayaran: Number(r.pembayaran ?? 0),
    }));

    setRows(mapped); 

    // reset file input
    setFileLayanan(null);

  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Import gagal, cek format file");
  } finally {
    setLoadingImportLayanan(false);
  }
};


  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* TOAST (kanan atas) */}
      {toastOpen && (
        <div className="fixed top-6 right-6 z-[9999]">
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-md min-w-[320px] max-w-[520px]">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <p className="text-sm font-medium text-green-800">{toastMsg}</p>

            <button
              onClick={() => setToastOpen(false)}
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-green-100"
              aria-label="Close"
              title="Close"
            >
              <X size={16} className="text-green-800" />
            </button>
          </div>
        </div>
      )}

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
        <div className="w-full max-w-[1500px] rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Testing Service Data
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 mt-3 mb-3">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setOpenImport(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>

              <Button
                onClick={() => handleDownload("excel")}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <AiFillFileExcel className="h-2 w-2" />
                Excel
              </Button>

              <Button
                onClick={() => handleDownload("pdf")}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <FaFilePdf className="h-2 w-2" />
                PDF
              </Button>

              <Button
                onClick={() => handleDownload("csv")}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <FaFileCsv className="h-2 w-2" />
                CSV
              </Button>

              <Button
                onClick={() => handleDownload("print")}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <IoPrintSharp className="h-2 w-2" />
                Print
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
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
                  className="h-9"
                  onClick={() => setOpenFilter((v) => !v)}
                >
                <IoFilter />Filter
                </Button>

                {openFilter && (
                  <div className="absolute right-0 mt-2 w-[280px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg z-20">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm text-gray-700 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm text-gray-700 outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>

                        <Button
                          type="button"
                          className="h-9 bg-blue-600 hover:bg-blue-700"
                          onClick={() => setOpenFilter(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={openAddModal}
                className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Data
              </Button>
            </div>
          </div>

          <div className="px-4 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                <colgroup>
                  <col className="w-[70px]" />
                  <col className="w-[210px]" />
                  <col className="w-[160px]" />
                  <col className="w-[200px]" />
                  <col className="w-[140px]" />
                </colgroup>
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="py-3 px-3 font-medium">No</th>
                    <th className="py-3 px-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort("nama_layanan")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Service Name
                        {renderSortIcon("nama_layanan")}
                      </button>
                    </th>
                    <th className="py-3 px-3 font-medium whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort("tanggal_layanan")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Service Date
                        {renderSortIcon("tanggal_layanan")}
                      </button>
                    </th>
                    <th className="py-3 px-3 font-medium whitespace-nowrap text-left">
                      <button
                        type="button"
                        onClick={() => toggleSort("pembayaran")}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900"
                      >
                        Payment Amount (IDR)
                        {renderSortIcon("pembayaran")}
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
                    paginated.map((r, idx) => (
                      <tr key={String(r.id)} className="border-t border-gray-100">
                        <td className="py-3 px-3">{pageFrom + idx}</td>
                        <td className="py-3 px-3 truncate">{r.nama_layanan}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {formatDate(r.tanggal_layanan)}
                        </td>
                        <td className="py-3 px-3 text-left whitespace-nowrap">
                          {formatIdr(r.pembayaran)}
                        </td>

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

      {/* =========================
          MODAL IMPORT
         ========================= */}
      {openImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl border border-gray-200">
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Import File
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload and attach file to this project.
                </p>
              </div>

              <button
                type="button"
                onClick={closeImportModal}
                className="rounded-md p-1 text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pt-5 pb-6">
              <label
                htmlFor="layanan-import"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center cursor-pointer hover:bg-gray-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Upload className="h-5 w-5 text-gray-500" />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-blue-600 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop here
                </div>
                <div className="text-xs text-gray-400">CSV or Excel</div>
                {fileLayanan && (
                  <div className="text-xs text-gray-600">
                    Selected: {fileLayanan.name}
                  </div>
                )}
              </label>

              <input
                id="layanan-import"
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setFileLayanan(e.target.files?.[0] || null)}
                className="sr-only"
              />

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  onClick={closeImportModal}
                  disabled={loadingImportLayanan}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  className="h-10 bg-blue-600 hover:bg-blue-700"
                  onClick={async () => {
                    await handleImportLayanan();
                    closeImportModal();
                  }}
                  disabled={!fileLayanan || loadingImportLayanan}
                >
                  {loadingImportLayanan ? "Importing..." : "Import"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
