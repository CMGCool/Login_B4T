"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Pencil, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AiFillFileExcel } from "react-icons/ai";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import { IoPrintSharp } from "react-icons/io5";

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
  const [year, setYear] = useState("2025");
  const [q, setQ] = useState("");

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

  // fetch list dari backend (sekali, lalu filter by year di client)
  useEffect(() => {
    let alive = true;

    async function fetchTargets() {
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

        if (!alive) return;
        setItems(mapped);

        // kalau year yang dipilih belum ada di data, otomatis set ke tahun pertama yang ada
        const years = Array.from(new Set(mapped.map((m) => m.year).filter(Boolean))).sort();
        if (years.length > 0 && !years.includes(year)) {
          setYear(years[years.length - 1]); // ambil yang terbesar
        }
      } catch (e: any) {
        if (!alive) return;
        setErr(getApiErrorMessage(e) || "Gagal memuat data target.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    fetchTargets();
    return () => {
      alive = false;
    };
  }, []);

  // filter tahun + search
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    const byYear = items.filter((it) => String(it.year) === String(year));
    if (!s) return byYear;

    return byYear.filter((it) => it.month.toLowerCase().includes(s));
  }, [items, q, year]);

  const total = useMemo(() => {
    return filtered.reduce((acc, it) => acc + (Number(it.target) || 0), 0);
  }, [filtered]);

  const yearOptions = useMemo(() => {
    const ys = Array.from(new Set(items.map((i) => i.year).filter(Boolean))).sort();
    // fallback default pilihan
    return ys.length ? ys : ["2025", "2026", "2027"];
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

      // PUT ke backend (field sesuai controller: target_perbulan)
      const res = await api.put<any>(ENDPOINT_UPDATE(editing.id), {
        target_perbulan: nextVal,
      });

      // update state agar UI langsung berubah
      setItems((prev) =>
        prev.map((item) =>
          item.id === editing.id ? { ...item, target: nextVal } : item
        )
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

  const handleImportRevenue = async () => {
  if (!file) {
    alert("Pilih file terlebih dahulu");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoadingImport(true);

    const res = await axios.post(
      "http://localhost:8000/api/import/target",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // kalau pakai sanctum
        },
      }
    );
    alert(res.data.message || "Import berhasil 🎉");
    fetchRevenueData();
  } catch (err: any) {
    console.error(err);
    if (err.response?.data?.message) {
      alert(err.response.data.message);
    } else {
      alert("Import gagal, cek format file");
    }
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Annual Revenue Target
          </h1>

          <div className="relative w-[260px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-right ml-auto mb-4">
            <Button
              onClick={() => handleDownload("excel")}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
              <AiFillFileExcel className="h-2 w-2"/>
              Excel
            </Button>

            <Button
              onClick={() => handleDownload("pdf")}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
              <FaFilePdf className="h-2 w-2"/>
              PDF
            </Button>

            <Button
              onClick={() => handleDownload("csv")}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
              <FaFileCsv className="h-2 w-2"/>
              CSV
            </Button>

            <Button
              onClick={() => handleDownload("print")}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
              <IoPrintSharp className="h-2 w-2"/>
              Print
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="border p-2 rounded text-sm"
            />  
          <button
            onClick={handleImportRevenue}
            disabled={!file || loadingImport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loadingImport ? "Importing..." : "Import Excel"}
          </button>
          </div>


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
                    filtered.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-100 last:border-none"
                      >
                        <td className="py-3 px-3 text-gray-700">{idx + 1}</td>
                        <td className="py-3 px-3 text-gray-900">{row.month}</td>
                        <td className="py-3 px-3 text-gray-900">
                          {formatRupiah(Number(row.target) || 0)}
                        </td>
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
                      <td className="py-3 px-3 font-medium text-gray-900">
                        Total
                      </td>
                      <td className="py-3 px-3"></td>
                      <td className="py-3 px-3 font-medium text-gray-900">
                        {formatRupiah(total)}
                      </td>
                      <td className="py-3 px-3"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL EDIT */}
        {openEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-xl border border-gray-200">
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Edit Monthly Target
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update the revenue target for{" "}
                    <span className="font-medium text-gray-700">
                      {editing?.month ?? "-"}
                    </span>
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
      </div>
    </div>
  );
}
