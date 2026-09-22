import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

const VALID: OrderStatus[] = ["pendiente", "pagado", "entregado", "rechazado"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = await readDb();
  const existing = db.orders.find((o) => o.id === params.id);
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (user.role === "closer" && existing.closerId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  if (user.role === "closer" && body.estado !== undefined) {
    const next = body.estado as string;
    if (next === "entregado" || next === "rechazado") {
      return NextResponse.json(
        { error: "Solo admin puede marcar entregado/rechazado" },
        { status: 403 }
      );
    }
  }

  let order = null;
  await updateDb((d) => {
    const idx = d.orders.findIndex((o) => o.id === params.id);
    if (idx === -1) return;
    const o = d.orders[idx];
    const fields = [
      "nombre",
      "apellido",
      "direccion",
      "localidad",
      "codigoPostal",
      "producto",
    ] as const;
    for (const f of fields) {
      if (body[f] !== undefined) o[f] = String(body[f]).trim();
    }
    if (body.productId !== undefined) {
      o.productId = body.productId ? String(body.productId) : undefined;
    }
    if (body.montoPedido !== undefined) o.montoPedido = Number(body.montoPedido) || 0;
    if (body.gananciaCloser !== undefined)
      o.gananciaCloser = Number(body.gananciaCloser) || 0;
    if (body.costoFleteRechazo !== undefined)
      o.costoFleteRechazo = Number(body.costoFleteRechazo) || 0;

    if (body.estado !== undefined && VALID.includes(body.estado)) {
      const nextEstado = body.estado as OrderStatus;
      o.estado = nextEstado;

      if (nextEstado === "entregado" && !(Number(o.gananciaCloser) > 0)) {
        const assignment = o.productId
          ? d.assignments.find(
              (a) => a.closerId === o.closerId && a.productId === o.productId
            )
          : d.assignments.find((a) => a.closerId === o.closerId);
        const product = o.productId
          ? d.products.find((p) => p.id === o.productId)
          : assignment
            ? d.products.find((p) => p.id === assignment.productId)
            : null;
        o.gananciaCloser =
          assignment?.gananciaFija ?? product?.gananciaCloser ?? o.gananciaCloser;
      }

      if (nextEstado === "rechazado") {
        if (body.costoFleteRechazo !== undefined) {
          o.costoFleteRechazo = Number(body.costoFleteRechazo) || 0;
        } else if (!(Number(o.costoFleteRechazo) > 0)) {
          const pct = d.settings?.defaultRejectionFeePercent ?? 10;
          o.costoFleteRechazo = Math.round((o.montoPedido * pct) / 100);
        }
      }
    }

    if (user.role === "admin" && body.closerId) {
      o.closerId = String(body.closerId);
    }
    o.updatedAt = new Date().toISOString();
    order = o;
  });
  return NextResponse.json({ order });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  let found = false;
  await updateDb((d) => {
    const before = d.orders.length;
    d.orders = d.orders.filter((o) => o.id !== params.id);
    found = d.orders.length < before;
  });
  if (!found) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
