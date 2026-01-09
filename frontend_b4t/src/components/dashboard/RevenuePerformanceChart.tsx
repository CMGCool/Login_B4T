"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

type BackendTarget = {
  id: number | string;
  bulan?: string | null;
  target_perbulan?: number | string | null;
  tahun?: number | string | null;
};

type Point = {
  month: string; // "Jan"..."Dec"
  a: number; // target
  b: number; // variasi (biar 2 garis)
};

function monthShort(bulan: string) {
  const s = String(bulan || "").trim();
  if (!s) return "";

  // dukung nama bulan Indonesia & English
  const map: Record<string, string> = {
    january: "Jan",
    february: "Feb",
    march: "Mar",
    april: "Apr",
    may: "May",
    june: "Jun",
    july: "Jul",
    august: "Aug",
    september: "Sep",
    october: "Oct",
    november: "Nov",
    december: "Dec",

    januari: "Jan",
    februari: "Feb",
    maret: "Mar",
    april_id: "Apr",
    mei: "May",
    juni: "Jun",
    juli: "Jul",
    agustus: "Aug",
    september_id: "Sep",
    oktober: "Oct",
    november_id: "Nov",
    desember: "Dec",
  };

  const key = s.toLowerCase();
  if (map[key]) return map[key];
  if (key === "april") return "Apr";
  if (key === "september") return "Sep";
  if (key === "november") return "Nov";

  // fallback: ambil 3 huruf pertama
  return s.slice(0, 3);
}

export function RevenuePerformanceChart() {
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

  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        // ambil semua target
        const res = await axiosAuth.get("/api/target");

        const raw: BackendTarget[] = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];

        const years = Array.from(
          new Set(raw.map((r) => String(r.tahun ?? "")).filter(Boolean))
        ).sort();

        // set opsi tahun & default year jika tahun sekarang tidak ada
        if (alive) {
          setAvailableYears(years.length ? years : ["2025", "2026", "2027"]);
          if (years.length && !years.includes(year)) {
            setYear(years[years.length - 1]); // terbesar
          }
        }

        // filter data sesuai year terpilih
        const byYear = raw.filter((r) => String(r.tahun ?? "") === String(year));

        const mapped: Point[] = byYear.map((r) => {
          const a = Number(r.target_perbulan ?? 0);
          return {
            month: monthShort(String(r.bulan ?? "")),
            a,
            b: Math.round(a * 0.85),
          };
        });

        const order = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        mapped.sort((x, y) => order.indexOf(x.month) - order.indexOf(y.month));

        if (!alive) return;
        setData(mapped);
      } catch (e: any) {
        if (!alive) return;
        setErr(
          e?.response?.data?.message ||
            e?.message ||
            "Gagal mengambil data revenue performance."
        );
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [axiosAuth, year]);

  const rangeText = useMemo(() => `January - Dec ${year}`, [year]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-4 p-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Revenue Performance
          </h3>
          <p className="text-xs text-gray-500">{rangeText}</p>
        </div>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none"
        >
          {(availableYears.length ? availableYears : ["2025", "2026", "2027"]).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>
      </div>

      <div className="px-4">
        <div className="h-[220px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              Loading...
            </div>
          ) : err ? (
            <div className="h-full flex items-center justify-center text-sm text-red-600">
              {err}
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              Data chart belum tersedia
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />

                <Line
                  type="monotone"
                  dataKey="a"
                  dot={false}
                  strokeWidth={2}
                  stroke="#E76E50"
                />
                <Line
                  type="monotone"
                  dataKey="b"
                  dot={false}
                  strokeWidth={2}
                  stroke="#78C1F3"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="p-4 pt-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          Trending up by 5.2% this month
          <TrendingUp size={16} className="text-gray-900" />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Showing revenue performance for the year {year}
        </p>
      </div>
    </div>
  );
}
