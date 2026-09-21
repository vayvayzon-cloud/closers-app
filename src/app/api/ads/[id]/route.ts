import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  let adSpend = null;
  updateDb((d) => {
    const idx = d.adSpends.findIndex((a) => a.id === params.id);
    if (idx === -1) return;
    if (body.budget !== undefined) d.adSpends[idx].budget = Number(body.budget) || 0;
    if (body.spend !== undefined) d.adSpends[idx].spend = Number(body.spend) || 0;
    if (body.notes !== undefined) d.adSpends[idx].notes = String(body.notes).trim();
    d.adSpends[idx].updatedAt = new Date().toISOString();
    adSpend = d.adSpends[idx];
  });
  if (!adSpend) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ adSpend });
}
