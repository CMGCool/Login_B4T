"use client";

import { useEffect } from "react";

export default function LocalStorageSync() {
  useEffect(() => {
    const sync = () => {
      if (typeof window === "undefined") return;
      const hasCookie = document.cookie.split("; ").some(c => c.startsWith("token="));
      const hasLS = localStorage.getItem("token");
      if (!hasCookie && hasLS) {
        localStorage.removeItem("token");
        // bisa hapus cache lain kalau perlu, misal profile
        // localStorage.removeItem("profile");
      }
    };
    sync();
    const id = setInterval(sync, 2000);
    return () => clearInterval(id);
  }, []);
  return null;
}
