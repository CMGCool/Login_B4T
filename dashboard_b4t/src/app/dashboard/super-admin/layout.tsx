import type { ReactNode } from "react";
import SuperAdminSidebar from "@/components/layouts/Sidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar Super Admin (diam, tidak ikut scroll) */}
        <div className="w-[260px] shrink-0 h-full">
          <SuperAdminSidebar />
        </div>

        {/* Content (yang scroll cuma ini) */}
        <main className="flex-1 h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
