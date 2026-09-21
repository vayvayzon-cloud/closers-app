import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import {
  COOKIE_NAME,
  SESSION_DAYS,
  publicUser,
} from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const firstName = String(body.firstName || body.nombre || "").trim();
    const lastName = String(body.lastName || body.apellido || "").trim();
    const address = String(body.address || body.direccion || "").trim();
    const dni = String(body.dni || "").trim();
    const phone = String(body.phone || body.telefono || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Nombre y apellido requeridos" },
        { status: 400 }
      );
    }
    if (!address) {
      return NextResponse.json(
        { error: "Dirección requerida" },
        { status: 400 }
      );
    }
    if (!dni) {
      return NextResponse.json({ error: "DNI requerido" }, { status: 400 });
    }

    const db = await readDb();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return NextResponse.json(
        { error: "Email ya registrado" },
        { status: 400 }
      );
    }

    const now = new Date();
    const expires = new Date(
      now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000
    );
    const token = uuid();
    const name = `${firstName} ${lastName}`.trim();
    const user = {
      id: uuid(),
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      name,
      firstName,
      lastName,
      address,
      dni,
      role: "closer" as const,
      phone: phone || undefined,
      active: true,
      createdAt: now.toISOString(),
    };

    await updateDb((d) => {
      d.users.push(user);
      d.sessions = d.sessions.filter((s) => new Date(s.expiresAt) > now);
      d.sessions.push({
        token,
        userId: user.id,
        createdAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      });
    });

    const res = NextResponse.json(
      { user: publicUser(user) },
      { status: 201 }
    );
    res.cookies.set(COOKIE_NAME, token, {
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
