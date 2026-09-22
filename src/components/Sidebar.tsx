"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  Megaphone,
  Calendar,
  LogOut,
  Target,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

const closerNav: NavItem[] = [
  { href: "/closer", label: "Panel", icon: LayoutDashboard },
  { href: "/closer/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/closer/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/closer/productos", label: "Productos", icon: Package },
  { href: "/closer/calendario", label: "Calendario", icon: Calendar },
];

type CloserMini = { id: string; name: string; active: boolean };

export function Sidebar({
  role,
  userName,
}: {
  role: "admin" | "closer";
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [closers, setClosers] = useState<CloserMini[]>([]);
  const [closersOpen, setClosersOpen] = useState(true);

  useEffect(() => {
    if (role !== "admin") return;
    let cancelled = false;
    async function poll() {
      try {
        const r = await fetch("/api/orders/pending-queue");
        if (!r.ok) return;
        const j = await r.json();
        if (!cancelled) setPendingCount(j.count || 0);
      } catch {
        /* ignore */
      }
    }
    poll();
    const t = setInterval(poll, 9000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [role]);

  useEffect(() => {
    if (role !== "admin") return;
    fetch("/api/closers")
      .then((r) => r.json())
      .then((j) => {
        setClosers((j.closers || []).filter((c: CloserMini) => c.active));
      })
      .catch(() => {});
  }, [role]);

  useEffect(() => {
    if (pathname.startsWith("/admin/closers")) setClosersOpen(true);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function linkClass(active: boolean) {
    return cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      active
        ? "bg-orange-500/15 text-orange-400"
        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
    );
  }

  function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
      <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
        {children}
      </p>
    );
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-surface-border bg-surface-200">
      <div className="flex items-center gap-2.5 border-b border-surface-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-black">
          <Target className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Closers</p>
          <p className="text-[10px] uppercase tracking-wider text-orange-400">
            {role === "admin" ? "Admin" : "Panel Closer"}
          </p>
        </div>
        {role === "admin" && pendingCount > 0 && (
          <span
            title={`${pendingCount} pedidos para cargar`}
            className="shrink-0 rounded-full bg-orange-500 text-black text-[11px] font-bold min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center"
          >
            {pendingCount}
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {role === "admin" ? (
          <>
            <SectionLabel>Menú</SectionLabel>
            <Link
              href="/admin"
              className={linkClass(pathname === "/admin")}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="flex-1">Panel principal</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-orange-500 text-black text-[10px] font-bold min-w-[1.1rem] h-4 px-1 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setClosersOpen((v) => !v)}
              className={cn(
                linkClass(
                  pathname.startsWith("/admin/closers")
                ),
                "w-full"
              )}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">Closers</span>
              {closersOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {closersOpen && (
              <div className="ml-3 space-y-0.5 border-l border-surface-border pl-2">
                <Link
                  href="/admin/closers"
                  className={cn(
                    "flex items-center rounded-lg px-2.5 py-1.5 text-xs transition",
                    pathname === "/admin/closers"
                      ? "text-orange-400"
                      : "text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  Ver todos
                </Link>
                {closers.map((c) => {
                  const href = `/admin/closers/${c.id}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={c.id}
                      href={href}
                      className={cn(
                        "flex items-center rounded-lg px-2.5 py-1.5 text-xs truncate transition",
                        active
                          ? "bg-orange-500/10 text-orange-400"
                          : "text-zinc-500 hover:text-zinc-200"
                      )}
                      title={c.name}
                    >
                      {c.name}
                    </Link>
                  );
                })}
                {closers.length === 0 && (
                  <p className="px-2.5 py-1 text-[11px] text-zinc-600">
                    Sin closers activos
                  </p>
                )}
              </div>
            )}

            <Link
              href="/admin/pedidos"
              className={linkClass(
                pathname.startsWith("/admin/pedidos")
              )}
            >
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span className="flex-1">Pedidos</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-orange-500 text-black text-[10px] font-bold min-w-[1.1rem] h-4 px-1 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/productos"
              className={linkClass(
                pathname.startsWith("/admin/productos")
              )}
            >
              <Package className="h-4 w-4 shrink-0" />
              Productos
            </Link>

            <Link
              href="/admin/finanzas"
              className={linkClass(
                pathname.startsWith("/admin/finanzas")
              )}
            >
              <Wallet className="h-4 w-4 shrink-0" />
              Finanzas
            </Link>

            <Link
              href="/admin/ads"
              className={linkClass(pathname.startsWith("/admin/ads"))}
            >
              <Megaphone className="h-4 w-4 shrink-0" />
              Publicidad
            </Link>

            <Link
              href="/admin/config"
              className={linkClass(
                pathname.startsWith("/admin/config")
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Configuración
            </Link>
          </>
        ) : (
          closerNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/closer" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(active)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })
        )}
      </nav>

      <div className="border-t border-surface-border p-4">
        <p className="mb-2 truncate text-xs text-zinc-500">{userName}</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
