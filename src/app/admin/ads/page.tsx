"use client";

import { useEffect, useState } from "react";
import {
  PageHeader,
  Button,
  Card,
  Modal,
  Input,
  Select,
  Textarea,
  EmptyState,
} from "@/components/ui";
import { formatMoney, monthLabel } from "@/lib/utils";

type Ad = {
  id: string;
  closerId: string;
  closerName?: string;
  year: number;
  month: number;
  budget: number;
  spend: number;
  notes?: string;
};

type Closer = { id: string; name: string; active: boolean };

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [closers, setClosers] = useState<Closer[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    closerId: "",
    budget: "",
    spend: "",
    notes: "",
  });

  async function load() {
    const [a, c] = await Promise.all([
      fetch(`/api/ads?year=${year}&month=${month}`).then((r) => r.json()),
      fetch("/api/closers").then((r) => r.json()),
    ]);
    setAds(a.adSpends || []);
    setClosers((c.closers || []).filter((x: Closer) => x.active));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  function openCreate() {
    setEditId(null);
    setForm({ closerId: "", budget: "", spend: "", notes: "" });
    setOpen(true);
  }

  function openEdit(a: Ad) {
    setEditId(a.id);
    setForm({
      closerId: a.closerId,
      budget: String(a.budget),
      spend: String(a.spend),
      notes: a.notes || "",
    });
    setOpen(true);
  }

  async function save() {
    if (editId) {
      await fetch(`/api/ads/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: Number(form.budget) || 0,
          spend: Number(form.spend) || 0,
          notes: form.notes,
        }),
      });
    } else {
      await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          closerId: form.closerId,
          year,
          month,
          budget: Number(form.budget) || 0,
          spend: Number(form.spend) || 0,
          notes: form.notes,
        }),
      });
    }
    setOpen(false);
    load();
  }

  const totalBudget = ads.reduce((s, a) => s + a.budget, 0);
  const totalSpend = ads.reduce((s, a) => s + a.spend, 0);

  return (
    <div>
      <PageHeader
        title="Ads / Presupuesto"
        subtitle={`Inversión publicitaria — ${monthLabel(year, month)}`}
        actions={<Button onClick={openCreate}>Cargar / actualizar</Button>}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          label="Mes"
          value={String(month)}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {monthLabel(year, i + 1).split(" ")[0]}
            </option>
          ))}
        </Select>
        <Select
          label="Año"
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <Card>
          <p className="text-xs uppercase text-zinc-500">Presupuesto total</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatMoney(totalBudget)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-zinc-500">Gasto total</p>
          <p className="mt-1 text-2xl font-bold text-orange-400">{formatMoney(totalSpend)}</p>
        </Card>
      </div>

      {ads.length === 0 ? (
        <EmptyState message="Sin datos de ads para este mes" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((a) => (
            <Card key={a.id}>
              <h3 className="text-lg font-semibold text-white">{a.closerName}</h3>
              <div className="mt-3 space-y-1 text-sm">
                <p className="flex justify-between text-zinc-400">
                  <span>Presupuesto</span>
                  <span className="text-zinc-200">{formatMoney(a.budget)}</span>
                </p>
                <p className="flex justify-between text-zinc-400">
                  <span>Gastado</span>
                  <span className="text-orange-400 font-medium">
                    {formatMoney(a.spend)}
                  </span>
                </p>
                <div className="mt-2 h-2 rounded-full bg-surface-100 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${Math.min(100, a.budget ? (a.spend / a.budget) * 100 : 0)}%`,
                    }}
                  />
                </div>
                {a.notes && (
                  <p className="pt-2 text-xs text-zinc-500">{a.notes}</p>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => openEdit(a)}
              >
                Editar
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Editar ads" : "Cargar ads del mes"}
      >
        <div className="space-y-3">
          {!editId && (
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
          )}
          <Input
            label="Presupuesto (ARS)"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
          <Input
            label="Gasto real (ARS)"
            type="number"
            value={form.spend}
            onChange={(e) => setForm({ ...form, spend: e.target.value })}
          />
          <Textarea
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
