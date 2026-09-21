"use client";

import { Badge } from "./ui";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={ORDER_STATUS_COLORS[status] || "bg-zinc-700 text-zinc-300"}>
      {ORDER_STATUS_LABELS[status] || status}
    </Badge>
  );
}
