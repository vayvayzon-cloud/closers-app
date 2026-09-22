import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { normalizeProduct } from "@/lib/normalize";
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

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = await readDb();
  const products = [...db.products].sort((a, b) => {
    const ar = a.topRank ?? 999;
    const br = b.topRank ?? 999;
    if (ar !== br) return ar - br;
    return a.name.localeCompare(b.name);
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const images = parseImages(body.images);
  if (Array.isArray(body.images) && body.images.length > 5) {
    return NextResponse.json({ error: "Máximo 5 imágenes" }, { status: 400 });
  }

  const precioVenta =
    body.precioVenta !== undefined
      ? Number(body.precioVenta) || 0
      : Number(body.price) || 0;
  const topRank = parseTopRank(body.topRank);

  const product = normalizeProduct({
    id: uuid(),
    name,
    description: String(body.description || "").trim(),
    price: precioVenta,
    images,
    fichaTecnica: String(body.fichaTecnica || ""),
    precioProveedor: Number(body.precioProveedor) || 0,
    precioVenta,
    gananciaCloser: Number(body.gananciaCloser) || 0,
    topRank,
    active: true,
    createdAt: new Date().toISOString(),
  });

  await updateDb((d) => {
    enforceUniqueTopRank(d.products, product.id, product.topRank);
    d.products.push(product);
  });
  return NextResponse.json({ product }, { status: 201 });
}
