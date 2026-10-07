import { DatabaseSync } from "node:sqlite";
import pg from "pg";

const file = new URL("../data/shieldpath.db", import.meta.url);
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL ausente");
  process.exit(1);
}

const sqlite = new DatabaseSync(file);
const client = new pg.Client({ connectionString });
await client.connect();
await client.query(`
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
`);

const existing = await client.query("SELECT COUNT(*)::int AS total FROM users");
if (existing.rows[0].total > 0) {
  console.log("Postgres já tem usuários. Importação ignorada.");
  await client.end();
  process.exit(0);
}

const users = sqlite.prepare("SELECT * FROM users").all();
const progress = sqlite.prepare("SELECT * FROM progress").all();
const labs = sqlite.prepare("SELECT * FROM lab_sessions").all();
const squads = sqlite.prepare("SELECT * FROM squads").all();
const members = sqlite.prepare("SELECT * FROM squad_members").all();

await client.query("BEGIN");
try {
  for (const row of users) {
    await client.query(
      `INSERT INTO users (
        id, email, name, password_hash, provider, google_sub, role, ethics_accepted_at, xp, streak, last_study_on, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        row.id,
        row.email,
        row.name,
        row.password_hash,
        row.provider,
        row.google_sub,
        row.role,
        row.ethics_accepted_at,
        row.xp,
        row.streak ?? 0,
        row.last_study_on,
        row.created_at,
      ],
    );
  }
  for (const row of progress) {
    await client.query(
      `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [row.user_id, row.unit_id, row.status, row.score, row.attempts, row.xp_awarded ?? 0],
    );
  }
  for (const row of labs) {
    await client.query(
      `INSERT INTO lab_sessions (
        id, user_id, runtime, container_id, pid, port, status, started_at, expires_at, last_check
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        row.id,
        row.user_id,
        row.runtime,
        row.container_id,
        row.pid,
        row.port,
        row.status,
        row.started_at,
        row.expires_at,
        row.last_check,
      ],
    );
  }
  for (const row of squads) {
    await client.query(
      `INSERT INTO squads (id, name, code, mentor_id, created_at) VALUES ($1,$2,$3,$4,$5)`,
      [row.id, row.name, row.code, row.mentor_id, row.created_at],
    );
  }
  for (const row of members) {
    await client.query(
      `INSERT INTO squad_members (squad_id, user_id, joined_at) VALUES ($1,$2,$3)`,
      [row.squad_id, row.user_id, row.joined_at],
    );
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
}

console.log(
  `Importado: ${users.length} usuários, ${progress.length} progressos, ${squads.length} times.`,
);
await client.end();
