import { NextRequest, NextResponse } from "next/server";
import { login, publicUser, COOKIE_NAME, SESSION_DAYS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }
    const result = login(email, password);
    if (!result) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }
    const res = NextResponse.json({ user: publicUser(result.user) });
    res.cookies.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
