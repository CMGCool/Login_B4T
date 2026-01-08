"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      // Panggil backend untuk invalidasi token di server
      await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "") + "/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(() => {
            // Ambil token dari cookie untuk Authorization
            const match = typeof document !== "undefined"
              ? document.cookie.match(/(?:^|; )token=([^;]*)/)
              : null;
            const token = match ? decodeURIComponent(match[1]) : null;
            return token ? { Authorization: `Bearer ${token}` } : {};
          })(),
        },
      });
    } catch (e) {
      // Abaikan error, lanjutkan hapus cookie di client
    }

    // Hapus cookie (dashboard tidak pakai localStorage)
    document.cookie = "token=; path=/; domain=localhost; Max-Age=0";
    // Redirect ke login 3000
    window.location.href = process.env.NEXT_PUBLIC_LOGIN_URL || "http://localhost:3000/login";
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard B4T (Port 3001)</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="mt-4">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

