"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Card, KpiCard, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderCalendar } from "@/components/OrderCalendar";
import { formatMoney, formatDateTime, monthLabel } from "@/lib/utils";

export default function CloserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/closers/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data || data.error) {
    return (
      <div className="text-zinc-500 py-20 text-center">
        {data?.error || "Cargando…"}
      </div>
    );
  }

  const { closer, product, assignment, stats, monthOrders, year, month, daysWithOrders, adSpend } =
    data;

  return (
    <div>
      <Link
        href="/admin/closers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-orange-400"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a closers
      </Link>
      <PageHeader
        title={closer.name}
        subtitle={`${closer.email}${closer.phone ? ` · ${closer.phone}` : ""}${closer.dni ? ` · DNI ${closer.dni}` : ""}${closer.address ? ` · ${closer.address}` : ""}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard title="Pedidos del mes" value={String(stats.pedidosMes)} />
        <KpiCard title="Facturación bruta" value={formatMoney(stats.facturacionBruta)} />
        <KpiCard title="Gasto ads" value={formatMoney(stats.adSpend)} />
        <KpiCard
          title="Liquidación"
          value={formatMoney(stats.liquidacion)}
          subtitle="Entregados − ads"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Producto asignado
          </h3>
          <p className="text-lg font-semibold text-white">
            {product?.name || "Sin asignar"}
          </p>
          {assignment && (
            <p className="mt-1 text-orange-400">
              Ganancia fija: {formatMoney(assignment.gananciaFija)}
            </p>
          )}
        </Card>
        <Card>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Ads {monthLabel(year, month)}
          </h3>
          <p className="text-sm text-zinc-300">
            Presupuesto: {formatMoney(adSpend?.budget || 0)}
          </p>
          <p className="text-sm text-zinc-300">
            Gastado: {formatMoney(adSpend?.spend || 0)}
          </p>
          {adSpend?.notes && (
            <p className="mt-1 text-xs text-zinc-500">{adSpend.notes}</p>
          )}
        </Card>
        <Card>
          <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Fórmula liquidación
          </h3>
          <p className="text-sm text-zinc-300">
            Σ ganancia (entregado) − gasto ads
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {formatMoney(stats.entregadosGanancia)} − {formatMoney(stats.adSpend)} ={" "}
            <span className="text-orange-400 font-semibold">
              {formatMoney(stats.liquidacion)}
            </span>
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Calendario de actividad
          </h3>
          <OrderCalendar
            year={year}
            month={month}
            daysWithOrders={daysWithOrders || []}
          />
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Pedidos del mes ({monthOrders.length})
          </h3>
          {monthOrders.length === 0 ? (
            <EmptyState message="Sin pedidos este mes" />
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {monthOrders.map((o: any) => (
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
