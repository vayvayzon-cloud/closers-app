import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import type { Product } from "@/lib/types";

function parseImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 5);
}

function parseTopRank(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 10) return null;
  return Math.round(n);
}

function enforceUniqueTopRank(products: Product[], productId: string, rank: number | null) {
  if (rank === null) return;
  for (const p of products) {
    if (p.id !== productId && p.topRank === rank) {
      p.topRank = null;
    }
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  if (Array.isArray(body.images) && body.images.length > 5) {
    return NextResponse.json({ error: "Máximo 5 imágenes" }, { status: 400 });
  }
  let product = null;
  await updateDb((d) => {
    const idx = d.products.findIndex((p) => p.id === params.id);
    if (idx === -1) return;
    const p = d.products[idx];
    if (body.name !== undefined) p.name = String(body.name).trim();
    if (body.description !== undefined) p.description = String(body.description).trim();
    if (body.fichaTecnica !== undefined) p.fichaTecnica = String(body.fichaTecnica);
    if (body.precioProveedor !== undefined) p.precioProveedor = Number(body.precioProveedor) || 0;
    if (body.precioVenta !== undefined || body.price !== undefined) {
      const v =
        body.precioVenta !== undefined
          ? Number(body.precioVenta) || 0
          : Number(body.price) || 0;
      p.precioVenta = v;
      p.price = v;
    }
    if (body.gananciaCloser !== undefined) p.gananciaCloser = Number(body.gananciaCloser) || 0;
    if (body.images !== undefined) p.images = parseImages(body.images);
    if (body.topRank !== undefined) {
      p.topRank = parseTopRank(body.topRank);
      enforceUniqueTopRank(d.products, p.id, p.topRank);
    }
    if (body.active !== undefined) p.active = Boolean(body.active);
    product = p;
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
