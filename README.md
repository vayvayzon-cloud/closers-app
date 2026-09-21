# Closers App

MVP para gestionar **closers** (emprendedores de cierre de ventas), pedidos, presupuesto de ads y liquidaciones mensuales.

Diseñado para operaciones en Argentina (UI en español es-AR). El admin corre ads y manda tráfico por WhatsApp; los closers solo responden chats y cierran ventas.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Persistencia en JSON local (`data/db.json`) — sobrevive reinicios
- Auth simple con cookies de sesión + usuarios seed

## Cómo correr

```bash
cd /workspace/closers-app
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) (o el puerto que indique la consola).

La base se **siembra automáticamente** en el primer request si `data/db.json` no existe.

## Usuarios demo

| Rol    | Email              | Contraseña |
|--------|--------------------|------------|
| Admin  | admin@demo.com     | admin123   |
| Closer | closer1@demo.com   | closer123  |
| Closer | closer2@demo.com   | closer123  |
| Closer | closer3@demo.com   | closer123  |

## Roles

### Admin
- Dashboard con KPIs (closers, pedidos del mes, ventas brutas, liquidaciones, gasto ads)
- CRUD de closers
- Catálogo de productos + asignación a closer con **ganancia fija** (no %)
- Presupuesto y gasto de ads por closer/mes
- CRUD de pedidos
- Finanzas consolidadas
- Detalle por closer (pedidos, stats, ads, calendario)

### Closer
- Dashboard propio
- Preview de liquidación
- Listado y alta de pedidos
- Calendario de días con/sin pedidos
- Producto asignado + ganancia fija

## Fórmula de liquidación

```
Liquidación = Σ (ganancia de pedidos con estado "entregado") − gasto ads del mes
```

Solo los pedidos **entregado** suman. Pendiente / pagado / rechazado no entran.

## Estructura

```
src/
  app/           # Rutas App Router (admin + closer + API)
  components/    # UI compartida
  lib/           # DB, auth, tipos, seed, utils
data/
  db.json        # Persistencia (generada al primer boot)
```

## Notas

- Sin integración Dropi ni WhatsApp (fuera de alcance)
- Comisiones solo fijas, no porcentuales
- Tema oscuro con acento naranja `#F97316`
