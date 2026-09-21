"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  closerId: string;
  closerName?: string;
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

type Closer = { id: string; name: string; active: boolean };

const emptyForm = {
  closerId: "",
  nombre: "",
  apellido: "",
  direccion: "",
  localidad: "",
  codigoPostal: "",
  montoPedido: "",
  gananciaCloser: "",
  estado: "pendiente",
};

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [closers, setClosers] = useState<Closer[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCloser, setFilterCloser] = useState("");

  async function load() {
    const q = filterCloser ? `?closerId=${filterCloser}` : "";
    const [o, c] = await Promise.all([
      fetch(`/api/orders${q}`).then((r) => r.json()),
      fetch("/api/closers").then((r) => r.json()),
    ]);
    setOrders(o.orders || []);
    setClosers((c.closers || []).filter((x: Closer) => x.active));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCloser]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(o: Order) {
    setEditId(o.id);
    setForm({
      closerId: o.closerId,
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

  async function remove(id: string) {
    if (!confirm("¿Eliminar este pedido?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle="Todos los pedidos de los closers"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo pedido
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select
          label="Filtrar por closer"
          value={filterCloser}
          onChange={(e) => setFilterCloser(e.target.value)}
        >
          <option value="">Todos</option>
          {closers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-x-auto p-0">
        {orders.length === 0 ? (
          <div className="p-6">
            <EmptyState message="Sin pedidos" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase text-zinc-500">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Localidad</th>
                <th className="px-4 py-3 font-medium">Closer</th>
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
                  <td className="px-4 py-3 text-zinc-300">{o.closerName}</td>
                  <td className="px-4 py-3 font-medium">{formatMoney(o.montoPedido)}</td>
                  <td className="px-4 py-3 text-orange-400">
                    {formatMoney(o.gananciaCloser)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(o.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
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
          <Select
            label="Closer"
            value={form.closerId}
            onChange={(e) => setForm({ ...form, closerId: e.target.value })}
          >
            <option value="">Seleccionar…</option>
            {closers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
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
              label="Ganancia closer"
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
