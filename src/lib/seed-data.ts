import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import type { Database } from "./types";

function daysAgo(n: number, hour = 14, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function seedDatabase(): Database {
  const now = new Date().toISOString();
  const { year, month } = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  const adminId = uuid();
  const closer1Id = uuid();
  const closer2Id = uuid();
  const closer3Id = uuid();

  const product1Id = uuid();
  const product2Id = uuid();
  const product3Id = uuid();

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const users = [
    {
      id: adminId,
      email: "admin@demo.com",
      passwordHash: hash("admin123"),
      name: "Admin Demo",
      role: "admin" as const,
      phone: "+54 11 5555-0000",
      active: true,
      createdAt: now,
    },
    {
      id: closer1Id,
      email: "closer1@demo.com",
      passwordHash: hash("closer123"),
      name: "María González",
      role: "closer" as const,
      phone: "+54 11 4444-1001",
      active: true,
      createdAt: now,
    },
    {
      id: closer2Id,
      email: "closer2@demo.com",
      passwordHash: hash("closer123"),
      name: "Carlos Rodríguez",
      role: "closer" as const,
      phone: "+54 11 4444-1002",
      active: true,
      createdAt: now,
    },
    {
      id: closer3Id,
      email: "closer3@demo.com",
      passwordHash: hash("closer123"),
      name: "Lucía Fernández",
      role: "closer" as const,
      phone: "+54 11 4444-1003",
      active: true,
      createdAt: now,
    },
  ];

  const products = [
    {
      id: product1Id,
      name: "Kit Skincare Premium",
      description: "Set completo de cuidado facial",
      price: 45000,
      active: true,
      createdAt: now,
    },
    {
      id: product2Id,
      name: "Suplemento Vitamina D3",
      description: "Frasco 60 cápsulas",
      price: 28000,
      active: true,
      createdAt: now,
    },
    {
      id: product3Id,
      name: "Auriculares Bluetooth Pro",
      description: "Cancelación de ruido activa",
      price: 65000,
      active: true,
      createdAt: now,
    },
  ];

  const assignments = [
    {
      id: uuid(),
      closerId: closer1Id,
      productId: product1Id,
      gananciaFija: 8000,
      createdAt: now,
    },
    {
      id: uuid(),
      closerId: closer2Id,
      productId: product2Id,
      gananciaFija: 5500,
      createdAt: now,
    },
    {
      id: uuid(),
      closerId: closer3Id,
      productId: product3Id,
      gananciaFija: 12000,
      createdAt: now,
    },
  ];

  const adSpends = [
    {
      id: uuid(),
      closerId: closer1Id,
      year,
      month,
      budget: 150000,
      spend: 98500,
      notes: "Meta Ads + Google",
      updatedAt: now,
    },
    {
      id: uuid(),
      closerId: closer2Id,
      year,
      month,
      budget: 120000,
      spend: 74200,
      notes: "Meta Ads",
      updatedAt: now,
    },
    {
      id: uuid(),
      closerId: closer3Id,
      year,
      month,
      budget: 180000,
      spend: 112000,
      notes: "Meta + TikTok",
      updatedAt: now,
    },
  ];

  const orders = [
    // María - closer1
    {
      id: uuid(),
      closerId: closer1Id,
      nombre: "Ana",
      apellido: "Pérez",
      direccion: "Av. Corrientes 1234",
      localidad: "CABA",
      codigoPostal: "1043",
      montoPedido: 45000,
      gananciaCloser: 8000,
      estado: "entregado" as const,
      createdAt: daysAgo(2, 10, 15),
      updatedAt: daysAgo(1, 16, 0),
    },
    {
      id: uuid(),
      closerId: closer1Id,
      nombre: "Juan",
      apellido: "López",
      direccion: "Calle Falsa 123",
      localidad: "La Plata",
      codigoPostal: "1900",
      montoPedido: 45000,
      gananciaCloser: 8000,
      estado: "entregado" as const,
      createdAt: daysAgo(5, 11, 30),
      updatedAt: daysAgo(3, 12, 0),
    },
    {
      id: uuid(),
      closerId: closer1Id,
      nombre: "Sofía",
      apellido: "Martínez",
      direccion: "San Martín 890",
      localidad: "Rosario",
      codigoPostal: "2000",
      montoPedido: 45000,
      gananciaCloser: 8000,
      estado: "pagado" as const,
      createdAt: daysAgo(1, 15, 45),
      updatedAt: daysAgo(1, 15, 45),
    },
    {
      id: uuid(),
      closerId: closer1Id,
      nombre: "Diego",
      apellido: "Ruiz",
      direccion: "Belgrano 456",
      localidad: "Córdoba",
      codigoPostal: "5000",
      montoPedido: 45000,
      gananciaCloser: 8000,
      estado: "pendiente" as const,
      createdAt: daysAgo(0, 9, 20),
      updatedAt: daysAgo(0, 9, 20),
    },
    {
      id: uuid(),
      closerId: closer1Id,
      nombre: "Valentina",
      apellido: "Castro",
      direccion: "Mitre 221",
      localidad: "Mendoza",
      codigoPostal: "5500",
      montoPedido: 45000,
      gananciaCloser: 8000,
      estado: "rechazado" as const,
      createdAt: daysAgo(8, 18, 0),
      updatedAt: daysAgo(7, 10, 0),
    },
    // Carlos - closer2
    {
      id: uuid(),
      closerId: closer2Id,
      nombre: "Pedro",
      apellido: "Sánchez",
      direccion: "Rivadavia 1500",
      localidad: "CABA",
      codigoPostal: "1406",
      montoPedido: 28000,
      gananciaCloser: 5500,
      estado: "entregado" as const,
      createdAt: daysAgo(3, 12, 0),
      updatedAt: daysAgo(1, 14, 0),
    },
    {
      id: uuid(),
      closerId: closer2Id,
      nombre: "Camila",
      apellido: "Díaz",
      direccion: "Lavalle 300",
      localidad: "Mar del Plata",
      codigoPostal: "7600",
      montoPedido: 28000,
      gananciaCloser: 5500,
      estado: "entregado" as const,
      createdAt: daysAgo(6, 16, 30),
      updatedAt: daysAgo(4, 11, 0),
    },
    {
      id: uuid(),
      closerId: closer2Id,
      nombre: "Martín",
      apellido: "Torres",
      direccion: "Alsina 88",
      localidad: "Bahía Blanca",
      codigoPostal: "8000",
      montoPedido: 28000,
      gananciaCloser: 5500,
      estado: "pagado" as const,
      createdAt: daysAgo(0, 13, 10),
      updatedAt: daysAgo(0, 13, 10),
    },
    {
      id: uuid(),
      closerId: closer2Id,
      nombre: "Florencia",
      apellido: "Vargas",
      direccion: "Sarmiento 45",
      localidad: "Tucumán",
      codigoPostal: "4000",
      montoPedido: 28000,
      gananciaCloser: 5500,
      estado: "pendiente" as const,
      createdAt: daysAgo(1, 17, 0),
      updatedAt: daysAgo(1, 17, 0),
    },
    // Lucía - closer3
    {
      id: uuid(),
      closerId: closer3Id,
      nombre: "Nicolás",
      apellido: "Herrera",
      direccion: "Av. Santa Fe 2200",
      localidad: "CABA",
      codigoPostal: "1425",
      montoPedido: 65000,
      gananciaCloser: 12000,
      estado: "entregado" as const,
      createdAt: daysAgo(4, 10, 0),
      updatedAt: daysAgo(2, 15, 0),
    },
    {
      id: uuid(),
      closerId: closer3Id,
      nombre: "Agustina",
      apellido: "Morales",
      direccion: "Italia 700",
      localidad: "Neuquén",
      codigoPostal: "8300",
      montoPedido: 65000,
      gananciaCloser: 12000,
      estado: "entregado" as const,
      createdAt: daysAgo(7, 14, 20),
      updatedAt: daysAgo(5, 9, 0),
    },
    {
      id: uuid(),
      closerId: closer3Id,
      nombre: "Federico",
      apellido: "Ramos",
      direccion: "Urquiza 333",
      localidad: "Salta",
      codigoPostal: "4400",
      montoPedido: 65000,
      gananciaCloser: 12000,
      estado: "entregado" as const,
      createdAt: daysAgo(9, 11, 45),
      updatedAt: daysAgo(6, 16, 0),
    },
    {
      id: uuid(),
      closerId: closer3Id,
      nombre: "Julieta",
      apellido: "Acosta",
      direccion: "España 120",
      localidad: "Córdoba",
      codigoPostal: "5000",
      montoPedido: 65000,
      gananciaCloser: 12000,
      estado: "pagado" as const,
      createdAt: daysAgo(0, 19, 0),
      updatedAt: daysAgo(0, 19, 0),
    },
    {
      id: uuid(),
      closerId: closer3Id,
      nombre: "Tomás",
      apellido: "Giménez",
      direccion: "Paraguay 900",
      localidad: "CABA",
      codigoPostal: "1057",
      montoPedido: 65000,
      gananciaCloser: 12000,
      estado: "pendiente" as const,
      createdAt: daysAgo(2, 8, 30),
      updatedAt: daysAgo(2, 8, 30),
    },
  ];

  return {
    users,
    products,
    assignments,
    adSpends,
    orders,
    sessions: [],
    seeded: true,
  };
}
