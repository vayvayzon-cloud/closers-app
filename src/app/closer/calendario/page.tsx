"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { OrderCalendar } from "@/components/OrderCalendar";
import { formatDateTime, formatMoney, monthLabel } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";

export default function CalendarioPage() {
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((r) => {
        const y = new Date().getFullYear();
        const m = new Date().getMonth() + 1;
        setOrders(
          (r.orders || []).filter((o: any) => {
            const d = new Date(o.createdAt);
            return d.getFullYear() === y && d.getMonth() + 1 === m;
          })
        );
      });
  }, []);

  if (!data) {
    return <div className="text-zinc-500 py-20 text-center">Cargando…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Calendario"
        subtitle={`Días con y sin pedidos — ${monthLabel(data.year, data.month)}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <OrderCalendar
            year={data.year}
            month={data.month}
            daysWithOrders={data.daysWithOrders || []}
          />
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Actividad del mes
          </h3>
          {orders.length === 0 ? (
            <EmptyState message="Sin pedidos este mes" />
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {orders.map((o) => (
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
                    <p className="text-sm">{formatMoney(o.montoPedido)}</p>
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
