import type { ReactNode } from "react";
import SuperAdminSidebar from "@/components/layouts/Sidebar"; 
// ⚠️ kalau error, lihat catatan di bawah

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar Super Admin */}
        <div className="w-[260px] shrink-0">
          <SuperAdminSidebar />
        </div>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
