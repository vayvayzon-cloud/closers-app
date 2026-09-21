# SUMMARY — Closers App MVP

## 1. Absolute path
`/workspace/closers-app`

## 2. How to run + demo logins
```bash
cd /workspace/closers-app
npm install
npm run dev
# Dev server: http://localhost:3000 (already running)
```

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@demo.com | admin123 |
| Closer | closer1@demo.com | closer123 |
| Closer | closer2@demo.com | closer123 |
| Closer | closer3@demo.com | closer123 |

## 3. Screens
- **Login** (`/login`)
- **Admin:** Dashboard, Closers (list + detail), Productos, Pedidos, Ads/Presupuesto, Finanzas
- **Closer:** Dashboard, Mis pedidos, Liquidación, Calendario

## 4. Liquidación math
`Liquidación = Σ ganancia(pedidos estado=entregado del mes) − gasto ads del mes`

Verified with closer1 seed: entregados 16.000 − ads 98.500 = **−82.500**. Pendiente/pagado/rechazado do not count.

## 5. Blockers
None. Used JSON persistence (`data/db.json`) instead of Prisma/SQLite due to Prisma 8 requiring Node ≥22 (box has Node 20). Seed runs automatically on first boot.
