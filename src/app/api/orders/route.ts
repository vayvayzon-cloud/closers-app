import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

const VALID: OrderStatus[] = ["pendiente", "pagado", "entregado", "rechazado"];

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = readDb();
  const closerId = req.nextUrl.searchParams.get("closerId");
  let orders = db.orders;
  if (user.role === "closer") {
    orders = orders.filter((o) => o.closerId === user.id);
  } else if (closerId) {
    orders = orders.filter((o) => o.closerId === closerId);
  }
  orders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const withNames = orders.map((o) => {
    const closer = db.users.find((u) => u.id === o.closerId);
    return { ...o, closerName: closer?.name || "—" };
  });
  return NextResponse.json({ orders: withNames });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  let closerId = String(body.closerId || "");
  if (user.role === "closer") {
    closerId = user.id;
  }
  if (!closerId) {
    return NextResponse.json({ error: "Closer requerido" }, { status: 400 });
  }
  const db = readDb();
  const closer = db.users.find((u) => u.id === closerId && u.role === "closer");
  if (!closer) return NextResponse.json({ error: "Closer inválido" }, { status: 400 });

  const assignment = db.assignments.find((a) => a.closerId === closerId);
  const defaultGanancia = assignment?.gananciaFija ?? 0;

  const now = new Date().toISOString();
  const estado = (VALID.includes(body.estado) ? body.estado : "pendiente") as OrderStatus;
  const order = {
    id: uuid(),
    closerId,
    nombre: String(body.nombre || "").trim(),
    apellido: String(body.apellido || "").trim(),
    direccion: String(body.direccion || "").trim(),
    localidad: String(body.localidad || "").trim(),
    codigoPostal: String(body.codigoPostal || "").trim(),
    montoPedido: Number(body.montoPedido) || 0,
    gananciaCloser:
      body.gananciaCloser !== undefined && body.gananciaCloser !== ""
        ? Number(body.gananciaCloser)
        : defaultGanancia,
    estado,
    createdAt: now,
    updatedAt: now,
  };
  if (!order.nombre || !order.apellido) {
    return NextResponse.json({ error: "Nombre y apellido requeridos" }, { status: 400 });
  }
  updateDb((d) => {
    d.orders.push(order);
  });
  return NextResponse.json({ order }, { status: 201 });
}
