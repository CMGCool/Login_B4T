"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { MONTH_OPTIONS, getYearOptions } from "@/lib/date";
import { api } from "@/lib/api";

type Props = {
  month: string;
  year: string;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
};

type BackendItem = {
  minggu: number;
  range: string;
  total_biaya: number;
};

export function ServiceCostRecap({
  month,
  year,
  onMonthChange,
  onYearChange,
}: Props) {
  const [data, setData] = useState<BackendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!month || !year) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<any>(
          "/api/dashboard-layanan/biaya-per-minggu",
          {
            params: { month, year },
          }
        );

        const payload = res.data;
        setData(payload?.data ?? []);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
            "Failed to load service cost recap"
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle>Service Cost Recap</CardTitle>

          <div className="flex gap-2">
            <Select value={month} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[90px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year} onValueChange={onYearChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions(2018, 10).map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardDescription>
          Weekly service cost for selected month
        </CardDescription>
      </CardHeader>

      <CardContent className="h-[260px]">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.map((item) => ({
                label: `Week ${item.minggu}`,
                value: item.total_biaya,
              }))}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#000000", fontSize: 12 }} 
                stroke="#000000"
                
              />
              <Tooltip
                formatter={(value) =>
                typeof value === "number"
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(value)
      : "-"
  }
/>

              <Bar
                dataKey="value"
                radius={[10, 10, 10, 10]}
                fill="#EB4336"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ServiceCostRecap;
