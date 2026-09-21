"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, KpiCard, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDateTime, monthLabel } from "@/lib/utils";

export default function LiquidacionPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-zinc-500 py-20 text-center">Cargando…</div>;
  }

  const { kpis, year, month, recentOrders } = data;
  const entregados = (recentOrders || []).filter(
    (o: any) => o.estado === "entregado"
  );

  // Fetch full month orders for accurate list
  const [allOrders, setAllOrders] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((r) => {
        const y = new Date().getFullYear();
        const m = new Date().getMonth() + 1;
        const filtered = (r.orders || []).filter((o: any) => {
          const d = new Date(o.createdAt);
          return d.getFullYear() === y && d.getMonth() + 1 === m;
        });
        setAllOrders(filtered);
      });
  }, []);

  const entregadosMes = allOrders.filter((o) => o.estado === "entregado");

  return (
    <div>
      <PageHeader
        title="Liquidación"
        subtitle={`Preview de ${monthLabel(year, month)}`}
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <KpiCard
          title="Ganancias (entregados)"
          value={formatMoney(kpis.entregadosGanancia)}
          subtitle={`${kpis.countEntregados} pedidos`}
        />
        <KpiCard title="Gasto ads del mes" value={formatMoney(kpis.adSpend)} />
        <KpiCard
          title="Liquidación neta"
          value={formatMoney(kpis.liquidacion)}
        />
      </div>

      <Card className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Cómo se calcula
        </h2>
        <p className="text-zinc-300 text-sm leading-relaxed">
          <strong className="text-orange-400">Liquidación</strong> = suma de la{" "}
          <em>ganancia closer</em> de todos los pedidos en estado{" "}
          <strong>entregado</strong> del mes, menos el{" "}
          <strong>gasto de ads</strong> asignado a tu cuenta ese mes.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Los pedidos pendiente, pagado o rechazado <u>no</u> entran en el cálculo.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-mono">
          <span className="rounded-lg bg-surface-100 px-3 py-2 text-emerald-400">
            {formatMoney(kpis.entregadosGanancia)}
          </span>
          <span className="text-zinc-500">−</span>
          <span className="rounded-lg bg-surface-100 px-3 py-2 text-zinc-300">
            {formatMoney(kpis.adSpend)}
          </span>
          <span className="text-zinc-500">=</span>
          <span className="rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-2 text-orange-400 font-bold">
            {formatMoney(kpis.liquidacion)}
          </span>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Pedidos entregados del mes
        </h2>
        {entregadosMes.length === 0 ? (
          <EmptyState message="Todavía no hay pedidos entregados este mes" />
        ) : (
          <div className="space-y-2">
            {entregadosMes.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl bg-surface-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white">
                    {o.nombre} {o.apellido}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-400 font-semibold">
                    +{formatMoney(o.gananciaCloser)}
                  </p>
                  <StatusBadge status={o.estado} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
