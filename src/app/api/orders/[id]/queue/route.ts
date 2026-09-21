import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import type { AdminQueueStatus } from "@/lib/types";

const VALID: AdminQueueStatus[] = ["cargado", "descartado"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const status = body.status as AdminQueueStatus;
  if (!VALID.includes(status)) {
    return NextResponse.json(
      { error: "Estado inválido. Usá cargado o descartado." },
      { status: 400 }
    );
  }
  let order = null;
  await updateDb((d) => {
    const idx = d.orders.findIndex((o) => o.id === params.id);
    if (idx === -1) return;
    d.orders[idx].adminQueueStatus = status;
    d.orders[idx].updatedAt = new Date().toISOString();
    order = d.orders[idx];
  });
  if (!order) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
