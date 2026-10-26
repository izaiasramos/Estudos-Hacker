import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient } from "pg";

const storage = new AsyncLocalStorage<PoolClient>();

const globalForDb = globalThis as unknown as {
  shieldpathPool?: Pool;
  shieldpathReady?: Promise<void>;
};

const AUTH_SCHEMA_SQL = `
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
CREATE TABLE IF NOT EXISTS login_failures (
  id BIGSERIAL PRIMARY KEY,
  key_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS login_failures_key_created ON login_failures (key_hash, created_at);
`;

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
  closed_at TEXT,
  FOREIGN KEY (mentor_id) REFERENCES users(id)
);
ALTER TABLE squads ADD COLUMN IF NOT EXISTS closed_at TEXT;
CREATE TABLE IF NOT EXISTS squad_members (
  squad_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  left_at TEXT,
  PRIMARY KEY (squad_id, user_id),
  FOREIGN KEY (squad_id) REFERENCES squads(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
ALTER TABLE squad_members ADD COLUMN IF NOT EXISTS left_at TEXT;
ALTER TABLE squad_members DROP CONSTRAINT IF EXISTS squad_members_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS squad_members_one_active_per_user
  ON squad_members (user_id) WHERE left_at IS NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reduce_motion BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE progress ADD COLUMN IF NOT EXISTS completed_at TEXT;
CREATE TABLE IF NOT EXISTS learning_paths (
  user_id TEXT NOT NULL,
  trail_slug TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  selected_at TEXT NOT NULL,
  PRIMARY KEY (user_id, trail_slug),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS learning_paths_trail ON learning_paths (trail_slug);
CREATE TABLE IF NOT EXISTS competitions (
  id TEXT PRIMARY KEY,
  squad_id TEXT NOT NULL,
  name TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'closed')),
  scoring_version TEXT NOT NULL,
  minimum_coverage INTEGER NOT NULL CHECK (minimum_coverage BETWEEN 1 AND 100),
  prize_mode TEXT NOT NULL CHECK (prize_mode IN ('winner', 'top3')),
  prize_description TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  closed_at TEXT,
  CHECK (ends_at > starts_at),
  FOREIGN KEY (squad_id) REFERENCES squads(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS competitions_squad_period ON competitions (squad_id, starts_at DESC, ends_at DESC);
CREATE INDEX IF NOT EXISTS competitions_status_ends ON competitions (status, ends_at);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'competitions_one_open_per_squad') THEN
    WITH duplicates AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY squad_id ORDER BY created_at DESC, id DESC) AS position
      FROM competitions WHERE status IN ('draft', 'active')
    )
    UPDATE competitions c SET status='closed', closed_at=COALESCE(c.closed_at, c.ends_at)
    FROM duplicates d WHERE c.id=d.id AND d.position > 1;
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS competitions_one_open_per_squad
  ON competitions (squad_id) WHERE status IN ('draft', 'active');
CREATE TABLE IF NOT EXISTS competition_units (
  competition_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  PRIMARY KEY (competition_id, unit_id),
  FOREIGN KEY (competition_id) REFERENCES competitions(id)
);
CREATE INDEX IF NOT EXISTS competition_units_unit ON competition_units (unit_id);
CREATE TABLE IF NOT EXISTS competition_participants (
  competition_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  eligible BOOLEAN NOT NULL DEFAULT false,
  final_score INTEGER,
  final_rank INTEGER,
  PRIMARY KEY (competition_id, user_id),
  FOREIGN KEY (competition_id) REFERENCES competitions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS competition_participants_user ON competition_participants (user_id);
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('learning', 'competition', 'practice')),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  started_at TEXT,
  submitted_at TEXT NOT NULL,
  active_duration_ms INTEGER,
  question_version TEXT NOT NULL,
  competition_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (competition_id) REFERENCES competitions(id)
);
CREATE INDEX IF NOT EXISTS attempts_user_unit ON attempts (user_id, unit_id, submitted_at);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'attempts_user_unit_number') THEN
    WITH numbered AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, unit_id ORDER BY submitted_at, id) AS ordinal
      FROM attempts
    )
    UPDATE attempts a SET attempt_number=n.ordinal FROM numbered n WHERE a.id=n.id;
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS attempts_user_unit_number ON attempts (user_id, unit_id, attempt_number);
CREATE INDEX IF NOT EXISTS attempts_competition ON attempts (competition_id, user_id, submitted_at);
CREATE TABLE IF NOT EXISTS competition_scores (
  competition_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL UNIQUE,
  accuracy_points INTEGER NOT NULL,
  first_pass_points INTEGER NOT NULL,
  efficiency_points INTEGER NOT NULL,
  speed_points INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  finalized_at TEXT NOT NULL,
  PRIMARY KEY (competition_id, user_id, unit_id),
  FOREIGN KEY (competition_id, user_id) REFERENCES competition_participants(competition_id, user_id),
  FOREIGN KEY (attempt_id) REFERENCES attempts(id)
);
CREATE INDEX IF NOT EXISTS competition_scores_ranking ON competition_scores (competition_id, user_id, total_points);
CREATE TABLE IF NOT EXISTS awards (
  competition_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  score INTEGER NOT NULL,
  prize_description TEXT NOT NULL,
  homologated_at TEXT NOT NULL,
  delivered_at TEXT,
  PRIMARY KEY (competition_id, position),
  FOREIGN KEY (competition_id, user_id) REFERENCES competition_participants(competition_id, user_id)
);
CREATE INDEX IF NOT EXISTS awards_user ON awards (user_id);
CREATE TABLE IF NOT EXISTS login_failures (
  id BIGSERIAL PRIMARY KEY,
  key_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS login_failures_key_created ON login_failures (key_hash, created_at);
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
    globalForDb.shieldpathReady = (async () => {
      // Autenticação não pode depender da migração de recursos como squads e competições.
      // Este núcleo é pequeno, idempotente e obrigatório para cadastro, login e throttle.
      await pool().query(AUTH_SCHEMA_SQL);

      try {
        await pool().query(SCHEMA_SQL);
      } catch (error) {
        // Bancos persistentes podem ter uma migração secundária parcialmente aplicada ou dados
        // que conflitam com um índice novo. As tabelas já disponíveis continuam utilizáveis;
        // a operação específica que depender de uma estrutura ausente falhará de forma localizada.
        const detail = error as {
          message?: string;
          code?: string;
          table?: string;
          constraint?: string;
        };
        console.error("[db] migração complementar não concluída", {
          message: detail.message ?? "erro desconhecido",
          code: detail.code,
          table: detail.table,
          constraint: detail.constraint,
        });
      }
    })().catch((error: unknown) => {
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
  // Serviços podem compor operações sem abrir outra conexão/transação.
  if (storage.getStore()) return fn();
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
