"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Modal,
  Input,
  Select,
  Badge,
  EmptyState,
} from "@/components/ui";
import { formatMoney } from "@/lib/utils";

type Closer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  product?: { name: string } | null;
  assignment?: { gananciaFija: number } | null;
};

type Product = { id: string; name: string; active: boolean };

export default function ClosersPage() {
  const [closers, setClosers] = useState<Closer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "closer123",
    active: true,
  });
  const [assignForm, setAssignForm] = useState({
    closerId: "",
    productId: "",
    gananciaFija: "",
  });

  async function load() {
    const [c, p] = await Promise.all([
      fetch("/api/closers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]);
    setClosers(c.closers || []);
    setProducts((p.products || []).filter((x: Product) => x.active));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm({ name: "", email: "", phone: "", password: "closer123", active: true });
    setOpen(true);
  }

  function openEdit(c: Closer) {
    setEditId(c.id);
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      password: "",
      active: c.active,
    });
    setOpen(true);
  }

  async function save() {
    if (editId) {
      await fetch(`/api/closers/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/closers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setOpen(false);
    load();
  }

  async function saveAssign() {
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        closerId: assignForm.closerId,
        productId: assignForm.productId,
        gananciaFija: Number(assignForm.gananciaFija),
      }),
    });
    setAssignOpen(false);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Closers"
        subtitle="Emprendedores que cierran ventas"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setAssignForm({ closerId: "", productId: "", gananciaFija: "" });
                setAssignOpen(true);
              }}
            >
              Asignar producto
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Nuevo closer
            </Button>
          </>
        }
      />

      {closers.length === 0 ? (
        <EmptyState message="No hay closers. Creá el primero." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {closers.map((c) => (
            <Card key={c.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/admin/closers/${c.id}`}
                    className="text-lg font-semibold text-white hover:text-orange-400"
                  >
                    {c.name}
                  </Link>
                  <p className="text-sm text-zinc-400">{c.email}</p>
                  {c.phone && <p className="text-xs text-zinc-500">{c.phone}</p>}
                </div>
                <Badge
                  className={
                    c.active
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-zinc-700/50 text-zinc-400 border-zinc-600"
                  }
                >
                  {c.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="mt-4 rounded-xl bg-surface-100 p-3 text-sm">
                <p className="text-zinc-500 text-xs uppercase mb-1">Producto asignado</p>
                <p className="text-zinc-200">
                  {c.product?.name || "Sin asignar"}
                </p>
                {c.assignment && (
                  <p className="text-orange-400 font-medium mt-1">
                    Ganancia fija: {formatMoney(c.assignment.gananciaFija)}
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
                <Link href={`/admin/closers/${c.id}`}>
                  <Button variant="ghost" size="sm">
                    Ver detalle
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar closer" : "Nuevo closer"}
      >
        <div className="space-y-3">
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Teléfono / WhatsApp"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {!editId && (
            <Input
              label="Contraseña inicial"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          {editId && (
            <Select
              label="Estado"
              value={form.active ? "1" : "0"}
              onChange={(e) =>
                setForm({ ...form, active: e.target.value === "1" })
              }
            >
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </Select>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Asignar producto + ganancia fija"
      >
        <div className="space-y-3">
          <Select
            label="Closer"
            value={assignForm.closerId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, closerId: e.target.value })
            }
          >
            <option value="">Seleccionar…</option>
            {closers.filter((c) => c.active).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label="Producto"
            value={assignForm.productId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, productId: e.target.value })
            }
          >
            <option value="">Seleccionar…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Input
            label="Ganancia fija (ARS)"
            type="number"
            value={assignForm.gananciaFija}
            onChange={(e) =>
              setAssignForm({ ...assignForm, gananciaFija: e.target.value })
            }
            placeholder="8000"
          />
          <p className="text-xs text-zinc-500">
            La ganancia es un monto fijo por pedido cerrado, no un porcentaje.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveAssign}>Asignar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
