"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { api } from "@/lib/api";

type Props = {
  month: string;
  year: string;
};

type TopServiceItem = {
  name: string;
  percentage: number;
};

const COLORS = [
  "#EB4336",
  "#4385F6",
  "#F9BD05",
  "#35A654",
];

export function TopServicesChart({ month, year }: Props) {
  const [data, setData] = useState<TopServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!month || !year) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<any>("/api/dashboard-layanan/usage", {
          params: { month, year },
        });

        const payload = res.data;
        const raw = payload?.data ?? [];

        const mapped: TopServiceItem[] = raw.map((item: any) => ({
          name: item.nama_layanan,
          percentage: Number(item.percentage),
        }));

        setData(mapped);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Failed to load top services data"
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
      <CardHeader>
        <CardTitle>Top Services</CardTitle>
        <CardDescription>
          Service usage percentage for {month}/{year}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400">No data</p>
        ) : (
          <>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="percentage"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {data.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[i % COLORS.length],
                    }}
                  />
                  <span>
                    {item.name} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TopServicesChart;
