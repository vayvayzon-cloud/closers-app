import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { ordersInMonth, getAdSpend, calcLiquidacion, currentYearMonth } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (user.role !== "admin" && user.id !== params.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const db = await readDb();
  const closer = db.users.find((u) => u.id === params.id && u.role === "closer");
  if (!closer) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const { year, month } = currentYearMonth();
  const assignment = db.assignments.find((a) => a.closerId === closer.id);
  const product = assignment
    ? db.products.find((p) => p.id === assignment.productId)
    : null;
  const allOrders = db.orders.filter((o) => o.closerId === closer.id);
  const monthOrders = ordersInMonth(allOrders, year, month);
  const ad = getAdSpend(db.adSpends, closer.id, year, month);
  const liq = calcLiquidacion(monthOrders, ad?.spend || 0);

  // Calendar: days with orders this month
  const daysWithOrders = new Set(
    monthOrders.map((o) => o.createdAt.slice(0, 10))
  );

  return NextResponse.json({
    closer: publicUser(closer),
    assignment: assignment || null,
    product: product || null,
    orders: allOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    monthOrders,
    adSpend: ad || null,
    liquidacion: liq,
    year,
    month,
    daysWithOrders: Array.from(daysWithOrders),
    stats: {
      pedidosMes: monthOrders.length,
      facturacionBruta: monthOrders.reduce((s, o) => s + o.montoPedido, 0),
      ...liq,
    },
  });
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
  let updated = null;
  await updateDb((d) => {
    const idx = d.users.findIndex((u) => u.id === params.id && u.role === "closer");
    if (idx === -1) return;
    if (body.firstName !== undefined) d.users[idx].firstName = String(body.firstName).trim();
    if (body.lastName !== undefined) d.users[idx].lastName = String(body.lastName).trim();
    if (body.address !== undefined) d.users[idx].address = String(body.address).trim();
    if (body.dni !== undefined) d.users[idx].dni = String(body.dni).trim();
    if (body.name !== undefined) {
      d.users[idx].name = String(body.name).trim();
    } else if (body.firstName !== undefined || body.lastName !== undefined) {
      d.users[idx].name =
        `${d.users[idx].firstName || ""} ${d.users[idx].lastName || ""}`.trim();
    }
    if (body.email !== undefined) d.users[idx].email = String(body.email).trim().toLowerCase();
    if (body.phone !== undefined) d.users[idx].phone = String(body.phone).trim();
    if (body.active !== undefined) d.users[idx].active = Boolean(body.active);
    updated = publicUser(d.users[idx]);
  });
  if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ closer: updated });
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
    const idx = d.users.findIndex((u) => u.id === params.id && u.role === "closer");
    if (idx === -1) return;
    found = true;
    d.users[idx].active = false;
  });
  if (!found) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
