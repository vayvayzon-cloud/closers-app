import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  let product = null;
  await updateDb((d) => {
    const idx = d.products.findIndex((p) => p.id === params.id);
    if (idx === -1) return;
    if (body.name !== undefined) d.products[idx].name = String(body.name).trim();
    if (body.description !== undefined) d.products[idx].description = String(body.description).trim();
    if (body.price !== undefined) d.products[idx].price = Number(body.price) || 0;
    if (body.active !== undefined) d.products[idx].active = Boolean(body.active);
    product = d.products[idx];
  });
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ product });
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
    const idx = d.products.findIndex((p) => p.id === params.id);
    if (idx === -1) return;
    found = true;
    d.products[idx].active = false;
  });
  if (!found) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
