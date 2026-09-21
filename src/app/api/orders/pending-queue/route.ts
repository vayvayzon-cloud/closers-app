import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const db = await readDb();
  const pending = db.orders
    .filter((o) => o.adminQueueStatus === "pendiente_carga")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => {
      const closer = db.users.find((u) => u.id === o.closerId);
      return {
        ...o,
        closerName: closer?.name || "—",
      };
    });
  return NextResponse.json({
    orders: pending,
    count: pending.length,
  });
}
