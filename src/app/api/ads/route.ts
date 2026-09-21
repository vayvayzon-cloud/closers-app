import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { currentYearMonth } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = readDb();
  const { year: cy, month: cm } = currentYearMonth();
  const year = Number(req.nextUrl.searchParams.get("year")) || cy;
  const month = Number(req.nextUrl.searchParams.get("month")) || cm;
  let spends = db.adSpends.filter((a) => a.year === year && a.month === month);
  if (user.role === "closer") {
    spends = spends.filter((a) => a.closerId === user.id);
  }
  const enriched = spends.map((a) => {
    const closer = db.users.find((u) => u.id === a.closerId);
    return { ...a, closerName: closer?.name || "—" };
  });
  return NextResponse.json({ adSpends: enriched, year, month });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  const closerId = String(body.closerId || "");
  const { year: cy, month: cm } = currentYearMonth();
  const year = Number(body.year) || cy;
  const month = Number(body.month) || cm;
  const budget = Number(body.budget) || 0;
  const spend = Number(body.spend) || 0;
  const notes = String(body.notes || "").trim();
  if (!closerId) return NextResponse.json({ error: "Closer requerido" }, { status: 400 });

  let result = null;
  updateDb((d) => {
    const existing = d.adSpends.find(
      (a) => a.closerId === closerId && a.year === year && a.month === month
    );
    const now = new Date().toISOString();
    if (existing) {
      existing.budget = budget;
      existing.spend = spend;
      existing.notes = notes;
      existing.updatedAt = now;
      result = existing;
    } else {
      const row = {
        id: uuid(),
        closerId,
        year,
        month,
        budget,
        spend,
        notes,
        updatedAt: now,
      };
      d.adSpends.push(row);
      result = row;
    }
  });
  return NextResponse.json({ adSpend: result });
}
