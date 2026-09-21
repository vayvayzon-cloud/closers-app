import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const closerId = String(body.closerId || "");
  const productId = String(body.productId || "");
  const gananciaFija = Number(body.gananciaFija) || 0;
  if (!closerId || !productId) {
    return NextResponse.json({ error: "Closer y producto requeridos" }, { status: 400 });
  }
  let assignment = null;
  updateDb((d) => {
    // One assignment per closer — replace if exists
    d.assignments = d.assignments.filter((a) => a.closerId !== closerId);
    assignment = {
      id: uuid(),
      closerId,
      productId,
      gananciaFija,
      createdAt: new Date().toISOString(),
    };
    d.assignments.push(assignment);
  });
  return NextResponse.json({ assignment }, { status: 201 });
}
