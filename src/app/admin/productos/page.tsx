"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Modal,
  Input,
  Textarea,
  Badge,
  EmptyState,
} from "@/components/ui";
import { formatMoney } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
};

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  async function load() {
    const r = await fetch("/api/products").then((x) => x.json());
    setProducts(r.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm({ name: "", description: "", price: "" });
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
    });
    setOpen(true);
  }

  async function save() {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
    };
    if (editId) {
      await fetch(`/api/products/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setOpen(false);
    load();
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Catálogo de productos a cerrar"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        }
      />

      {products.length === 0 ? (
        <EmptyState message="Sin productos" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <Badge
                  className={
                    p.active
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-zinc-700/50 text-zinc-400 border-zinc-600"
                  }
                >
                  {p.active ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{p.description}</p>
              <p className="mt-3 text-xl font-bold text-orange-400">
                {formatMoney(p.price)}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                  Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(p)}>
                  {p.active ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar producto" : "Nuevo producto"}
      >
        <div className="space-y-3">
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Precio (ARS)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
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
