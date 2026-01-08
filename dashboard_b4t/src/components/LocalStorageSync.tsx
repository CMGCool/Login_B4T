"use client";

import { useEffect } from "react";

/**
 * Component untuk sync localStorage dengan cookie.
 * Jika cookie 'token' hilang (logout dari app lain), hapus localStorage.
 * Dashboard seharusnya tidak pakai localStorage, tapi ini safety net.
 */
export default function LocalStorageSync() {
  useEffect(() => {
    const syncStorage = () => {
      if (typeof window === "undefined") return;

      const hasCookie = document.cookie
        .split("; ")
        .some((cookie) => cookie.startsWith("token="));
      const hasLocalStorage = localStorage.getItem("token");

      if (!hasCookie && hasLocalStorage) {
        // Cookie hilang (logout dari app lain), bersihkan localStorage
        console.log("[LocalStorageSync] Cookie hilang, hapus localStorage");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
      }
    };

    // Check saat mount
    syncStorage();

    // Check setiap 2 detik (untuk detect logout dari tab/app lain)
    const interval = setInterval(syncStorage, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
