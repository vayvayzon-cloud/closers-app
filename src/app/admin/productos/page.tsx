"use client";

import { useEffect, useState } from "react";
import { Plus, Star } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Modal,
  Input,
  Textarea,
  Badge,
  EmptyState,
  Select,
} from "@/components/ui";
import { formatMoney } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  fichaTecnica: string;
  precioProveedor: number;
  precioVenta: number;
  gananciaCloser: number;
  topRank: number | null;
  active: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  fichaTecnica: "",
  precioProveedor: "",
  precioVenta: "",
  gananciaCloser: "",
  imagesText: "",
  topRank: "",
};

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    const r = await fetch("/api/products").then((x) => x.json());
    setProducts(r.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      fichaTecnica: p.fichaTecnica || "",
      precioProveedor: String(p.precioProveedor ?? 0),
      precioVenta: String(p.precioVenta ?? p.price ?? 0),
      gananciaCloser: String(p.gananciaCloser ?? 0),
      imagesText: (p.images || []).join("\n"),
      topRank: p.topRank != null ? String(p.topRank) : "",
    });
    setError("");
    setOpen(true);
  }

  async function save() {
    const images = form.imagesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (images.length > 5) {
      setError("Máximo 5 URLs de imágenes");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      fichaTecnica: form.fichaTecnica,
      precioProveedor: Number(form.precioProveedor) || 0,
      precioVenta: Number(form.precioVenta) || 0,
      gananciaCloser: Number(form.gananciaCloser) || 0,
      images,
      topRank: form.topRank === "" ? null : Number(form.topRank),
    };
    const res = editId
      ? await fetch(`/api/products/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Error al guardar");
      return;
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

  async function setTopRank(productId: string, rank: number | null) {
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topRank: rank }),
    });
    load();
  }

  const top10 = [...products]
    .filter((p) => p.topRank != null)
    .sort((a, b) => (a.topRank || 0) - (b.topRank || 0));

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Fichas técnicas, precios y Top 10"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nueva ficha
          </Button>
        }
      />

      <Card className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          <Star className="h-4 w-4 text-orange-400" /> Top 10
        </h2>
        {top10.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Todavía no hay productos destacados. Asigná un rank 1–10 al editar.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {top10.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-black">
                  {p.topRank}
                </span>
                <span className="text-sm text-white">{p.name}</span>
                <button
                  className="text-[11px] text-zinc-500 hover:text-red-400"
                  onClick={() => setTopRank(p.id, null)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {products.length === 0 ? (
        <EmptyState message="Sin productos" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id}>
              {p.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="mb-3 h-36 w-full rounded-xl object-cover bg-surface-100"
                />
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={
                      p.active
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-zinc-700/50 text-zinc-400 border-zinc-600"
                    }
                  >
                    {p.active ? "Activo" : "Inactivo"}
                  </Badge>
                  {p.topRank != null && (
                    <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30">
                      Top #{p.topRank}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                {p.description}
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-xl font-bold text-orange-400">
                  {formatMoney(p.precioVenta ?? p.price)}
                </p>
                <p className="text-zinc-500">
                  Proveedor: {formatMoney(p.precioProveedor || 0)}
                </p>
                <p className="text-emerald-400">
                  Ganancia closer: {formatMoney(p.gananciaCloser || 0)}
                </p>
              </div>
              <div className="mt-3">
                <Select
                  label="Top rank"
                  value={p.topRank != null ? String(p.topRank) : ""}
                  onChange={(e) =>
                    setTopRank(
                      p.id,
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Sin destacar</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      #{n}
                    </option>
                  ))}
                </Select>
              </div>
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
        title={editId ? "Editar ficha" : "Nueva ficha"}
      >
        <div className="space-y-3">
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Descripción corta"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Textarea
            label="Ficha técnica (markdown / texto)"
            value={form.fichaTecnica}
            onChange={(e) => setForm({ ...form, fichaTecnica: e.target.value })}
            rows={5}
          />
          <Textarea
            label="Imágenes (URLs, máx. 5 — una por línea)"
            value={form.imagesText}
            onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
            rows={3}
            placeholder="https://..."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Precio proveedor"
              type="number"
              value={form.precioProveedor}
              onChange={(e) =>
                setForm({ ...form, precioProveedor: e.target.value })
              }
            />
            <Input
              label="Precio venta"
              type="number"
              value={form.precioVenta}
              onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ganancia closer"
              type="number"
              value={form.gananciaCloser}
              onChange={(e) =>
                setForm({ ...form, gananciaCloser: e.target.value })
              }
            />
            <Select
              label="Top 10 rank"
              value={form.topRank}
              onChange={(e) => setForm({ ...form, topRank: e.target.value })}
            >
              <option value="">Sin destacar</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  #{n}
                </option>
              ))}
            </Select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
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
