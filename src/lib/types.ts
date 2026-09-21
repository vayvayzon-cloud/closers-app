export type Role = "admin" | "closer";
export type OrderStatus = "pendiente" | "pagado" | "entregado" | "rechazado";
export type CreatedBy = "closer" | "admin";
export type AdminQueueStatus = "pendiente_carga" | "cargado" | "descartado";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  dni: string;
  role: Role;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  createdAt: string;
}

export interface CloserAssignment {
  id: string;
  closerId: string;
  productId: string;
  gananciaFija: number; // fixed commission in ARS
  createdAt: string;
}

export interface AdSpend {
  id: string;
  closerId: string;
  year: number;
  month: number; // 1-12
  budget: number;
  spend: number;
  notes?: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  closerId: string;
  nombre: string;
  apellido: string;
  direccion: string;
  localidad: string;
  codigoPostal: string;
  montoPedido: number;
  gananciaCloser: number;
  estado: OrderStatus;
  producto: string;
  productId?: string;
  createdBy: CreatedBy;
  adminQueueStatus: AdminQueueStatus;
  createdAt: string; // ISO timestamp with date+time
  updatedAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Database {
  users: User[];
  products: Product[];
  assignments: CloserAssignment[];
  adSpends: AdSpend[];
  orders: Order[];
  sessions: Session[];
  seeded: boolean;
}
