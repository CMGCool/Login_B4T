"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Pencil, Search, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AiFillFileExcel } from "react-icons/ai";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import { IoPrintSharp } from "react-icons/io5";
import { IoFilter } from "react-icons/io5";

type BackendTarget = {
  id: number | string;
  bulan?: string | null;
  target_perbulan?: number | string | null;
  tahun?: number | string | null;
};

type RevenueTarget = {
  id: number | string;
  month: string; // bulan
  target: number; // target_perbulan
  year: string; // tahun
};

function formatRupiah(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

export default function TargetPage() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const [items, setItems] = useState<RevenueTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // modal edit
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<RevenueTarget | null>(null);
  const [editTarget, setEditTarget] = useState<string>("");

  // toast
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);

    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToastOpen(false);
    }, 3000);
  };

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

  const [file, setFile] = useState<File | null>(null);
  const [loadingImport, setLoadingImport] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const closeImportModal = () => {
    if (loadingImport) return;
    setOpenImport(false);
    setFile(null);
  };

  const handleDownload = (type: "excel" | "pdf" | "csv" | "print") => {
    let url = "";

    if (type === "excel") {
      url = "http://localhost:8000/api/export/target/excel";
    } else if (type === "pdf") {
      url = "http://localhost:8000/api/export/target/pdf";
    } else if (type === "csv") {
      url = "http://localhost:8000/api/export/target/csv";
    } else if (type === "print") {
      url = "http://localhost:8000/api/print/target";
    }

    window.open(url, "_blank");
  };

  // backend apiResource('target') => GET /api/target, PUT /api/target/{id}
  const ENDPOINT_LIST = "/target";
  const ENDPOINT_UPDATE = (id: number | string) => `/target/${id}`;

  const monthToNumber = (value: string) => {
    const v = value.trim().toLowerCase();
    if (!v) return null;

    const numeric = Number(v);
    if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) {
      return numeric;
    }

    const map: Record<string, number> = {
      jan: 1,
      january: 1,
      januari: 1,
      feb: 2,
      february: 2,
      februari: 2,
      mar: 3,
      march: 3,
      maret: 3,
      apr: 4,
      april: 4,
      may: 5,
      mei: 5,
      jun: 6,
      june: 6,
      juni: 6,
      jul: 7,
      july: 7,
      juli: 7,
      aug: 8,
      august: 8,
      agustus: 8,
      sep: 9,
      sept: 9,
      september: 9,
      oct: 10,
      october: 10,
      oktober: 10,
      nov: 11,
      november: 11,
      dec: 12,
      december: 12,
      desember: 12,
    };

    return map[v] ?? null;
  };

  const fetchTargets = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await api.get<any>(ENDPOINT_LIST);

      const raw: BackendTarget[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const mapped: RevenueTarget[] = raw.map((r) => ({
        id: r.id,
        month: String(r.bulan ?? "-"),
        target: Number(r.target_perbulan ?? 0),
        year: String(r.tahun ?? ""),
      }));

      setItems(mapped);

      const years = Array.from(new Set(mapped.map((m) => m.year).filter(Boolean))).sort();
      if (years.length > 0 && !years.includes(year)) {
<<<<<<< HEAD
        const currentYear = String(new Date().getFullYear());
        if (years.includes(currentYear)) {
          setYear(currentYear);
        } else {
          setYear(years[years.length - 1]); // ambil yang terbesar
        }
=======
        setYear(years[years.length - 1]);
>>>>>>> 2dd9bcad7e650824b7cc9b27e5aadb5fbdda35b4
      }
    } catch (e: any) {
      setErr(getApiErrorMessage(e) || "Gagal memuat data target.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    const safeFetch = async () => {
      if (!alive) return;
      await fetchTargets();
    };

    safeFetch();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const dateFrom = startDate ? Date.parse(startDate) : null;
    const dateTo = endDate ? Date.parse(endDate) : null;

    const byYear = items.filter((it) => String(it.year) === String(year));
    const searched = !s ? byYear : byYear.filter((it) => it.month.toLowerCase().includes(s));

    if (!dateFrom && !dateTo) return searched;

    return searched.filter((it) => {
      const monthNumber = monthToNumber(it.month);
      const yearNumber = Number(it.year);
      if (!monthNumber || !Number.isFinite(yearNumber)) return false;

      const rowDate = Date.UTC(yearNumber, monthNumber - 1, 1);
      if (dateFrom != null && rowDate < dateFrom) return false;
      if (dateTo != null && rowDate > dateTo) return false;

      return true;
    });
  }, [items, q, year, startDate, endDate]);

