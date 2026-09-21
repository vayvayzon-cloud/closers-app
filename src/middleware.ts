import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "closers_session";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/registro";
  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/closer");

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && token) {
    // Let client / home redirect by role — send to home
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/closer/:path*", "/login", "/registro"],
};
