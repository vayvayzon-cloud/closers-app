import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = await readDb();
  const closerId = req.nextUrl.searchParams.get("closerId");
  let assignments = db.assignments;
  if (user.role === "closer") {
    assignments = assignments.filter((a) => a.closerId === user.id);
  } else if (closerId) {
    assignments = assignments.filter((a) => a.closerId === closerId);
  }
  const withProducts = assignments.map((a) => ({
    ...a,
    product: db.products.find((p) => p.id === a.productId) || null,
  }));
  return NextResponse.json({ assignments: withProducts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  let closerId = String(body.closerId || "");
  if (user.role === "closer") {
    closerId = user.id;
  } else if (user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const productId = String(body.productId || "");
  if (!closerId || !productId) {
    return NextResponse.json({ error: "Closer y producto requeridos" }, { status: 400 });
  }

  const db = await readDb();
  const product = db.products.find((p) => p.id === productId && p.active);
  if (!product) {
    return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  }

  const gananciaFija =
    body.gananciaFija !== undefined && body.gananciaFija !== ""
      ? Number(body.gananciaFija) || 0
      : product.gananciaCloser || 0;

  let assignment = null;
  await updateDb((d) => {
    const existing = d.assignments.find(
      (a) => a.closerId === closerId && a.productId === productId
    );
    if (existing) {
      existing.gananciaFija = gananciaFija;
      assignment = existing;
    } else {
      assignment = {
        id: uuid(),
        closerId,
        productId,
        gananciaFija,
        createdAt: new Date().toISOString(),
      };
      d.assignments.push(assignment);
    }
  });
  return NextResponse.json({ assignment }, { status: 201 });
}
