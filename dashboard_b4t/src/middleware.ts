import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

  const token = req.cookies.get("token");
  const laravelSession = req.cookies.get("laravel_session");

  console.log("MiddleWare Check - Token:", token ? "YES" : "NO", "Session:", laravelSession ? "YES" : "NO");

  if (!token && !laravelSession) {
    console.log("Redirecting to login due to missing cookies");
    return NextResponse.redirect(
      new URL("/auth/Signin", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

