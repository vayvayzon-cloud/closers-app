"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Wallet,
  Megaphone,
  Package,
} from "lucide-react";
import { PageHeader, KpiCard, Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderCalendar } from "@/components/OrderCalendar";
import { formatMoney, formatDateTime, monthLabel } from "@/lib/utils";

export default function CloserDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-zinc-500 py-20 text-center">Cargando…</div>;
  }

  const { kpis, product, assignment, year, month, daysWithOrders, recentOrders } =
    data;

  return (
    <div>
      <PageHeader
        title={`Hola, ${data.user?.name?.split(" ")[0] || "Closer"}`}
        subtitle={`Tu resumen de ${monthLabel(year, month)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <KpiCard
          title="Pedidos del mes"
          value={String(kpis.pedidosMes)}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <KpiCard
          title="Facturación bruta"
          value={formatMoney(kpis.facturacionBruta)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="Gasto ads"
          value={formatMoney(kpis.adSpend)}
          subtitle={`Presupuesto ${formatMoney(kpis.adBudget)}`}
          icon={<Megaphone className="h-5 w-5" />}
        />
        <KpiCard
          title="Liquidación"
          value={formatMoney(kpis.liquidacion)}
          subtitle="Solo entregados − ads"
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <Package className="h-4 w-4" />
            <h3 className="text-xs uppercase tracking-wider">Producto asignado</h3>
          </div>
          <p className="text-lg font-semibold text-white">
            {product?.name || "Sin asignar"}
          </p>
          {assignment && (
            <p className="mt-1 text-orange-400 font-medium">
              Ganancia fija: {formatMoney(assignment.gananciaFija)}
            </p>
          )}
          {product?.description && (
            <p className="mt-2 text-xs text-zinc-500">{product.description}</p>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-xs uppercase tracking-wider text-zinc-500">
            Preview liquidación
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-emerald-400">
              Gan. entregados: {formatMoney(kpis.entregadosGanancia)}
            </span>
            <span className="text-zinc-500">−</span>
            <span className="rounded-xl bg-zinc-800 border border-surface-border px-3 py-2 text-zinc-300">
              Ads: {formatMoney(kpis.adSpend)}
            </span>
            <span className="text-zinc-500">=</span>
            <span className="rounded-xl bg-orange-500/15 border border-orange-500/40 px-3 py-2 text-orange-400 font-bold text-base">
              {formatMoney(kpis.liquidacion)}
            </span>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Solo cuentan pedidos en estado <strong>entregado</strong>. Pendiente, pagado o
            rechazado no suman a la liquidación.
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Calendario
          </h3>
          <OrderCalendar
            year={year}
            month={month}
            daysWithOrders={daysWithOrders || []}
          />
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Pedidos recientes
          </h3>
          {!recentOrders?.length ? (
            <EmptyState message="Sin pedidos este mes" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-xl bg-surface-100 px-3 py-2"
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
                    <p className="text-sm font-medium">{formatMoney(o.montoPedido)}</p>
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
