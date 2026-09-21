import type { Database, Order, User } from "./types";

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
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt || o.createdAt || new Date().toISOString(),
  };
}

/** Normalize missing fields so production Neon / old JSON data doesn't break. */
export function normalizeDatabase(db: Database): Database {
  return {
    ...db,
    users: (db.users || []).map((u) => normalizeUser(u)),
    orders: (db.orders || []).map((o) => normalizeOrder(o)),
    products: db.products || [],
    assignments: db.assignments || [],
    adSpends: db.adSpends || [],
    sessions: db.sessions || [],
    seeded: Boolean(db.seeded),
  };
}