<<<<<<< HEAD
=======
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [q, year, pageSize, startDate, endDate]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

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
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const pageFrom = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageTo = Math.min(page * pageSize, totalItems);

>>>>>>> 2dd9bcad7e650824b7cc9b27e5aadb5fbdda35b4
  const total = useMemo(() => {
    return filtered.reduce((acc, it) => acc + (Number(it.target) || 0), 0);
  }, [filtered]);

  const yearOptions = useMemo(() => {
    const ys = Array.from(new Set(items.map((i) => i.year).filter(Boolean))).sort();
<<<<<<< HEAD
    if (ys.length) return ys;
    
    // Fallback: tahun saat ini sampai 3 tahun ke depan
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2].map(String);
=======
    return ys.length ? ys : ["2025", "2026", "2027"];
>>>>>>> 2dd9bcad7e650824b7cc9b27e5aadb5fbdda35b4
  }, [items]);

  const onOpenEdit = (row: RevenueTarget) => {
    setEditing(row);
    setEditTarget(String(row.target ?? ""));
    setOpenEdit(true);
  };

  const onCloseEdit = () => {
    setOpenEdit(false);
    setEditing(null);
    setEditTarget("");
  };

  const onSubmitEdit = async () => {
    if (!editing) return;

    try {
      setErr(null);

      const nextVal = Number(editTarget || 0);

      const res = await api.put<any>(ENDPOINT_UPDATE(editing.id), {
        target_perbulan: nextVal,
      });

      setItems((prev) =>
        prev.map((item) => (item.id === editing.id ? { ...item, target: nextVal } : item))
      );

      onCloseEdit();

      const msg = res.data?.message || "Target berhasil diperbarui.";
      showToast(msg);
    } catch (e: any) {
      const msg = getApiErrorMessage(e) || "Gagal update target.";
      setErr(msg);
      showToast(msg);
    }
  };

  // ✅ IMPORT: pilih endpoint sesuai ekstensi (sesuai routes backend kamu)
  const handleImportRevenue = async () => {
    if (!file) {
      showToast("Pilih file terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Backend hanya menyediakan /import/target (ImportController::importRevenue)
    const importUrl = "/import/target";

    try {
      setLoadingImport(true);

      // ✅ pakai api instance (lebih cocok untuk auth:sanctum)
      const res = await api.post(importUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast(res.data?.message || "Import berhasil.");
      setFile(null);
      await fetchTargets();
    } catch (e: any) {
      console.error("IMPORT ERROR:", e?.response?.data || e);
      showToast(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Import gagal, cek format file / backend log"
      );
    } finally {
      setLoadingImport(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
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

      <div className="p-6">
        {/* Header + Search */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Annual Revenue Target</h1>

          <div className="relative w-[260px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="pl-9" />
          </div>
        </div>
        <div className="mt-4 mb-6 border-b border-gray-200/60" />

        {/* Card table */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-medium text-gray-900">Monthly Targets {year}</h2>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 mb-4">
            <div className="flex flex-wrap gap-2">
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
<<<<<<< HEAD
=======

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
                <Button type="button" variant="outline" className="h-9" onClick={() => setOpenFilter((v) => !v)}>
                  <IoFilter />
                  Filter
                </Button>

                {openFilter && (
                  <div className="absolute right-0 mt-2 w-[280px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg z-20">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-9 w-full rounded-md border border-gray-200 px-2 text-sm text-gray-700 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
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

                        <Button type="button" className="h-9 bg-blue-600 hover:bg-blue-700" onClick={() => setOpenFilter(false)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
>>>>>>> 2dd9bcad7e650824b7cc9b27e5aadb5fbdda35b4
          </div>

          <div className="px-4 pb-4">
            {err && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b border-gray-100">
                  <tr className="bg-white">
                    <th className="py-3 px-3 w-[70px]">No</th>
                    <th className="py-3 px-3">Month</th>
                    <th className="py-3 px-3">Target Revenue</th>
                    <th className="py-3 px-3 text-right w-[120px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-400">
                        Data belum tersedia
                      </td>
                    </tr>
                  )}

                  {!loading &&
<<<<<<< HEAD
                    filtered.map((row, index) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-100 last:border-none"
                      >
                        <td className="py-3 px-3 text-gray-900">{index + 1}</td>
=======
                    paginated.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-100 last:border-none">
                        <td className="py-3 px-3 text-gray-700">{pageFrom + idx}</td>
>>>>>>> 2dd9bcad7e650824b7cc9b27e5aadb5fbdda35b4
                        <td className="py-3 px-3 text-gray-900">{row.month}</td>
                        <td className="py-3 px-3 text-gray-900">{formatRupiah(Number(row.target) || 0)}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onOpenEdit(row)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {!loading && filtered.length > 0 && (
                    <tr className="border-t border-gray-100 bg-white">
                      <td className="py-3 px-3 font-medium text-gray-900">Total</td>
                      <td className="py-3 px-3"></td>
                      <td className="py-3 px-3 font-medium text-gray-900">{formatRupiah(total)}</td>
                      <td className="py-3 px-3"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
<<<<<<< HEAD
=======

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
>>>>>>> 2dd9bcad7e650824b7cc9b27e5aadb5fbdda35b4
          </div>
        </div>

        {/* MODAL EDIT */}
        {openEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-xl border border-gray-200">
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Edit Monthly Target</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update the revenue target for{" "}
                    <span className="font-medium text-gray-700">{editing?.month ?? "-"}</span>
                  </p>
                </div>

                <button
                  onClick={onCloseEdit}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-50"
                  aria-label="Close"
                  title="Close"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="px-6 pt-5 pb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Target Revenue (IDR) <span className="text-red-500">*</span>
                </label>

                <div className="mt-2 flex h-11 items-center rounded-lg border border-gray-200 bg-white px-3 focus-within:ring-2 focus-within:ring-blue-600/30">
                  <span className="text-sm text-gray-500 mr-2">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editTarget}
                    onChange={(e) => {
                      const onlyNum = e.target.value.replace(/[^\d]/g, "");
                      setEditTarget(onlyNum);
                    }}
                    placeholder="0"
                    className="w-full bg-transparent text-sm text-gray-900 outline-none"
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={onCloseEdit}
                    className="h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={onSubmitEdit}
                    className="h-11 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL IMPORT */}
        {openImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl border border-gray-200">
              <div className="flex items-start justify-between px-6 pt-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Import File</h2>
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
                  htmlFor="target-import"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <Upload className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600 font-medium">Click to upload</span>{" "}
                    or drag and drop here
                  </div>
                  <div className="text-xs text-gray-400">CSV or Excel</div>
                  {file && <div className="text-xs text-gray-600">Selected: {file.name}</div>}
                </label>

                <input
                  id="target-import"
                  type="file"
                  accept=".xlsx,.csv,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10"
                    onClick={closeImportModal}
                    disabled={loadingImport}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    className="h-10 bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      await handleImportRevenue();
                      closeImportModal();
                    }}
                    disabled={!file || loadingImport}
                  >
                    {loadingImport ? "Importing..." : "Import"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
