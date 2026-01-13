"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

type BackendChartResponse = {
  message?: string | null;
  tahun?: string | number | null;
  data?: {
    labels?: string[] | null;
    biayaPerBulan?: Array<number | string> | null;
    targetPerBulan?: Array<number | string> | null;
  } | null;
  summary?: {
    total_biaya?: number | string | null;
    total_target?: number | string | null;
    selisih?: number | string | null;
    persentase_tercapai?: number | string | null;
  } | null;
};

type Point = {
  month: string;
  targetBulanan: number;
  biayaBulanan: number;
};

function monthShort(bulan: string) {
  const s = String(bulan || "").trim();
  if (!s) return "";

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

  return s.slice(0, 3);
}

export function RevenuePerformanceChart() {
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

        const res = await api.get<any>("/analytics/chart-biaya-vs-target", {
          params: { tahun: year },
        });

        const payload: BackendChartResponse = (res.data ?? {}) as BackendChartResponse;
        const labels = payload.data?.labels ?? [];
        const biayaPerBulan = payload.data?.biayaPerBulan ?? [];
        const targetPerBulan = payload.data?.targetPerBulan ?? [];
        const responseYear = String(payload.tahun ?? "");
        const years = responseYear ? [responseYear] : [];
        const fallbackYears = ["2025", "2026", "2027"];
        const mergedYears = Array.from(new Set([...fallbackYears, ...years])).sort();

        if (alive) {
          setAvailableYears(mergedYears);
          if (!mergedYears.includes(year)) {
            setYear(mergedYears[mergedYears.length - 1]);
          }
        }

        const mapped: Point[] = labels.map((label, index) => ({
          month: monthShort(String(label ?? "")),
          targetBulanan: Number(targetPerBulan[index] ?? 0),
          biayaBulanan: Number(biayaPerBulan[index] ?? 0),
        }));

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
  }, [year]);

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
                  dataKey="targetBulanan"
                  dot={false}
                  strokeWidth={2}
                  stroke="#E76E50"
                />
                <Line
                  type="monotone"
                  dataKey="biayaBulanan"
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
          Trending up this month
          <TrendingUp size={16} className="text-gray-900" />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Showing revenue performance for the year {year}
        </p>
      </div>
    </div>
  );
}
