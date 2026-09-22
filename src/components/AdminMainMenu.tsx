"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  Megaphone,
  Settings,
  ChevronDown,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CloserMini = { id: string; name: string; active: boolean };

const SECTIONS: Array<{
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  match: (pathname: string) => boolean;
}> = [
  {
    href: "/admin",
    label: "Panel",
    description: "Dashboard principal",
    icon: LayoutDashboard,
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/closers",
    label: "Closers",
    description: "Listado de closers",
    icon: Users,
    match: (p) => p.startsWith("/admin/closers"),
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    description: "Cola y gestión",
    icon: ShoppingCart,
    match: (p) => p.startsWith("/admin/pedidos"),
  },
  {
    href: "/admin/productos",
    label: "Productos",
    description: "Catálogo",
    icon: Package,
    match: (p) => p.startsWith("/admin/productos"),
  },
  {
    href: "/admin/finanzas",
    label: "Finanzas",
    description: "Liquidaciones",
    icon: Wallet,
    match: (p) => p.startsWith("/admin/finanzas"),
  },
  {
    href: "/admin/ads",
    label: "Publicidad",
    description: "Gasto en ads",
    icon: Megaphone,
    match: (p) => p.startsWith("/admin/ads"),
  },
  {
    href: "/admin/config",
    label: "Configuración",
    description: "Ajustes del sistema",
    icon: Settings,
    match: (p) => p.startsWith("/admin/config"),
  },
];

export function AdminMainMenu({
  defaultOpen = true,
  className,
}: {
  defaultOpen?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);
  const [closersOpen, setClosersOpen] = useState(true);
  const [closers, setClosers] = useState<CloserMini[]>([]);

  useEffect(() => {
    fetch("/api/closers")
      .then((r) => r.json())
      .then((j) => {
        setClosers((j.closers || []).filter((c: CloserMini) => c.active));
      })
      .catch(() => {});
  }, []);

  return (
    <div
      className={cn(
        "mb-8 rounded-2xl border border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-surface-card shadow-sm overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-orange-500/5 transition"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-black shrink-0">
          <Menu className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">Menú principal</p>
          <p className="text-xs text-zinc-500">
            Acceso rápido a todas las secciones
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-orange-400 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-orange-500/20 px-5 pb-5 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const active = item.match(pathname);
              const isClosers = item.href === "/admin/closers";

              return (
                <div key={item.href} className="space-y-2">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition",
                      active
                        ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
                        : "border-surface-border bg-surface-100 text-zinc-200 hover:border-orange-500/40 hover:bg-zinc-800/40"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                        active
                          ? "bg-orange-500 text-black"
                          : "bg-zinc-800 text-orange-400"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-[11px] text-zinc-500">{item.description}</p>
                    </div>
                  </Link>

                  {isClosers && (
                    <div className="rounded-xl border border-surface-border bg-surface-100/60 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setClosersOpen((v) => !v)}
                        className="flex w-full items-center gap-2 text-left"
                      >
                        <Users className="h-3.5 w-3.5 text-orange-400" />
                        <span className="flex-1 text-xs font-medium text-zinc-300">
                          Closers activos
                          {closers.length > 0 && (
                            <span className="ml-1.5 text-zinc-500">
                              ({closers.length})
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-zinc-500 transition-transform",
                            closersOpen ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </button>
                      {closersOpen && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {closers.length === 0 ? (
                            <p className="text-[11px] text-zinc-600">
                              Sin closers activos
                            </p>
                          ) : (
                            closers.map((c) => {
                              const href = `/admin/closers/${c.id}`;
                              const chipActive = pathname === href;
                              return (
                                <Link
                                  key={c.id}
                                  href={href}
                                  title={c.name}
                                  className={cn(
                                    "inline-flex max-w-full truncate rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                                    chipActive
                                      ? "border-orange-500/50 bg-orange-500/20 text-orange-300"
                                      : "border-surface-border bg-zinc-900/60 text-zinc-400 hover:border-orange-500/40 hover:text-orange-300"
                                  )}
                                >
                                  {c.name}
                                </Link>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
