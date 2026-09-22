import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { normalizeSettings } from "@/lib/normalize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const db = await readDb();
  return NextResponse.json({ settings: db.settings });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const body = await req.json();
  let settings = null;
  await updateDb((d) => {
    const next = {
      ...d.settings,
      ...(body.companyName !== undefined
        ? { companyName: String(body.companyName) }
        : {}),
      ...(body.defaultRejectionFeePercent !== undefined
        ? {
            defaultRejectionFeePercent:
              Number(body.defaultRejectionFeePercent) || 0,
          }
        : {}),
      ...(body.notes !== undefined ? { notes: String(body.notes) } : {}),
    };
    d.settings = normalizeSettings(next);
    settings = d.settings;
  });
  return NextResponse.json({ settings });
}
