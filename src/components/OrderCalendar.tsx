"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function OrderCalendar({
  year,
  month,
  daysWithOrders,
}: {
  year: number;
  month: number;
  daysWithOrders: string[];
}) {
  const base = new Date(year, month - 1, 1);
  const start = startOfMonth(base);
  const end = endOfMonth(base);
  const days = eachDayOfInterval({ start, end });
  const set = new Set(daysWithOrders);
  // Monday-first offset
  const startDow = (getDay(start) + 6) % 7;
  const blanks = Array.from({ length: startDow });

  return (
    <div>
      <p className="mb-3 text-sm font-medium capitalize text-zinc-300">
        {format(base, "MMMM yyyy", { locale: es })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-1">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const has = set.has(key);
          return (
            <div
              key={key}
              title={has ? "Con pedidos" : "Sin pedidos"}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-xs font-medium border transition",
                has
                  ? "bg-orange-500/25 border-orange-500/50 text-orange-300"
                  : "bg-surface-100 border-transparent text-zinc-600",
                isToday(day) && "ring-1 ring-orange-500",
                !isSameMonth(day, base) && "opacity-30"
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-orange-500/40 border border-orange-500/50" />
          Con pedidos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-surface-100" />
          Sin pedidos
        </span>
      </div>
    </div>
  );
}
