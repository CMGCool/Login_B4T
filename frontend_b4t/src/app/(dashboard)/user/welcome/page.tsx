"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type MeResponse = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type DayPart = "morning" | "afternoon" | "night";

export default function UserDashboardPage() {
  const router = useRouter();



  const [search, setSearch] = useState("");
  const [loadingMe, setLoadingMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [me, setMe] = useState<MeResponse>({
    name: null,
    email: null,
    role: null,
  });



  // ===== Realtime clock (update tiap menit) =====
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const dayPart: DayPart = useMemo(() => {
    const h = now.getHours();
    if (h >= 5 && h < 12) return "morning";
    if (h >= 12 && h < 18) return "afternoon";
    return "night";
  }, [now]);

  const greeting = useMemo(() => {
    if (dayPart === "morning") return "Good Morning";
    if (dayPart === "afternoon") return "Good Afternoon";
    return "Good Night";
  }, [dayPart]);

  const greetingSubtitle = useMemo(() => {
    const messages: Record<DayPart, string[]> = {
      morning: [
        "Wishing you a bright start to the day.",
        "Let’s make today a productive one.",
        "New day, new opportunities—go for it!",
        "Take a deep breath and start strong.",
      ],
      afternoon: [
        "Keep going—you’re doing great.",
        "Hope your afternoon is going smoothly.",
        "Stay focused and finish strong today.",
        "A great time to check progress and move forward.",
      ],
      night: [
        "Take time to unwind and recharge.",
        "You’ve done enough for today—rest well.",
        "Hope you have a calm and peaceful night.",
        "Relax, reset, and get ready for tomorrow.",
      ],
    };

    const list = messages[dayPart];

    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const dateKey = `${y}${m}${d}`;

    let seed = 0;
    const combined = `${dateKey}-${dayPart}`;
    for (let i = 0; i < combined.length; i++) {
      seed = (seed * 31 + combined.charCodeAt(i)) >>> 0;
    }

    return list[seed % list.length];
  }, [dayPart, now]);

  const fetchMe = async () => {
    setLoadingMe(true);
    setError(null);

    try {
      // ✅ Use centralized api client
      const res = await api.get("/user/welcome");

      // ✅ tahan banting: dukung banyak bentuk response
      const data = res.data?.user ?? res.data?.data ?? res.data ?? {};

      const name = data?.name ?? data?.full_name ?? data?.username ?? null;
      const email = data?.email ?? data?.user_email ?? null;
      const role = data?.role ?? "user";

      const profile = { name, email, role };

      setMe(profile);

      setMe(profile);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
        e?.message ||
        "Gagal mengambil data user dari backend (/api/user/welcome)."
      );
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-48px)] bg-white">
      {/* Header row: Title + Search */}
      <div className="flex items-center justify-between gap-4 px-8 pt-7">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

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

      <div className="mx-8 mt-5 border-b border-gray-200/60" />

      {/* Error */}
      {error && (
        <div className="px-8 pt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="px-8 pt-7">
        <h2 className="text-xl font-semibold text-gray-900">
          {greeting},{" "}
          <span className="font-semibold">
            {loadingMe ? "..." : me.name || me.email || "User"}
          </span>
        </h2>

        <p className="mt-1 text-sm text-gray-500">{greetingSubtitle}</p>

        {/* tampilkan email agar yakin sesuai user login */}
        <p className="mt-3 text-sm text-gray-500">
          {loadingMe ? "" : me.email ? `Signed in as ${me.email}` : ""}
        </p>
      </div>

      <div className="h-12" />
    </div>
  );
}
