import fs from "fs";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Database } from "./types";
import { seedDatabase } from "./seed-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function emptyDb(): Database {
  return {
    users: [],
    products: [],
    assignments: [],
    adSpends: [],
    orders: [],
    sessions: [],
    seeded: false,
  };
}

// ---- File backend (local / dev) ----

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDbFile(): Database {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const seeded = seedDatabase();
    writeDbFile(seeded);
    return seeded;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db = JSON.parse(raw) as Database;
  if (!db.seeded) {
    const seeded = seedDatabase();
    writeDbFile(seeded);
    return seeded;
  }
  return db;
}

function writeDbFile(db: Database): void {
  ensureDataDir();
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmp, DB_PATH);
}

// ---- Neon backend (Vercel / production) ----

let sqlClient: NeonQueryFunction<false, false> | null = null;
let tableReady = false;

function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL!);
  }
  return sqlClient;
}

async function ensureTable(): Promise<void> {
  if (tableReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id int PRIMARY KEY DEFAULT 1,
      data jsonb NOT NULL
    )
  `;
  tableReady = true;
}

async function readDbNeon(): Promise<Database> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT data FROM app_state WHERE id = 1`;
  if (!rows.length) {
    const seeded = seedDatabase();
    await writeDbNeon(seeded);
    return seeded;
  }
  const db = rows[0].data as Database;
  if (!db || !db.seeded) {
    const seeded = seedDatabase();
    await writeDbNeon(seeded);
    return seeded;
  }
  return db;
}

async function writeDbNeon(db: Database): Promise<void> {
  await ensureTable();
  const sql = getSql();
  const payload = JSON.stringify(db);
  // Simple read-modify-write: upsert the whole JSON document in row id=1
  await sql`
    INSERT INTO app_state (id, data)
    VALUES (1, ${payload}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
  `;
}

// ---- Public API (always async for dual backends) ----

export async function readDb(): Promise<Database> {
  if (hasDatabaseUrl()) return readDbNeon();
  return readDbFile();
}

export async function writeDb(db: Database): Promise<void> {
  if (hasDatabaseUrl()) {
    await writeDbNeon(db);
    return;
  }
  writeDbFile(db);
}

export async function updateDb(
  mutator: (db: Database) => void
): Promise<Database> {
  const db = await readDb();
  mutator(db);
  await writeDb(db);
  return db;
}

export function getDbPath() {
  return hasDatabaseUrl() ? "neon:app_state" : DB_PATH;
}

/** Force reseed (dev helper) */
export async function reseed(): Promise<Database> {
  const seeded = seedDatabase();
  await writeDb(seeded);
  return seeded;
}

export { emptyDb };
