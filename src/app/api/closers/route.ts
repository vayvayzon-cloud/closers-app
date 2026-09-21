import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";

export async function GET() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const db = readDb();
  const closers = db.users
    .filter((u) => u.role === "closer")
    .map(publicUser)
    .map((c) => {
      const assignment = db.assignments.find((a) => a.closerId === c.id);
      const product = assignment
        ? db.products.find((p) => p.id === assignment.productId)
        : null;
      return {
        ...c,
        assignment: assignment || null,
        product: product || null,
      };
    });
  return NextResponse.json({ closers });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "closer123");
  if (!name || !email) {
    return NextResponse.json({ error: "Nombre y email requeridos" }, { status: 400 });
  }
  const db = readDb();
  if (db.users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const closer = {
    id: uuid(),
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    name,
    role: "closer" as const,
    phone,
    active: true,
    createdAt: now,
  };
  updateDb((d) => {
    d.users.push(closer);
  });
  return NextResponse.json({ closer: publicUser(closer) }, { status: 201 });
}
