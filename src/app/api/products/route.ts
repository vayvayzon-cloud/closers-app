import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = readDb();
  return NextResponse.json({ products: db.products });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const price = Number(body.price) || 0;
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  const product = {
    id: uuid(),
    name,
    description,
    price,
    active: true,
    createdAt: new Date().toISOString(),
  };
  updateDb((d) => {
    d.products.push(product);
  });
  return NextResponse.json({ product }, { status: 201 });
}
