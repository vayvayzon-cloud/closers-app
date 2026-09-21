# Closers App

MVP para gestionar **closers** (emprendedores de cierre de ventas), pedidos, presupuesto de ads y liquidaciones mensuales.

Diseñado para operaciones en Argentina (UI en español es-AR). El admin corre ads y manda tráfico por WhatsApp; los closers solo responden chats y cierran ventas.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Persistencia dual:
  - **Local/dev:** JSON en `data/db.json`
  - **Producción (Vercel):** Postgres vía Neon (`DATABASE_URL`) — un solo documento JSONB en la tabla `app_state`
- Auth simple con cookies de sesión + usuarios seed
- Driver: `@neondatabase/serverless` (apto para serverless)

## Cómo correr (local)

```bash
cd closers-app
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) (o el puerto que indique la consola).

Sin `DATABASE_URL`, la base se **siembra automáticamente** en el primer request si `data/db.json` no existe.

Copiá `.env.example` a `.env.local` si querés usar Neon también en local:

```bash
cp .env.example .env.local
# editá DATABASE_URL=...
```

## Persistencia en Vercel (Neon)

En Vercel el filesystem es **efímero**: `data/db.json` no sobrevive entre invocaciones. Para persistir datos:

### 1. Crear proyecto Neon (gratis)

1. Entrá a [https://neon.tech](https://neon.tech) y creá una cuenta.
2. Creá un proyecto (región cercana, ej. US East o São Paulo si está disponible).
3. En **Dashboard → Connection Details**, copiá la connection string (modo **pooled** / `-pooler` recomendado para serverless).

Formato típico:

```
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
```

La app crea sola la tabla y siembra datos si está vacía:

```sql
CREATE TABLE IF NOT EXISTS app_state (
  id int PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL
);
```

### 2. Variable de entorno en Vercel

1. Proyecto en Vercel → **Settings → Environment Variables**.
2. Agregá `DATABASE_URL` con el valor de Neon (Production / Preview / Development según necesites).
3. Redployá el proyecto.

Si `DATABASE_URL` **no** está definida, se usa el archivo local `data/db.json` (útil en `npm run dev`).

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
  lib/           # DB (file + Neon), auth, tipos, seed, utils
data/
  db.json        # Persistencia local (generada al primer boot; ignorada en git)
```

## Notas

- Sin integración Dropi ni WhatsApp (fuera de alcance)
- Comisiones solo fijas, no porcentuales
- Tema oscuro con acento naranja `#F97316`
- Escrituras usan read-modify-write del documento completo (adecuado para este MVP)
