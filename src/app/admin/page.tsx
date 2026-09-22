"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Wallet,
  Megaphone,
  Bell,
  Check,
  X,
} from "lucide-react";
import { PageHeader, KpiCard, Card, EmptyState, Button, Badge } from "@/components/ui";
import { AdminMainMenu } from "@/components/AdminMainMenu";
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

type QueueOrder = {
  id: string;
  closerName: string;
  nombre: string;
  apellido: string;
  producto: string;
  direccion: string;
  localidad: string;
  codigoPostal: string;
  montoPedido: number;
  createdAt: string;
};

const POLL_MS = 9000;

export default function AdminDashboard() {
  const [data, setData] = useState<Dash | null>(null);
  const [queue, setQueue] = useState<QueueOrder[]>([]);
  const [queueBusy, setQueueBusy] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    try {
      const r = await fetch("/api/orders/pending-queue");
      if (!r.ok) return;
      const j = await r.json();
      setQueue(j.orders || []);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
    loadQueue();
    const t = setInterval(loadQueue, POLL_MS);
    return () => clearInterval(t);
  }, [loadQueue]);

  async function setQueueStatus(id: string, status: "cargado" | "descartado") {
    setQueueBusy(id);
    try {
      await fetch(`/api/orders/${id}/queue`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadQueue();
    } finally {
      setQueueBusy(null);
    }
  }

  const { kpis } = data || { kpis: null };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          data
            ? `Resumen de ${monthLabel(data.year, data.month)}`
            : "Cargando resumen…"
        }
        actions={
          queue.length > 0 ? (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 text-sm px-3 py-1">
              <Bell className="h-3.5 w-3.5 inline mr-1.5" />
              {queue.length} pendiente{queue.length === 1 ? "" : "s"} de carga
            </Badge>
          ) : null
        }
      />

      <AdminMainMenu />

      {!data || !kpis ? (
        <div className="text-zinc-500 py-16 text-center">Cargando dashboard…</div>
      ) : (
        <>

      <Card className="mb-8 border-orange-500/30 bg-orange-500/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold text-white">
              Pedidos para cargar
            </h2>
            {queue.length > 0 && (
              <span className="ml-1 rounded-full bg-orange-500 text-black text-xs font-bold px-2 py-0.5">
                {queue.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">Actualización cada ~9s</p>
        </div>
        {queue.length === 0 ? (
          <EmptyState message="No hay pedidos pendientes de carga" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-zinc-500 border-b border-surface-border">
                  <th className="pb-2 pr-3 font-medium">Hora</th>
                  <th className="pb-2 pr-3 font-medium">Closer</th>
                  <th className="pb-2 pr-3 font-medium">Cliente</th>
                  <th className="pb-2 pr-3 font-medium">Producto</th>
                  <th className="pb-2 pr-3 font-medium">Dirección</th>
                  <th className="pb-2 pr-3 font-medium">Monto</th>
                  <th className="pb-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {queue.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-3 text-zinc-400 whitespace-nowrap">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="py-3 pr-3 text-orange-300 font-medium">
                      {o.closerName}
                    </td>
                    <td className="py-3 pr-3 text-white">
                      {o.nombre} {o.apellido}
                    </td>
                    <td className="py-3 pr-3 text-zinc-300">{o.producto || "—"}</td>
                    <td className="py-3 pr-3 text-zinc-400">
                      <p>{o.direccion}</p>
                      <p className="text-[11px]">
                        {o.localidad} ({o.codigoPostal})
                      </p>
                    </td>
                    <td className="py-3 pr-3 font-medium">
                      {formatMoney(o.montoPedido)}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          disabled={queueBusy === o.id}
                          onClick={() => setQueueStatus(o.id, "cargado")}
                        >
                          <Check className="h-3.5 w-3.5" /> Marcar cargado
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={queueBusy === o.id}
                          onClick={() => setQueueStatus(o.id, "descartado")}
                        >
                          <X className="h-3.5 w-3.5" /> Descartar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
        </>
      )}
    </div>
  );
}
