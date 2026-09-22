"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, Button, Input, Textarea } from "@/components/ui";

export default function AdminConfigPage() {
  const [form, setForm] = useState({
    companyName: "",
    defaultRejectionFeePercent: "10",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.settings) {
          setForm({
            companyName: j.settings.companyName || "",
            defaultRejectionFeePercent: String(
              j.settings.defaultRejectionFeePercent ?? 10
            ),
            notes: j.settings.notes || "",
          });
        }
      });
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.companyName,
        defaultRejectionFeePercent: Number(form.defaultRejectionFeePercent) || 0,
        notes: form.notes,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Ajustes generales de la empresa"
      />
      <Card className="max-w-xl space-y-4">
        <Input
          label="Nombre de la empresa"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        />
        <Input
          label="% flete rechazo por defecto"
          type="number"
          min={0}
          max={100}
          value={form.defaultRejectionFeePercent}
          onChange={(e) =>
            setForm({ ...form, defaultRejectionFeePercent: e.target.value })
          }
        />
        <p className="text-xs text-zinc-500 -mt-2">
          Se usa como sugerencia al marcar un pedido como rechazado (ARS = % del
          monto del pedido).
        </p>
        <Textarea
          label="Notas internas"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={4}
        />
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-400">Guardado</span>
          )}
        </div>
      </Card>
    </div>
  );
}
