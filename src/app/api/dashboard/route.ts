import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import {
  currentYearMonth,
  ordersInMonth,
  getAdSpend,
  calcLiquidacion,
  calcFinanzasMes,
} from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = await readDb();
  const { year, month } = currentYearMonth();

  if (user.role === "admin") {
    const closers = db.users.filter((u) => u.role === "closer" && u.active);
    const monthOrders = ordersInMonth(db.orders, year, month);
    const grossSales = monthOrders.reduce((s, o) => s + o.montoPedido, 0);
    const totalAdSpend = db.adSpends
      .filter((a) => a.year === year && a.month === month)
      .reduce((s, a) => s + a.spend, 0);

    const liquidaciones = closers.map((c) => {
      const co = ordersInMonth(
        db.orders.filter((o) => o.closerId === c.id),
        year,
        month
      );
      const ad = getAdSpend(db.adSpends, c.id, year, month);
      const liq = calcLiquidacion(co, ad?.spend || 0);
      return {
        closerId: c.id,
        closerName: c.name,
        ...liq,
        pedidosMes: co.length,
        facturacion: co.reduce((s, o) => s + o.montoPedido, 0),
        adBudget: ad?.budget || 0,
      };
    });

    const pendingLiquidations = liquidaciones.filter((l) => l.countEntregados > 0).length;

    return NextResponse.json({
      role: "admin",
      year,
      month,
      kpis: {
        closersCount: closers.length,
        ordersThisMonth: monthOrders.length,
        grossSales,
        pendingLiquidations,
        totalAdSpend,
      },
      liquidaciones,
      recentOrders: [...db.orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8)
        .map((o) => ({
          ...o,
          closerName: db.users.find((u) => u.id === o.closerId)?.name || "—",
        })),
    });
  }

  // Closer dashboard
  const allOrders = db.orders.filter((o) => o.closerId === user.id);
  const monthOrders = ordersInMonth(allOrders, year, month);
  const ad = getAdSpend(db.adSpends, user.id, year, month);
  const liq = calcLiquidacion(monthOrders, ad?.spend || 0);
  const finanzas = calcFinanzasMes(monthOrders, ad?.spend || 0);
  const assignments = db.assignments.filter((a) => a.closerId === user.id);
  const assignment = assignments[0] || null;
  const product = assignment
    ? db.products.find((p) => p.id === assignment.productId)
    : null;
  const daysWithOrders = Array.from(
    new Set(monthOrders.map((o) => o.createdAt.slice(0, 10)))
  );

  return NextResponse.json({
    role: "closer",
    user: publicUser(user),
    year,
    month,
    kpis: {
      pedidosMes: monthOrders.length,
      facturacionBruta: monthOrders.reduce((s, o) => s + o.montoPedido, 0),
      adBudget: ad?.budget || 0,
      ...liq,
    },
    finanzas,
    assignment: assignment || null,
    assignments,
    product: product || null,
    daysWithOrders,
    recentOrders: monthOrders
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10),
  });
}
