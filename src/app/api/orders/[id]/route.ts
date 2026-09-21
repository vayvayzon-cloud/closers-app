import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

const VALID: OrderStatus[] = ["pendiente", "pagado", "entregado", "rechazado"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = readDb();
  const existing = db.orders.find((o) => o.id === params.id);
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (user.role === "closer" && existing.closerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  let order = null;
  updateDb((d) => {
    const idx = d.orders.findIndex((o) => o.id === params.id);
    if (idx === -1) return;
    const fields = [
      "nombre",
      "apellido",
      "direccion",
      "localidad",
      "codigoPostal",
    ] as const;
    for (const f of fields) {
      if (body[f] !== undefined) d.orders[idx][f] = String(body[f]).trim();
    }
    if (body.montoPedido !== undefined) d.orders[idx].montoPedido = Number(body.montoPedido) || 0;
    if (body.gananciaCloser !== undefined)
      d.orders[idx].gananciaCloser = Number(body.gananciaCloser) || 0;
    if (body.estado !== undefined && VALID.includes(body.estado)) {
      d.orders[idx].estado = body.estado;
    }
    if (user.role === "admin" && body.closerId) {
      d.orders[idx].closerId = String(body.closerId);
    }
    d.orders[idx].updatedAt = new Date().toISOString();
    order = d.orders[idx];
  });
  return NextResponse.json({ order });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  let found = false;
  updateDb((d) => {
    const before = d.orders.length;
    d.orders = d.orders.filter((o) => o.id !== params.id);
    found = d.orders.length < before;
  });
  if (!found) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
