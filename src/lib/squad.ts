import { randomBytes, randomUUID } from "node:crypto";
import { PUBLISHED_TRAILS as TRAILS } from "@/content/trails";
import { many, one, run, withTx } from "@/lib/db";
import { hasTrailSeal, listProgress, nextUnit, type ProgressRow } from "@/lib/trail-progress";
import { currentStreak, studyDay } from "@/lib/streak";
import type { Trail } from "@/content/trails";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type SquadRecord = {
  id: string;
  name: string;
  code: string;
  mentorId: string;
};

type SquadRow = {
  id: string;
  name: string;
  code: string;
  mentor_id: string;
};

function mapSquad(row: SquadRow): SquadRecord {
  return { id: row.id, name: row.name, code: row.code, mentorId: row.mentor_id };
}

export async function squadOf(userId: string) {
  const row = await one<SquadRow>(
    `SELECT squads.id, squads.name, squads.code, squads.mentor_id
     FROM squads
     JOIN squad_members ON squad_members.squad_id = squads.id
     WHERE squad_members.user_id = ?
       AND squad_members.left_at IS NULL
       AND squads.closed_at IS NULL`,
    [userId],
  );
  return row ? mapSquad(row) : null;
}

export async function createSquad(userId: string, name: string) {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 32) return { error: "nome" as const };
  if (await squadOf(userId)) return { error: "ja" as const };
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = [...randomBytes(6)].map((byte) => ALPHABET[byte % ALPHABET.length]).join("");
    try {
      await withTx(async () => {
        await run("INSERT INTO squads (id, name, code, mentor_id, created_at) VALUES (?, ?, ?, ?, ?)", [
          id,
          clean,
          code,
          userId,
          createdAt,
        ]);
        await run("INSERT INTO squad_members (squad_id, user_id, joined_at) VALUES (?, ?, ?)", [
          id,
          userId,
          createdAt,
        ]);
      });
      return { ok: true as const, squad: { id, name: clean, code, mentorId: userId } };
    } catch (error) {
      const constraint = typeof error === "object" && error && "constraint" in error ? String(error.constraint) : "";
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code === "23505" && constraint === "squad_members_one_active_per_user") {
        return { error: "ja" as const };
      }
      if (code !== "23505" || !constraint.includes("code")) throw error;
    }
  }
  return { error: "nome" as const };
}

export async function joinSquad(userId: string, code: string) {
  const clean = code.trim().toUpperCase().replace(/\s+/g, "");
  const candidate = await one<SquadRow>(
    "SELECT id, name, code, mentor_id FROM squads WHERE code = ? AND closed_at IS NULL",
    [clean],
  );
  if (!candidate) return { error: "codigo" as const };

  try {
    return await withTx(async () => {
      await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`competition:${candidate.id}`]);
      const squad = await one<SquadRow>(
        "SELECT id, name, code, mentor_id FROM squads WHERE id = ? AND closed_at IS NULL",
        [candidate.id],
      );
      if (!squad) return { error: "codigo" as const };
      const openCompetition = await one<{ id: string }>(
        "SELECT id FROM competitions WHERE squad_id = ? AND status IN ('draft','active') LIMIT 1",
        [squad.id],
      );
      if (openCompetition) return { error: "competicao-entrada" as const };
      if (await squadOf(userId)) return { error: "ja" as const };
      await run(
        `INSERT INTO squad_members (squad_id, user_id, joined_at, left_at)
         VALUES (?, ?, ?, NULL)
         ON CONFLICT (squad_id, user_id) DO UPDATE SET
           joined_at = excluded.joined_at,
           left_at = NULL`,
        [squad.id, userId, new Date().toISOString()],
      );
      return { ok: true as const, squad: mapSquad(squad) };
    });
  } catch (error) {
    const constraint = typeof error === "object" && error && "constraint" in error ? String(error.constraint) : "";
    const errorCode = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (errorCode === "23505" && constraint === "squad_members_one_active_per_user") {
      return { error: "ja" as const };
    }
    throw error;
  }
}

export async function leaveSquad(userId: string) {
  const current = await squadOf(userId);
  if (!current) return { error: "fora" as const };

  return withTx(async () => {
    await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`competition:${current.id}`]);
    const squad = await one<SquadRow>(
      `SELECT s.id, s.name, s.code, s.mentor_id FROM squads s
       JOIN squad_members sm ON sm.squad_id = s.id
       WHERE s.id = ? AND s.closed_at IS NULL AND sm.user_id = ? AND sm.left_at IS NULL`,
      [current.id, userId],
    );
    if (!squad) return { error: "fora" as const };
    if (squad.mentor_id === userId) return { error: "mentor" as const };
    const openCompetition = await one<{ id: string }>(
      "SELECT id FROM competitions WHERE squad_id = ? AND status IN ('draft','active') LIMIT 1",
      [squad.id],
    );
    if (openCompetition) return { error: "competicao-saida" as const };
    await run(
      "UPDATE squad_members SET left_at = ? WHERE squad_id = ? AND user_id = ? AND left_at IS NULL",
      [new Date().toISOString(), squad.id, userId],
    );
    return { ok: true as const };
  });
}

