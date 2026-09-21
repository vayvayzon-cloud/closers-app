"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    dni: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrarse");
        return;
      }
      router.push("/closer");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute -right-32 top-1/4 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-black shadow-glow">
            <Target className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-white">Registro de closer</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Creá tu cuenta para empezar a cerrar ventas por WhatsApp
          </p>
        </div>

        <Card className="shadow-glow">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                required
                autoComplete="given-name"
              />
              <Input
                label="Apellido"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                required
                autoComplete="family-name"
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              autoComplete="new-password"
            />
            <Input
              label="Dirección"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              required
              autoComplete="street-address"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="DNI"
                value={form.dni}
                onChange={(e) => set("dni", e.target.value)}
                required
              />
              <Input
                label="Teléfono (opcional)"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+54 11 …"
                autoComplete="tel"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Registrando…" : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium">
              Iniciar sesión
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
