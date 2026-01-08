import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Daftar route dashboard yang memerlukan autentikasi
const protectedPrefixes = [
  "/(dashboard)",
  "/admin",
  "/super-admin",
  "/user",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((p) =>
    pathname.startsWith(p.replace(/[()]/g, ""))
  );

  if (!isProtected) return NextResponse.next();

  // Cek keberadaan cookie token (shared antar app)
  const token = req.cookies.get("token")?.value;
  if (!token) {
    // Redirect ke halaman login jika token tidak ada
    return NextResponse.redirect(new URL("/auth/Signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/user/:path*",
  ],
};