export async function closeSquad(userId: string) {
  const current = await squadOf(userId);
  if (!current || current.mentorId !== userId) return { error: "mentor" as const };
  try {
    await withTx(async () => {
      await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`competition:${current.id}`]);
      const squad = await one<{ id: string }>(
        `SELECT s.id FROM squads s JOIN squad_members sm ON sm.squad_id = s.id
         WHERE s.id = ? AND s.mentor_id = ? AND s.closed_at IS NULL
           AND sm.user_id = ? AND sm.left_at IS NULL`,
        [current.id, userId, userId],
      );
      if (!squad) throw new Error("CLOSED_SQUAD");
      const openCompetition = await one<{ id: string }>(
        "SELECT id FROM competitions WHERE squad_id=? AND status IN ('draft','active') LIMIT 1",
        [squad.id],
      );
      if (openCompetition) throw new Error("OPEN_COMPETITION");
      const closedAt = new Date().toISOString();
      await run("UPDATE squads SET closed_at=? WHERE id=?", [closedAt, squad.id]);
      await run("UPDATE squad_members SET left_at=COALESCE(left_at,?) WHERE squad_id=?", [closedAt, squad.id]);
    });
  } catch (error) {
    if (error instanceof Error && error.message === "OPEN_COMPETITION") {
      return { error: "competicao-aberta" as const };
    }
    if (error instanceof Error && error.message === "CLOSED_SQUAD") {
      return { error: "mentor" as const };
    }
    throw error;
  }
  return { ok: true as const };
}

export type Standing = {
  userId: string;
  name: string;
  rank: number;
  score: number | null;
  coverage: number;
  attempts: number;
  done: number;
  place: string;
};

export async function squadStandings(squadId: string) {
  const rows = await many<{
    id: string;
    name: string;
    streak: number;
    last_study_on: string | null;
  }>(
    `SELECT users.id, users.name, users.streak, users.last_study_on
     FROM users
     JOIN squad_members ON squad_members.user_id = users.id
     JOIN squads ON squads.id = squad_members.squad_id
     WHERE squad_members.squad_id = ?
       AND squad_members.left_at IS NULL
       AND squads.closed_at IS NULL`,
    [squadId],
  );
  const today = studyDay();
  const seals = TRAILS.map((trail) => ({ slug: trail.slug, title: trail.title, seals: 0 }));
  let studiedToday = 0;
  const people = await Promise.all(
    rows.map(async (row) => {
      const progress = await listProgress(row.id);
    if (row.last_study_on === today) studiedToday += 1;
    const trails = TRAILS.map((trail) => {
      if (hasTrailSeal(progress, trail.sealId)) {
        const bucket = seals.find((item) => item.slug === trail.slug);
        if (bucket) bucket.seals += 1;
      }
      return { trail, stats: unitStats(progress, trail.units.map((unit) => unit.id)), place: trailPlace(progress, trail) };
    });
    const overallIds = TRAILS.flatMap((trail) => trail.units.map((unit) => unit.id));
    return {
      userId: row.id,
      name: row.name,
      streak: currentStreak(row.streak, row.last_study_on),
      overall: unitStats(progress, overallIds),
      trails,
    };
  }),
  );
  return {
    people: people.length,
    studiedToday,
    seals,
    overall: rankRows(
      people.map((person) => ({
        userId: person.userId,
        name: person.name,
        score: person.overall.score,
        coverage: person.overall.coverage,
        attempts: person.overall.attempts,
        done: person.overall.done,
        place: person.streak === 0 ? "Nenhum dia fechado" : person.streak === 1 ? "1 dia" : `${person.streak} dias seguidos`,
      })),
    ),
    trails: TRAILS.map((trail) => ({
      slug: trail.slug,
      title: trail.title,
      rows: rankRows(
        people.map((person) => {
          const entry = person.trails.find((item) => item.trail.slug === trail.slug);
          return {
            userId: person.userId,
            name: person.name,
            score: entry?.stats.score ?? null,
            coverage: entry?.stats.coverage ?? 0,
            attempts: entry?.stats.attempts ?? 0,
            done: entry?.stats.done ?? 0,
            place: entry?.place ?? "Ainda no início",
          };
        }),
      ),
    })),
  };
}

function unitStats(progress: Map<string, ProgressRow>, unitIds: string[]) {
  let scoreSum = 0;
  let attempts = 0;
  let done = 0;
  let scored = 0;
  for (const unitId of unitIds) {
    const row = progress.get(unitId);
    if (!row) continue;
    attempts += row.attempts;
    if (row.status === "done") done += 1;
    if (row.score !== null) {
      scoreSum += row.score;
      scored += 1;
    }
  }
  return {
    score: scored > 0 ? Math.round(scoreSum / unitIds.length) : null,
    coverage: unitIds.length ? Math.round((done / unitIds.length) * 100) : 0,
    attempts,
    done,
  };
}

function trailPlace(progress: Map<string, ProgressRow>, trail: Trail) {
  if (hasTrailSeal(progress, trail.sealId)) return "Selo fechado";
  const started = trail.units.some((unit) => progress.get(unit.id)?.status === "done");
  if (!started) return "Ainda no início";
  const upcoming = nextUnit(progress, true, trail.slug);
  return upcoming ? `Parou em ${upcoming.title}` : "Selo fechado";
}

function rankRows(
  rows: Omit<Standing, "rank">[],
) {
  const ordered = [...rows].sort((a, b) => {
    if (b.coverage !== a.coverage) return b.coverage - a.coverage;
    const scoreA = a.score ?? -1;
    const scoreB = b.score ?? -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (b.done !== a.done) return b.done - a.done;
    if (a.attempts !== b.attempts) return a.attempts - b.attempts;
    return a.name.localeCompare(b.name, "pt-BR");
  });
  let rank = 1;
  return ordered.map((row, index) => {
    const previous = ordered[index - 1];
    if (previous && !sameStanding(previous, row)) rank = index + 1;
    return { ...row, rank };
  });
}

function sameStanding(a: Omit<Standing, "rank">, b: Omit<Standing, "rank">) {
  return a.coverage === b.coverage && a.score === b.score && a.done === b.done && a.attempts === b.attempts;
}
