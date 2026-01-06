import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Jangan render sidebar di sini.
  // Sidebar akan di-handle oleh layout per role:
  // - /(dashboard)/super-admin/layout.tsx
  // - /(dashboard)/admin/layout.tsx
  // - /(dashboard)/user/layout.tsx (kalau ada)
  return <>{children}</>;
}
