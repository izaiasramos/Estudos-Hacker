import { randomUUID } from "node:crypto";
import { one, run, withTx } from "@/lib/db";
import { touchStreak } from "@/lib/streak";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  provider: "local" | "google";
  googleSub: string | null;
  role: string;
  ethicsAcceptedAt: string | null;
  xp: number;
  createdAt: string;
  /** Preferência do perfil: menos movimento, além do prefers-reduced-motion do sistema. */
  reduceMotion: boolean;
};

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  provider: string;
  google_sub: string | null;
  role: string;
  ethics_accepted_at: string | null;
  xp: number;
  created_at: string;
  reduce_motion?: boolean;
};

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    provider: row.provider === "google" ? "google" : "local",
    googleSub: row.google_sub,
    role: row.role,
    ethicsAcceptedAt: row.ethics_accepted_at,
    xp: row.xp,
    createdAt: row.created_at,
    reduceMotion: row.reduce_motion === true,
  };
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean);
  if (words.length === 0) return "Aluno";
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function findUserByEmail(email: string) {
  const row = await one<UserRow>("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
  return row ? mapUser(row) : null;
}

export async function findUserById(id: string) {
  const row = await one<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
  return row ? mapUser(row) : null;
}

export async function findUserByGoogleSub(sub: string) {
  const row = await one<UserRow>("SELECT * FROM users WHERE google_sub = ?", [sub]);
  return row ? mapUser(row) : null;
}

export async function createLocalUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  const user: UserRow = {
    id: randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name,
    password_hash: input.passwordHash,
    provider: "local",
    google_sub: null,
    role: "learner",
    ethics_accepted_at: null,
    xp: 0,
    created_at: new Date().toISOString(),
  };
  await run(
    `INSERT INTO users (
      id, email, name, password_hash, provider, google_sub, role, ethics_accepted_at, xp, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.email,
      user.name,
      user.password_hash,
      user.provider,
      user.google_sub,
      user.role,
      user.ethics_accepted_at,
      user.xp,
      user.created_at,
    ],
  );
  return mapUser(user);
}

export async function createGoogleUser(input: { email: string; name: string; sub: string }) {
  const user: UserRow = {
    id: randomUUID(),
    email: input.email.toLowerCase(),
    name: input.name || nameFromEmail(input.email),
    password_hash: null,
    provider: "google",
    google_sub: input.sub,
    role: "learner",
    ethics_accepted_at: null,
    xp: 0,
    created_at: new Date().toISOString(),
  };
  await run(
    `INSERT INTO users (
      id, email, name, password_hash, provider, google_sub, role, ethics_accepted_at, xp, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.email,
      user.name,
      user.password_hash,
      user.provider,
      user.google_sub,
      user.role,
      user.ethics_accepted_at,
      user.xp,
      user.created_at,
    ],
  );
  return mapUser(user);
}

export async function acceptEthics(userId: string) {
  const acceptedAt = new Date().toISOString();
  const existing = await one<{ attempts: number }>(
    "SELECT attempts FROM progress WHERE user_id = ? AND unit_id = 'etica'",
    [userId],
  );
  const attempts = (existing?.attempts ?? 0) + 1;
  await withTx(async () => {
    await run(
      "UPDATE users SET ethics_accepted_at = ?, xp = xp + 25 WHERE id = ? AND ethics_accepted_at IS NULL",
      [acceptedAt, userId],
    );
    await run(
      `INSERT INTO progress (user_id, unit_id, status, score, attempts)
       VALUES (?, 'etica', 'done', 100, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts`,
      [userId, attempts],
    );
    const prior = await one<{ ethics_accepted_at: string | null }>(
      "SELECT ethics_accepted_at FROM users WHERE id = ?",
      [userId],
    );
    if (prior?.ethics_accepted_at === acceptedAt) await touchStreak(userId);
  });
}

export async function recordEthicsAttempt(userId: string) {
  await run(
    `INSERT INTO progress (user_id, unit_id, status, score, attempts)
     VALUES (?, 'etica', 'available', NULL, 1)
     ON CONFLICT(user_id, unit_id) DO UPDATE SET
       attempts = attempts + 1`,
    [userId],
  );
}

export function cleanDisplayName(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 60) return null;
  return clean;
}

export async function updateUserName(userId: string, name: string) {
  await run("UPDATE users SET name = ? WHERE id = ?", [name, userId]);
}

export async function updateReduceMotion(userId: string, reduce: boolean) {
  await run("UPDATE users SET reduce_motion = ? WHERE id = ?", [reduce, userId]);
}

export async function lastLabStartedAt(userId: string) {
  const row = await one<{ started_at: string | null }>(
    "SELECT MAX(started_at) AS started_at FROM lab_sessions WHERE user_id = ?",
    [userId],
  );
  return row?.started_at ?? null;
}

/**
 * Apaga a conta e tudo que pertence a ela (LGPD, seção 16 da spec).
 * O lab ativo deve ser encerrado antes, fora da transação, porque derruba container/processo.
 * Se a pessoa é mentora de um time, o time é encerrado junto: só ela podia fechá-lo.
 */
export async function deleteUserAccount(userId: string) {
  await withTx(async () => {
    await run(
      "DELETE FROM squad_members WHERE squad_id IN (SELECT id FROM squads WHERE mentor_id = ?)",
      [userId],
    );
    await run("DELETE FROM squads WHERE mentor_id = ?", [userId]);
    await run("DELETE FROM squad_members WHERE user_id = ?", [userId]);
    await run("DELETE FROM lab_sessions WHERE user_id = ?", [userId]);
    await run("DELETE FROM progress WHERE user_id = ?", [userId]);
    await run("DELETE FROM users WHERE id = ?", [userId]);
  });
}
