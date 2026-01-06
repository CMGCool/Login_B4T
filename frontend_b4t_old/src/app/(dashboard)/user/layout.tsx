import type { ReactNode } from "react";
import UserSidebar from "@/components/layouts/UserSidebar";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <div className="w-[260px] shrink-0">
          <UserSidebar />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
