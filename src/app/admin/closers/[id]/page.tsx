"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import {
  PageHeader,
  Card,
  KpiCard,
  EmptyState,
  Button,
  Input,
  Select,
  Modal,
} from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDateTime, monthLabel } from "@/lib/utils";

const emptyOrder = {
  nombre: "",
  apellido: "",
  direccion: "",
  localidad: "",
  codigoPostal: "",
  producto: "",
  productId: "",
  montoPedido: "",
  gananciaCloser: "",
  estado: "pendiente",
};

export default function CloserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    address: "",
    phone: "",
    active: true,
  });
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState(emptyOrder);
  const [products, setProducts] = useState<any[]>([]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectFee, setRejectFee] = useState("");
  const [assignGanancia, setAssignGanancia] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const load = useCallback(async () => {
    const [d, p] = await Promise.all([
      fetch(`/api/closers/${id}`).then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]);
    setData(d);
    setProducts((p.products || []).filter((x: any) => x.active));
    if (d.closer) {
      setProfile({
        firstName: d.closer.firstName || "",
        lastName: d.closer.lastName || "",
        dni: d.closer.dni || "",
        address: d.closer.address || "",
        phone: d.closer.phone || "",
        active: d.closer.active !== false,
      });
    }
    const g: Record<string, string> = {};
    (d.assignments || []).forEach((a: any) => {
      g[a.productId] = String(a.gananciaFija);
    });
    setAssignGanancia(g);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProfile() {
    setSavingProfile(true);
    await fetch(`/api/closers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSavingProfile(false);
    load();
  }

  async function createOrder() {
    const payload = {
      closerId: id,
      ...orderForm,
      montoPedido: Number(orderForm.montoPedido) || 0,
      gananciaCloser:
        orderForm.gananciaCloser === ""
          ? undefined
          : Number(orderForm.gananciaCloser),
      productId: orderForm.productId || undefined,
    };
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setOrderOpen(false);
    setOrderForm(emptyOrder);
    load();
  }

  async function changeEstado(orderId: string, estado: string, order?: any) {
    if (estado === "rechazado") {
      const pct = data?.settings?.defaultRejectionFeePercent ?? 10;
      const suggested = Math.round(((order?.montoPedido || 0) * pct) / 100);
      setRejectOrderId(orderId);
      setRejectFee(String(suggested));
      setRejectOpen(true);
      return;
    }
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    load();
  }

  async function confirmReject() {
    if (!rejectOrderId) return;
    await fetch(`/api/orders/${rejectOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: "rechazado",
        costoFleteRechazo: Number(rejectFee) || 0,
      }),
    });
    setRejectOpen(false);
    setRejectOrderId(null);
    load();
  }

  async function saveAssignment(productId: string) {
    const gananciaFija = Number(assignGanancia[productId]) || 0;
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closerId: id, productId, gananciaFija }),
    });
    load();
  }

  function onProductSelect(productId: string) {
    const p = products.find((x) => x.id === productId);
    const a = (data?.assignments || []).find(
      (x: any) => x.productId === productId
    );
    setOrderForm({
      ...orderForm,
      productId,
      producto: p?.name || "",
      montoPedido: p ? String(p.precioVenta ?? p.price) : orderForm.montoPedido,
      gananciaCloser: String(
        a?.gananciaFija ?? p?.gananciaCloser ?? orderForm.gananciaCloser
      ),
    });
  }

  if (!data || data.error) {
    return (
      <div className="text-zinc-500 py-20 text-center">
        {data?.error || "Cargando…"}
      </div>
    );
  }

  const {
    closer,
    stats,
    monthOrders,
    year,
    month,
    finanzas,
    assignments,
    orders,
  } = data;
  const allOrders = orders || monthOrders || [];

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
        subtitle={`${closer.email}${closer.phone ? ` · ${closer.phone}` : ""}`}
        actions={
          <Button
            onClick={() => {
              setOrderForm(emptyOrder);
              setOrderOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Cargar pedido
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard title="Pedidos del mes" value={String(stats.pedidosMes)} />
        <KpiCard
          title="Facturación bruta"
          value={formatMoney(stats.facturacionBruta)}
        />
        <KpiCard
          title="Entregados / Rechazos"
          value={`${finanzas?.entregadosCount ?? stats.countEntregados}/${finanzas?.rechazadosCount ?? 0}`}
          subtitle={`Flete ${formatMoney(finanzas?.costoFleteRechazo || 0)}`}
        />
        <KpiCard
          title="Liquidación"
          value={formatMoney(stats.liquidacion)}
          subtitle="Entregados − ads − flete"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Perfil
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />
              <Input
                label="Apellido"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />
            </div>
            <Input
              label="DNI"
              value={profile.dni}
              onChange={(e) => setProfile({ ...profile, dni: e.target.value })}
            />
            <Input
              label="Dirección"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />
            <Input
              label="Teléfono"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
            <Select
              label="Activo"
              value={profile.active ? "1" : "0"}
              onChange={(e) =>
                setProfile({ ...profile, active: e.target.value === "1" })
              }
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </Select>
            <Button onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? "Guardando…" : "Guardar perfil"}
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Productos asignados / ganancia
          </h3>
          {(assignments || []).length === 0 ? (
            <EmptyState message="Sin productos asignados" />
          ) : (
            <div className="space-y-3">
              {(assignments || []).map((a: any) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-end gap-2 rounded-xl bg-surface-100 p-3"
                >
                  <div className="flex-1 min-w-[120px]">
                    <p className="text-sm text-white">
                      {a.product?.name || a.productId}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Catálogo:{" "}
                      {formatMoney(a.product?.gananciaCloser || 0)}
                    </p>
                  </div>
                  <Input
                    label="Ganancia fija"
                    type="number"
                    className="w-28"
                    value={assignGanancia[a.productId] ?? String(a.gananciaFija)}
                    onChange={(e) =>
                      setAssignGanancia({
                        ...assignGanancia,
                        [a.productId]: e.target.value,
                      })
                    }
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => saveAssignment(a.productId)}
                  >
                    Guardar
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 border-t border-surface-border pt-4">
            <p className="text-xs text-zinc-500 mb-2">
              Asignar producto del catálogo
            </p>
            <Select
              label="Producto"
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const pid = e.target.value;
                const p = products.find((x) => x.id === pid);
                setAssignGanancia({
                  ...assignGanancia,
                  [pid]: String(p?.gananciaCloser || 0),
                });
                fetch("/api/assignments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    closerId: id,
                    productId: pid,
                    gananciaFija: p?.gananciaCloser || 0,
                  }),
                }).then(load);
              }}
            >
              <option value="">Agregar…</option>
              {products
                .filter(
                  (p) =>
                    !(assignments || []).some((a: any) => a.productId === p.id)
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </Select>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Resumen {monthLabel(year, month)}
        </h3>
        <p className="text-sm text-zinc-300">
          Entregados: {finanzas?.entregadosCount ?? 0} (
          {formatMoney(finanzas?.entregadosGanancia || 0)}) · Rechazados:{" "}
          {finanzas?.rechazadosCount ?? 0} (flete{" "}
          {formatMoney(finanzas?.costoFleteRechazo || 0)}) · Ads:{" "}
          {formatMoney(finanzas?.adSpend || 0)} · Liquidación:{" "}
          <span className="text-orange-400 font-semibold">
            {formatMoney(finanzas?.liquidacion || 0)}
          </span>
        </p>
      </Card>

      <Card className="overflow-x-auto p-0">
        <div className="px-4 py-3 border-b border-surface-border">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Pedidos ({allOrders.length})
          </h3>
        </div>
        {allOrders.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Sin pedidos" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase text-zinc-500">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Ganancia</th>
                <th className="px-4 py-3 font-medium">Flete</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {allOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-surface-100/50">
                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                    {formatDateTime(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {o.nombre} {o.apellido}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {o.producto || "—"}
                  </td>
                  <td className="px-4 py-3">{formatMoney(o.montoPedido)}</td>
                  <td className="px-4 py-3 text-orange-400">
                    {formatMoney(o.gananciaCloser)}
                  </td>
                  <td className="px-4 py-3 text-red-400">
                    {o.estado === "rechazado"
                      ? formatMoney(o.costoFleteRechazo || 0)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={o.estado} />
                      <select
                        className="rounded-lg border border-surface-border bg-surface-100 px-2 py-1 text-xs text-zinc-300"
                        value={o.estado}
                        onChange={(e) =>
                          changeEstado(o.id, e.target.value, o)
                        }
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="entregado">Entregado</option>
                        <option value="rechazado">Rechazado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title="Cargar pedido"
      >
        <div className="space-y-3">
          <Select
            label="Producto catálogo"
            value={orderForm.productId}
            onChange={(e) => onProductSelect(e.target.value)}
          >
            <option value="">Manual / texto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Input
            label="Producto (texto)"
            value={orderForm.producto}
            onChange={(e) =>
              setOrderForm({ ...orderForm, producto: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre"
              value={orderForm.nombre}
              onChange={(e) =>
                setOrderForm({ ...orderForm, nombre: e.target.value })
              }
            />
            <Input
              label="Apellido"
              value={orderForm.apellido}
              onChange={(e) =>
                setOrderForm({ ...orderForm, apellido: e.target.value })
              }
            />
          </div>
          <Input
            label="Dirección"
            value={orderForm.direccion}
            onChange={(e) =>
              setOrderForm({ ...orderForm, direccion: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Localidad"
              value={orderForm.localidad}
              onChange={(e) =>
                setOrderForm({ ...orderForm, localidad: e.target.value })
              }
            />
            <Input
              label="CP"
              value={orderForm.codigoPostal}
              onChange={(e) =>
                setOrderForm({ ...orderForm, codigoPostal: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monto"
              type="number"
              value={orderForm.montoPedido}
              onChange={(e) =>
                setOrderForm({ ...orderForm, montoPedido: e.target.value })
              }
            />
            <Input
              label="Ganancia closer"
              type="number"
              value={orderForm.gananciaCloser}
              onChange={(e) =>
                setOrderForm({ ...orderForm, gananciaCloser: e.target.value })
              }
            />
          </div>
          <Select
            label="Estado"
            value={orderForm.estado}
            onChange={(e) =>
              setOrderForm({ ...orderForm, estado: e.target.value })
            }
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="entregado">Entregado</option>
            <option value="rechazado">Rechazado</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOrderOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createOrder}>Crear</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Costo flete rechazo"
      >
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            Ingresá el costo de flete que se descuenta al closer (ARS). Sugerido
            según config: {data.settings?.defaultRejectionFeePercent ?? 10}% del
            monto.
          </p>
          <Input
            label="Costo flete rechazo (ARS)"
            type="number"
            value={rejectFee}
            onChange={(e) => setRejectFee(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              Marcar rechazado
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
