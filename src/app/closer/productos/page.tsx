"use client";

import { useEffect, useState } from "react";
import { Star, Check } from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  EmptyState,
  Modal,
} from "@/components/ui";
import { formatMoney } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string;
  images: string[];
  fichaTecnica: string;
  precioVenta: number;
  price: number;
  gananciaCloser: number;
  topRank: number | null;
  active: boolean;
};

export default function CloserProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const [p, a] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/assignments").then((r) => r.json()),
    ]);
    setProducts((p.products || []).filter((x: Product) => x.active));
    setAssignedIds(
      new Set((a.assignments || []).map((x: { productId: string }) => x.productId))
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function wantToSell(product: Product) {
    setBusy(product.id);
    setMsg("");
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        gananciaFija: product.gananciaCloser,
      }),
    });
    setBusy(null);
    if (res.ok) {
      setMsg(`Ahora vendés: ${product.name}`);
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error || "Error");
    }
  }

  const top = products
    .filter((p) => p.topRank != null)
    .sort((a, b) => (a.topRank || 0) - (b.topRank || 0));
  const rest = products.filter((p) => p.topRank == null);

  function ProductCard({ p, highlight }: { p: Product; highlight?: boolean }) {
    const assigned = assignedIds.has(p.id);
    return (
      <Card
        className={
          highlight
            ? "border-orange-500/40 ring-1 ring-orange-500/30"
            : undefined
        }
      >
        {p.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.images[0]}
            alt={p.name}
            className="mb-3 h-40 w-full rounded-xl object-cover bg-surface-100 cursor-pointer"
            onClick={() => setDetail(p)}
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-lg font-semibold text-white cursor-pointer hover:text-orange-400"
            onClick={() => setDetail(p)}
          >
            {p.name}
          </h3>
          {p.topRank != null && (
            <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 shrink-0">
              <Star className="h-3 w-3 mr-1" /> #{p.topRank}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{p.description}</p>
        <p className="mt-3 text-xl font-bold text-orange-400">
          {formatMoney(p.precioVenta ?? p.price)}
        </p>
        <p className="text-sm text-emerald-400">
          Tu ganancia: {formatMoney(p.gananciaCloser || 0)}
        </p>
        <div className="mt-4">
          {assigned ? (
            <Button variant="secondary" size="sm" disabled>
              <Check className="h-4 w-4" /> Ya lo vendés
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={busy === p.id}
              onClick={() => wantToSell(p)}
            >
              {busy === p.id ? "Guardando…" : "Quiero vender este"}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Catálogo activo — elegí qué querés vender"
      />
      {msg && (
        <p className="mb-4 text-sm text-orange-400">{msg}</p>
      )}

      {products.length === 0 ? (
        <EmptyState message="No hay productos activos" />
      ) : (
        <>
          {top.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-orange-400">
                <Star className="h-4 w-4" /> Top 10
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {top.map((p) => (
                  <ProductCard key={p.id} p={p} highlight />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Todos los productos
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name || ""}
      >
        {detail && (
          <div className="space-y-3">
            {detail.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detail.images[0]}
                alt={detail.name}
                className="h-48 w-full rounded-xl object-cover"
              />
            )}
            <p className="text-sm text-zinc-300">{detail.description}</p>
            <p className="text-orange-400 font-bold">
              {formatMoney(detail.precioVenta ?? detail.price)}
            </p>
            <p className="text-emerald-400 text-sm">
              Ganancia: {formatMoney(detail.gananciaCloser || 0)}
            </p>
            {detail.fichaTecnica && (
              <pre className="whitespace-pre-wrap rounded-xl bg-surface-100 p-3 text-xs text-zinc-300 font-sans">
                {detail.fichaTecnica}
              </pre>
            )}
            {!assignedIds.has(detail.id) && (
              <Button
                onClick={() => {
                  wantToSell(detail);
                  setDetail(null);
                }}
              >
                Quiero vender este
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
