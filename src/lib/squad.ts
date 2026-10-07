import { randomBytes, randomUUID } from "node:crypto";
import { TRAILS } from "@/content/trails";
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
     WHERE squad_members.user_id = ?`,
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
      if (code !== "23505" || !constraint.includes("code")) throw error;
    }
  }
  return { error: "nome" as const };
}

export async function joinSquad(userId: string, code: string) {
  const clean = code.trim().toUpperCase().replace(/\s+/g, "");
  if (await squadOf(userId)) return { error: "ja" as const };
  const squad = await one<SquadRow>("SELECT id, name, code, mentor_id FROM squads WHERE code = ?", [clean]);
  if (!squad) return { error: "codigo" as const };
  await run("INSERT INTO squad_members (squad_id, user_id, joined_at) VALUES (?, ?, ?)", [
    squad.id,
    userId,
    new Date().toISOString(),
  ]);
  return { ok: true as const, squad: mapSquad(squad) };
}

export async function leaveSquad(userId: string) {
  const squad = await squadOf(userId);
  if (!squad) return { error: "fora" as const };
  if (squad.mentorId === userId) return { error: "mentor" as const };
  await run("DELETE FROM squad_members WHERE squad_id = ? AND user_id = ?", [squad.id, userId]);
  return { ok: true as const };
}

export async function closeSquad(userId: string) {
  const squad = await squadOf(userId);
  if (!squad || squad.mentorId !== userId) return { error: "mentor" as const };
  await withTx(async () => {
    await run("DELETE FROM squad_members WHERE squad_id = ?", [squad.id]);
    await run("DELETE FROM squads WHERE id = ?", [squad.id]);
  });
  return { ok: true as const };
}

export type Standing = {
  userId: string;
  name: string;
  rank: number;
  score: number | null;
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
     WHERE squad_members.squad_id = ?`,
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
      return { trail, stats: unitStats(progress, [...trail.units.map((unit) => unit.id), trail.sealId]), place: trailPlace(progress, trail) };
    });
    const overallIds = TRAILS.flatMap((trail) => [...trail.units.map((unit) => unit.id), trail.sealId]);
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
  let scored = 0;
  let attempts = 0;
  let done = 0;
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
  return { score: scored > 0 ? Math.round(scoreSum / scored) : null, attempts, done };
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
  return a.score === b.score && a.done === b.done && a.attempts === b.attempts;
}
