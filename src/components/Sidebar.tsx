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
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ElementType };

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/closers", label: "Closers", icon: Users },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/ads", label: "Ads / Presupuesto", icon: Megaphone },
  { href: "/admin/finanzas", label: "Finanzas", icon: Wallet },
];

const closerNav: NavItem[] = [
  { href: "/closer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/closer/pedidos", label: "Mis pedidos", icon: ShoppingCart },
  { href: "/closer/liquidacion", label: "Liquidación", icon: Wallet },
  { href: "/closer/calendario", label: "Calendario", icon: Calendar },
];

export function Sidebar({
  role,
  userName,
}: {
  role: "admin" | "closer";
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "admin" ? adminNav : closerNav;
  const [pendingCount, setPendingCount] = useState(0);

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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
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

      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/closer" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;
          const showBadge = item.href === "/admin" && pendingCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="rounded-full bg-orange-500 text-black text-[10px] font-bold min-w-[1.1rem] h-4 px-1 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
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
