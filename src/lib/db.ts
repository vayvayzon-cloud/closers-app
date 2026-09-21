import fs from "fs";
import path from "path";
import type { Database } from "./types";
import { seedDatabase } from "./seed-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

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

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDb(): Database {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    const seeded = seedDatabase();
    writeDb(seeded);
    return seeded;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db = JSON.parse(raw) as Database;
  if (!db.seeded) {
    const seeded = seedDatabase();
    writeDb(seeded);
    return seeded;
  }
  return db;
}

export function writeDb(db: Database): void {
  ensureDataDir();
  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmp, DB_PATH);
}

export function updateDb(mutator: (db: Database) => void): Database {
  const db = readDb();
  mutator(db);
  writeDb(db);
  return db;
}

export function getDbPath() {
  return DB_PATH;
}

// Force reseed (dev helper)
export function reseed(): Database {
  const seeded = seedDatabase();
  writeDb(seeded);
  return seeded;
}

export { emptyDb };
