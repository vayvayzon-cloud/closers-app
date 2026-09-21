import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const db = await readDb();
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
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const name =
    String(body.name || "").trim() ||
    `${firstName} ${lastName}`.trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phone = String(body.phone || "").trim();
  const address = String(body.address || "").trim();
  const dni = String(body.dni || "").trim();
  const password = String(body.password || "closer123");
  if (!name || !email) {
    return NextResponse.json({ error: "Nombre y email requeridos" }, { status: 400 });
  }
  const db = await readDb();
  if (db.users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const parts = name.split(/\s+/).filter(Boolean);
  const closer = {
    id: uuid(),
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    name,
    firstName: firstName || parts[0] || "",
    lastName: lastName || parts.slice(1).join(" ") || "",
    address,
    dni,
    role: "closer" as const,
    phone,
    active: true,
    createdAt: now,
  };
  await updateDb((d) => {
    d.users.push(closer);
  });
  return NextResponse.json({ closer: publicUser(closer) }, { status: 201 });
}
