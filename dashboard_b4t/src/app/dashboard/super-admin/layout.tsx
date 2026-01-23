"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import SuperAdminSidebar from "@/components/layouts/Sidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar Super Admin (diam, tidak ikut scroll) */}
        <div className={`shrink-0 h-full transition-all duration-300 ${collapsed ? "w-[76px]" : "w-[280px]"}`}>
          <SuperAdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Content (yang scroll cuma ini) */}
        <main className="flex-1 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
