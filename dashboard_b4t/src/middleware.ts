import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  
  const hasAnyAuthCookie =
    req.cookies.get("laravel_session") ||
    req.cookies.get("token"); 

  if (!hasAnyAuthCookie) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

