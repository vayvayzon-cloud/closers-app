import { NextResponse } from "next/server";
import { logout, COOKIE_NAME, getSessionToken } from "@/lib/auth";

export async function POST() {
  const token = getSessionToken();
  if (token) logout(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
