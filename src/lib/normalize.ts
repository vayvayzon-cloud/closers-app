import type {
  AppSettings,
  Database,
  Order,
  Product,
  User,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function normalizeUser(u: Partial<User> & { id: string; email: string }): User {
  const firstName =
    u.firstName !== undefined && u.firstName !== null
      ? String(u.firstName)
      : splitName(u.name || "").firstName;
  const lastName =
    u.lastName !== undefined && u.lastName !== null
      ? String(u.lastName)
      : splitName(u.name || "").lastName;
  const name =
    u.name && String(u.name).trim()
      ? String(u.name)
      : `${firstName} ${lastName}`.trim();
  return {
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash || "",
    name,
    firstName: firstName || "",
    lastName: lastName || "",
    address: u.address !== undefined && u.address !== null ? String(u.address) : "",
    dni: u.dni !== undefined && u.dni !== null ? String(u.dni) : "",
    role: (u.role as User["role"]) || "closer",
    phone: u.phone,
    active: u.active !== undefined ? Boolean(u.active) : true,
    createdAt: u.createdAt || new Date().toISOString(),
  };
}

export function normalizeProduct(
  p: Partial<Product> & { id: string; name: string }
): Product {
  const precioVenta =
    p.precioVenta !== undefined && p.precioVenta !== null
      ? Number(p.precioVenta) || 0
      : Number(p.price) || 0;
  let images: string[] = [];
  if (Array.isArray(p.images)) {
    images = p.images.map(String).filter(Boolean).slice(0, 5);
  }
  let topRank: number | null = null;
  if (p.topRank !== undefined && p.topRank !== null && p.topRank !== ("" as unknown)) {
    const n = Number(p.topRank);
    if (Number.isFinite(n) && n >= 1 && n <= 10) topRank = Math.round(n);
  }
  return {
    id: p.id,
    name: String(p.name || ""),
    description: p.description !== undefined && p.description !== null ? String(p.description) : "",
    price: precioVenta,
    images,
    fichaTecnica:
      p.fichaTecnica !== undefined && p.fichaTecnica !== null
        ? String(p.fichaTecnica)
        : "",
    precioProveedor: Number(p.precioProveedor) || 0,
    precioVenta,
    gananciaCloser: Number(p.gananciaCloser) || 0,
    topRank,
    active: p.active !== undefined ? Boolean(p.active) : true,
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

export function normalizeOrder(o: Partial<Order> & { id: string; closerId: string }): Order {
  return {
    id: o.id,
    closerId: o.closerId,
    nombre: o.nombre || "",
    apellido: o.apellido || "",
    direccion: o.direccion || "",
    localidad: o.localidad || "",
    codigoPostal: o.codigoPostal || "",
    montoPedido: Number(o.montoPedido) || 0,
    gananciaCloser: Number(o.gananciaCloser) || 0,
    estado: (o.estado as Order["estado"]) || "pendiente",
    producto: o.producto !== undefined && o.producto !== null ? String(o.producto) : "",
    productId: o.productId,
    createdBy: o.createdBy === "closer" || o.createdBy === "admin" ? o.createdBy : "admin",
    adminQueueStatus:
      o.adminQueueStatus === "pendiente_carga" ||
      o.adminQueueStatus === "cargado" ||
      o.adminQueueStatus === "descartado"
        ? o.adminQueueStatus
        : "cargado",
    costoFleteRechazo: Number(o.costoFleteRechazo) || 0,
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt || o.createdAt || new Date().toISOString(),
  };
}

export function normalizeSettings(s?: Partial<AppSettings> | null): AppSettings {
  if (!s || typeof s !== "object") return { ...DEFAULT_SETTINGS };
  return {
    companyName:
      s.companyName !== undefined && s.companyName !== null
        ? String(s.companyName)
        : DEFAULT_SETTINGS.companyName,
    defaultRejectionFeePercent:
      s.defaultRejectionFeePercent !== undefined && s.defaultRejectionFeePercent !== null
        ? Number(s.defaultRejectionFeePercent) || 0
        : DEFAULT_SETTINGS.defaultRejectionFeePercent,
    notes: s.notes !== undefined && s.notes !== null ? String(s.notes) : "",
  };
}

/** Normalize missing fields so production Neon / old JSON data doesn't break. */
export function normalizeDatabase(db: Database): Database {
  return {
    ...db,
    users: (db.users || []).map((u) => normalizeUser(u)),
    orders: (db.orders || []).map((o) => normalizeOrder(o)),
    products: (db.products || []).map((p) =>
      normalizeProduct(p as Partial<Product> & { id: string; name: string })
    ),
    assignments: db.assignments || [],
    adSpends: db.adSpends || [],
    sessions: db.sessions || [],
    settings: normalizeSettings((db as Partial<Database>).settings),
    seeded: Boolean(db.seeded),
  };
}
