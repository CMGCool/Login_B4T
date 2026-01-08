import "./globals.css";
import { Inter } from "next/font/google";
import LocalStorageSync from "@/components/LocalStorageSync";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased bg-white text-slate-900">
        <LocalStorageSync />
        {children}
      </body>
    </html>
  );
}
