export type Role = "admin" | "closer";
export type OrderStatus = "pendiente" | "pagado" | "entregado" | "rechazado";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
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
