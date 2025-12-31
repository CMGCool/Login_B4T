import type { ReactNode } from "react";
import AdminSidebar from "@/components/layouts/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar admin */}
        <div className="w-[260px] shrink-0">
          <AdminSidebar />
        </div>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
