"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }
      if (data.user.role === "admin") router.push("/admin");
      else router.push("/closer");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  function fill(demo: "admin" | "closer1" | "closer2") {
    if (demo === "admin") {
      setEmail("admin@demo.com");
      setPassword("admin123");
    } else if (demo === "closer1") {
      setEmail("closer1@demo.com");
      setPassword("closer123");
    } else {
      setEmail("closer2@demo.com");
      setPassword("closer123");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-black shadow-glow">
            <Target className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-white">Closers App</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Gestión de emprendedores, pedidos y liquidaciones
          </p>
        </div>

        <Card className="shadow-glow">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="username"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-400">
            ¿Sos closer nuevo?{" "}
            <Link href="/registro" className="text-orange-400 hover:text-orange-300 font-medium">
              Registrate acá
            </Link>
          </p>

          <div className="mt-6 border-t border-surface-border pt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
              Accesos demo
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => fill("admin")}>
                Admin
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fill("closer1")}>
                Closer 1
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fill("closer2")}>
                Closer 2
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
