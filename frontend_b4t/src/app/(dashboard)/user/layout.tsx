import type { ReactNode } from "react";
import UserSidebar from "@/components/layouts/UserSidebar";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="flex h-full">
        <div
          className="shrink-0 h-full transition-[width] duration-300"
          style={{ width: "var(--sidebar-w, 280px)" }}
        >
          <UserSidebar />
        </div>
        <main className="flex-1 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
