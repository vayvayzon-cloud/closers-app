"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Modal,
  Input,
  Select,
  EmptyState,
} from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatDateTime } from "@/lib/utils";

type Order = {
  id: string;
  nombre: string;
  apellido: string;
  direccion: string;
  localidad: string;
  codigoPostal: string;
  montoPedido: number;
  gananciaCloser: number;
  estado: string;
  createdAt: string;
};

const emptyForm = {
  nombre: "",
  apellido: "",
  direccion: "",
  localidad: "",
  codigoPostal: "",
  montoPedido: "",
  gananciaCloser: "",
  estado: "pendiente",
};

export default function CloserPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [defaultGanancia, setDefaultGanancia] = useState("");

  async function load() {
    const [o, d] = await Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/dashboard").then((r) => r.json()),
    ]);
    setOrders(o.orders || []);
    if (d.assignment?.gananciaFija) {
      setDefaultGanancia(String(d.assignment.gananciaFija));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm({ ...emptyForm, gananciaCloser: defaultGanancia });
    setOpen(true);
  }

  function openEdit(o: Order) {
    setEditId(o.id);
    setForm({
      nombre: o.nombre,
      apellido: o.apellido,
      direccion: o.direccion,
      localidad: o.localidad,
      codigoPostal: o.codigoPostal,
      montoPedido: String(o.montoPedido),
      gananciaCloser: String(o.gananciaCloser),
      estado: o.estado,
    });
    setOpen(true);
  }

  async function save() {
    const payload = {
      ...form,
      montoPedido: Number(form.montoPedido) || 0,
      gananciaCloser: Number(form.gananciaCloser) || 0,
    };
    if (editId) {
      await fetch(`/api/orders/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setOpen(false);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Mis pedidos"
        subtitle="Cargá y seguí tus cierres"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo pedido
          </Button>
        }
      />

      <Card className="overflow-x-auto p-0">
        {orders.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Todavía no tenés pedidos" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase text-zinc-500">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Localidad</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Ganancia</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-100/50">
                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                    {formatDateTime(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">
                      {o.nombre} {o.apellido}
                    </p>
                    <p className="text-[11px] text-zinc-500">{o.direccion}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {o.localidad} ({o.codigoPostal})
                  </td>
                  <td className="px-4 py-3 font-medium">{formatMoney(o.montoPedido)}</td>
                  <td className="px-4 py-3 text-orange-400">
                    {formatMoney(o.gananciaCloser)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar pedido" : "Nuevo pedido"}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <Input
              label="Apellido"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            />
          </div>
          <Input
            label="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Localidad"
              value={form.localidad}
              onChange={(e) => setForm({ ...form, localidad: e.target.value })}
            />
            <Input
              label="Código postal"
              value={form.codigoPostal}
              onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monto pedido"
              type="number"
              value={form.montoPedido}
              onChange={(e) => setForm({ ...form, montoPedido: e.target.value })}
            />
            <Input
              label="Ganancia"
              type="number"
              value={form.gananciaCloser}
              onChange={(e) =>
                setForm({ ...form, gananciaCloser: e.target.value })
              }
            />
          </div>
          <Select
            label="Estado"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="entregado">Entregado</option>
            <option value="rechazado">Rechazado</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
