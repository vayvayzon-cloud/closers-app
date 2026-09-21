import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import type { Order, AdSpend } from "./types";

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: es });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: es });
  } catch {
    return iso;
  }
}

export function currentYearMonth(date = new Date()) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function ordersInMonth(orders: Order[], year: number, month: number): Order[] {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return orders.filter((o) => {
    const d = parseISO(o.createdAt);
    return isWithinInterval(d, { start, end });
  });
}

export function getAdSpend(
  spends: AdSpend[],
  closerId: string,
  year: number,
  month: number
): AdSpend | undefined {
  return spends.find(
    (a) => a.closerId === closerId && a.year === year && a.month === month
  );
}

/** Liquidación = sum(ganancia of entregados) − gasto ads del mes */
export function calcLiquidacion(
  orders: Order[],
  adSpend: number
): { entregadosGanancia: number; adSpend: number; liquidacion: number; countEntregados: number } {
  const entregados = orders.filter((o) => o.estado === "entregado");
  const entregadosGanancia = entregados.reduce((s, o) => s + o.gananciaCloser, 0);
  return {
    entregadosGanancia,
    adSpend,
    liquidacion: entregadosGanancia - adSpend,
    countEntregados: entregados.length,
  };
}

export function monthLabel(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return format(d, "MMMM yyyy", { locale: es });
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  entregado: "Entregado",
  rechazado: "Rechazado",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  pagado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  entregado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rechazado: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
