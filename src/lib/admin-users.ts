import { many, one, run, withTx } from "@/lib/db";

export type AdminRole = "learner" | "admin";

export type AdminUserSummary = {
  id: string;
  email: string;
  name: string;
  provider: string;
  role: string;
  ethicsAcceptedAt: string | null;
  xp: number;
  createdAt: string;
  completedUnits: number;
  attempts: number;
  activeLabId: string | null;
};

type SummaryRow = {
  id: string;
  email: string;
  name: string;
  provider: string;
  role: string;
  ethics_accepted_at: string | null;
  xp: number;
  created_at: string;
  completed_units: string | number;
  attempts: string | number;
  active_lab_id: string | null;
};

function mapSummary(row: SummaryRow): AdminUserSummary {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    provider: row.provider,
    role: row.role,
    ethicsAcceptedAt: row.ethics_accepted_at,
    xp: row.xp,
    createdAt: row.created_at,
    completedUnits: Number(row.completed_units),
    attempts: Number(row.attempts),
    activeLabId: row.active_lab_id,
  };
}

export async function searchAdminUsers(rawQuery: string) {
  const query = rawQuery.trim().slice(0, 120);
  const pattern = `%${query}%`;
  const rows = await many<SummaryRow>(
    `SELECT u.id, u.email, u.name, u.provider, u.role, u.ethics_accepted_at, u.xp, u.created_at,
            (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.status = 'done') AS completed_units,
            (SELECT COALESCE(SUM(p.attempts), 0) FROM progress p WHERE p.user_id = u.id) AS attempts,
            (SELECT l.id FROM lab_sessions l WHERE l.user_id = u.id AND l.status = 'running' ORDER BY l.started_at DESC LIMIT 1) AS active_lab_id
     FROM users u
     WHERE (? = '' OR u.email ILIKE ? OR u.name ILIKE ?)
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT 100`,
    [query, pattern, pattern],
  );
  return rows.map(mapSummary);
}

export async function getAdminUser(id: string) {
  const row = await one<SummaryRow>(
    `SELECT u.id, u.email, u.name, u.provider, u.role, u.ethics_accepted_at, u.xp, u.created_at,
            (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.status = 'done') AS completed_units,
            (SELECT COALESCE(SUM(p.attempts), 0) FROM progress p WHERE p.user_id = u.id) AS attempts,
            (SELECT l.id FROM lab_sessions l WHERE l.user_id = u.id AND l.status = 'running' ORDER BY l.started_at DESC LIMIT 1) AS active_lab_id
     FROM users u
     WHERE u.id = ?`,
    [id],
  );
  if (!row) return null;
  const [progress, attempts] = await Promise.all([
    many<{ unit_id: string; status: string; score: number | null; attempts: number; completed_at: string | null }>(
      `SELECT unit_id, status, score, attempts, completed_at FROM progress
       WHERE user_id = ? ORDER BY completed_at DESC NULLS LAST, unit_id`,
      [id],
    ),
    many<{ unit_id: string; mode: string; score: number; passed: boolean; submitted_at: string }>(
      `SELECT unit_id, mode, score, passed, submitted_at FROM attempts
       WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 20`,
      [id],
    ),
  ]);
  return { user: mapSummary(row), progress, attempts };
}

export async function changeAdminUserRole(actorId: string, targetId: string, role: AdminRole) {
  if (actorId === targetId) return { error: "proprio" as const };
  return withTx(async () => {
    const target = await one<{ role: string }>("SELECT role FROM users WHERE id = ? FOR UPDATE", [targetId]);
    if (!target) return { error: "usuario" as const };
    if (target.role === role) return { ok: true as const };
    if (target.role === "admin" && role !== "admin") {
      const admins = await one<{ total: string | number }>("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'", []);
      if (Number(admins?.total ?? 0) <= 1) return { error: "ultimo-admin" as const };
    }
    await run("UPDATE users SET role = ? WHERE id = ?", [role, targetId]);
    return { ok: true as const };
  });
}
