"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, KpiCard, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDateTime, monthLabel } from "@/lib/utils";

export default function CloserFinanzasPage() {
  const [data, setData] = useState<any>(null);
  const [monthOrders, setMonthOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((r) => {
        const y = new Date().getFullYear();
        const m = new Date().getMonth() + 1;
        const filtered = (r.orders || []).filter((o: any) => {
          const d = new Date(o.createdAt);
          return d.getFullYear() === y && d.getMonth() + 1 === m;
        });
        setMonthOrders(filtered);
      });
  }, []);

  if (!data) {
    return <div className="text-zinc-500 py-20 text-center">Cargando…</div>;
  }

  const f = data.finanzas || {};
  const { year, month } = data;

  const entregados = monthOrders.filter((o) => o.estado === "entregado");
  const rechazados = monthOrders.filter((o) => o.estado === "rechazado");
  const enRuta = monthOrders.filter(
    (o) => o.estado === "pendiente" || o.estado === "pagado"
  );

  return (
    <div>
      <PageHeader
        title="Finanzas"
        subtitle={`Resumen de ${monthLabel(year, month)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <KpiCard
          title="Cantidad de pedidos"
          value={String(f.cantidadPedidos ?? monthOrders.length)}
        />
        <KpiCard
          title="Facturación bruta"
          value={formatMoney(f.facturacionBruta || 0)}
        />
        <KpiCard
          title="Pedidos en ruta"
          value={String(f.enRutaCount ?? enRuta.length)}
          subtitle={`Proyección ${formatMoney(f.enRutaMonto || 0)} · ganancia pot. ${formatMoney(f.enRutaGananciaPotencial || 0)}`}
        />
        <KpiCard
          title="Entregados"
          value={String(f.entregadosCount ?? entregados.length)}
          subtitle={`Ganancia ${formatMoney(f.entregadosGanancia || 0)}`}
        />
        <KpiCard
          title="Rechazados"
          value={String(f.rechazadosCount ?? rechazados.length)}
          subtitle={`Flete a pagar ${formatMoney(f.costoFleteRechazo || 0)}`}
        />
        <KpiCard
          title="Liquidación preview"
          value={formatMoney(f.liquidacion || 0)}
          subtitle="Ganancia − ads − flete rechazo"
        />
      </div>

      <Card className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Cómo se calcula
        </h2>
        <p className="text-zinc-300 text-sm leading-relaxed">
          <strong className="text-orange-400">Liquidación</strong> = ganancia de
          pedidos <strong>entregados</strong> − gasto de{" "}
          <strong>ads</strong> − <strong>costo flete rechazo</strong>.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-mono">
          <span className="rounded-lg bg-surface-100 px-3 py-2 text-emerald-400">
            {formatMoney(f.entregadosGanancia || 0)}
          </span>
          <span className="text-zinc-500">−</span>
          <span className="rounded-lg bg-surface-100 px-3 py-2 text-zinc-300">
            {formatMoney(f.adSpend || 0)}
          </span>
          <span className="text-zinc-500">−</span>
          <span className="rounded-lg bg-surface-100 px-3 py-2 text-red-400">
            {formatMoney(f.costoFleteRechazo || 0)}
          </span>
          <span className="text-zinc-500">=</span>
          <span className="rounded-lg bg-orange-500/20 border border-orange-500/40 px-3 py-2 text-orange-400 font-bold">
            {formatMoney(f.liquidacion || 0)}
          </span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Entregados del mes
          </h2>
          {entregados.length === 0 ? (
            <EmptyState message="Sin entregas este mes" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {entregados.map((o) => (
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
        <Card>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Rechazados (flete)
          </h2>
          {rechazados.length === 0 ? (
            <EmptyState message="Sin rechazos este mes" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {rechazados.map((o) => (
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
                    <p className="text-sm text-red-400 font-semibold">
                      −{formatMoney(o.costoFleteRechazo || 0)}
                    </p>
                    <StatusBadge status={o.estado} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
