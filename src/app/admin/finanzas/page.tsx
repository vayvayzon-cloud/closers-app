"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, KpiCard, EmptyState } from "@/components/ui";
import { formatMoney, monthLabel } from "@/lib/utils";

export default function FinanzasPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <div className="text-zinc-500 py-20 text-center">Cargando…</div>;
  }

  const liq = data.liquidaciones || [];
  const totalLiq = liq.reduce((s: number, l: any) => s + l.liquidacion, 0);
  const totalGan = liq.reduce((s: number, l: any) => s + l.entregadosGanancia, 0);
  const totalAds = liq.reduce((s: number, l: any) => s + l.adSpend, 0);
  const totalFact = liq.reduce((s: number, l: any) => s + l.facturacion, 0);

  return (
    <div>
      <PageHeader
        title="Finanzas"
        subtitle={`Totales consolidados — ${monthLabel(data.year, data.month)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KpiCard title="Facturación bruta" value={formatMoney(totalFact)} />
        <KpiCard title="Ganancias entregados" value={formatMoney(totalGan)} />
        <KpiCard title="Gasto ads" value={formatMoney(totalAds)} />
        <KpiCard title="Liquidación neta" value={formatMoney(totalLiq)} />
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Detalle por closer
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          Liquidación = ganancia entregados − ads − flete rechazo
        </p>
        {liq.length === 0 ? (
          <EmptyState message="Sin datos" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-zinc-500 border-b border-surface-border">
                  <th className="pb-3 font-medium">Closer</th>
                  <th className="pb-3 font-medium">Pedidos</th>
                  <th className="pb-3 font-medium">Facturación</th>
                  <th className="pb-3 font-medium">Gan. entregados</th>
                  <th className="pb-3 font-medium">Ads</th>
                  <th className="pb-3 font-medium">Flete rechazo</th>
                  <th className="pb-3 font-medium">Liquidación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {liq.map((l: any) => (
                  <tr key={l.closerId}>
                    <td className="py-3">
                      <Link
                        href={`/admin/closers/${l.closerId}`}
                        className="text-white hover:text-orange-400 font-medium"
                      >
                        {l.closerName}
                      </Link>
                    </td>
                    <td className="py-3 text-zinc-400">{l.pedidosMes}</td>
                    <td className="py-3">{formatMoney(l.facturacion)}</td>
                    <td className="py-3 text-emerald-400">
                      {formatMoney(l.entregadosGanancia)}
                    </td>
                    <td className="py-3 text-zinc-400">{formatMoney(l.adSpend)}</td>
                    <td className="py-3 text-red-400">{formatMoney(l.costoFleteRechazo || 0)}</td>
                    <td
                      className={`py-3 font-bold ${
                        l.liquidacion >= 0 ? "text-orange-400" : "text-red-400"
                      }`}
                    >
                      {formatMoney(l.liquidacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-surface-border font-semibold">
                  <td className="pt-3">Total</td>
                  <td className="pt-3">
                    {liq.reduce((s: number, l: any) => s + l.pedidosMes, 0)}
                  </td>
                  <td className="pt-3">{formatMoney(totalFact)}</td>
                  <td className="pt-3 text-emerald-400">{formatMoney(totalGan)}</td>
                  <td className="pt-3">{formatMoney(totalAds)}</td>
                  <td className="pt-3 text-orange-400">{formatMoney(totalLiq)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
