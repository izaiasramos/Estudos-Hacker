import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient } from "pg";

const storage = new AsyncLocalStorage<PoolClient>();

const globalForDb = globalThis as unknown as {
  shieldpathPool?: Pool;
  shieldpathReady?: Promise<void>;
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,
  provider TEXT NOT NULL,
  google_sub TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'learner',
  ethics_accepted_at TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_study_on TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  status TEXT NOT NULL,
  score INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, unit_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS lab_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  runtime TEXT NOT NULL,
  container_id TEXT,
  pid INTEGER,
  port INTEGER,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_check TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS squads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  mentor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (mentor_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS squad_members (
  squad_id TEXT NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  joined_at TEXT NOT NULL,
  PRIMARY KEY (squad_id, user_id),
  FOREIGN KEY (squad_id) REFERENCES squads(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

function pool() {
  if (!globalForDb.shieldpathPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL ausente");
    }
    globalForDb.shieldpathPool = new Pool({ connectionString, max: 10 });
  }
  return globalForDb.shieldpathPool;
}

function placeholders(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

async function ensureSchema() {
  if (!globalForDb.shieldpathReady) {
    globalForDb.shieldpathReady = pool()
      .query(SCHEMA_SQL)
      .then(() => undefined)
      .catch((error: unknown) => {
        globalForDb.shieldpathReady = undefined;
        throw error;
      });
  }
  await globalForDb.shieldpathReady;
}

async function query(sql: string, params: unknown[] = []) {
  await ensureSchema();
  const client = storage.getStore() ?? pool();
  return client.query(placeholders(sql), params);
}

export async function many<T>(sql: string, params: unknown[] = []) {
  const result = await query(sql, params);
  return result.rows as T[];
}

export async function one<T>(sql: string, params: unknown[] = []) {
  const rows = await many<T>(sql, params);
  return rows[0] ?? null;
}

export async function run(sql: string, params: unknown[] = []) {
  await query(sql, params);
}

export async function withTx<T>(fn: () => Promise<T>) {
  await ensureSchema();
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await storage.run(client, fn);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
