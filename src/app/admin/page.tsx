"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ShoppingCart, DollarSign, Wallet, Megaphone } from "lucide-react";
import { PageHeader, KpiCard, Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDateTime, monthLabel } from "@/lib/utils";

type Dash = {
  year: number;
  month: number;
  kpis: {
    closersCount: number;
    ordersThisMonth: number;
    grossSales: number;
    pendingLiquidations: number;
    totalAdSpend: number;
  };
  liquidaciones: Array<{
    closerId: string;
    closerName: string;
    liquidacion: number;
    pedidosMes: number;
    facturacion: number;
    entregadosGanancia: number;
    adSpend: number;
  }>;
  recentOrders: Array<{
    id: string;
    nombre: string;
    apellido: string;
    montoPedido: number;
    estado: string;
    createdAt: string;
    closerName: string;
  }>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-zinc-500 py-20 text-center">Cargando dashboard…</div>;
  }

  const { kpis } = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Resumen de ${monthLabel(data.year, data.month)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-8">
        <KpiCard
          title="Closers activos"
          value={String(kpis.closersCount)}
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="Pedidos del mes"
          value={String(kpis.ordersThisMonth)}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <KpiCard
          title="Ventas brutas"
          value={formatMoney(kpis.grossSales)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="Liq. pendientes"
          value={String(kpis.pendingLiquidations)}
          subtitle="Closers con entregados"
          icon={<Wallet className="h-5 w-5" />}
        />
        <KpiCard
          title="Gasto ads"
          value={formatMoney(kpis.totalAdSpend)}
          icon={<Megaphone className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Liquidaciones del mes
          </h2>
          {data.liquidaciones.length === 0 ? (
            <EmptyState message="Sin closers" />
          ) : (
            <div className="space-y-3">
              {data.liquidaciones.map((l) => (
                <Link
                  key={l.closerId}
                  href={`/admin/closers/${l.closerId}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-100 px-4 py-3 hover:border-orange-500/40 transition"
                >
                  <div>
                    <p className="font-medium text-white">{l.closerName}</p>
                    <p className="text-xs text-zinc-500">
                      {l.pedidosMes} pedidos · gan. entregados {formatMoney(l.entregadosGanancia)} − ads{" "}
                      {formatMoney(l.adSpend)}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      l.liquidacion >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {formatMoney(l.liquidacion)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Pedidos recientes
          </h2>
          {data.recentOrders.length === 0 ? (
            <EmptyState message="Sin pedidos" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-zinc-500">
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Closer</th>
                    <th className="pb-2 font-medium">Monto</th>
                    <th className="pb-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5">
                        <p className="text-zinc-100">
                          {o.nombre} {o.apellido}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {formatDateTime(o.createdAt)}
                        </p>
                      </td>
                      <td className="py-2.5 text-zinc-400">{o.closerName}</td>
                      <td className="py-2.5 font-medium">{formatMoney(o.montoPedido)}</td>
                      <td className="py-2.5">
                        <StatusBadge status={o.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
