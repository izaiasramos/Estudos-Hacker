import { randomUUID } from "node:crypto";
import { PUBLISHED_TRAILS } from "@/content/trails";
import { many, one, run, withTx } from "@/lib/db";

export type AttemptMode = "learning" | "competition" | "practice";
export type CompetitionStatus = "draft" | "active" | "awaiting_close" | "closed";
export type PrizeMode = "winner" | "top3";

export type Competition = {
  id: string;
  squadId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: CompetitionStatus;
  scoringVersion: string;
  minimumCoverage: number;
  prizeMode: PrizeMode;
  prizeDescription: string;
  createdBy: string;
  createdAt: string;
  closedAt: string | null;
};

type CompetitionRow = {
  id: string;
  squad_id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: Exclude<CompetitionStatus, "awaiting_close">;
  scoring_version: string;
  minimum_coverage: number;
  prize_mode: PrizeMode;
  prize_description: string;
  created_by: string;
  created_at: string;
  closed_at: string | null;
};

type SquadMembership = { id: string; mentor_id: string };

const TIMEZONE = "America/Sao_Paulo";
const SCORING_VERSION = "mvp-v1-no-speed";

function mapCompetition(row: CompetitionRow): Competition {
  const expired = row.status !== "closed" && new Date(row.ends_at).getTime() <= Date.now();
  return {
    id: row.id,
    squadId: row.squad_id,
    name: row.name,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    status: expired ? "awaiting_close" : row.status,
    scoringVersion: row.scoring_version,
    minimumCoverage: row.minimum_coverage,
    prizeMode: row.prize_mode,
    prizeDescription: row.prize_description,
    createdBy: row.created_by,
    createdAt: row.created_at,
    closedAt: row.closed_at,
  };
}

async function membershipOf(userId: string) {
  return one<SquadMembership>(
    `SELECT s.id, s.mentor_id FROM squads s
     JOIN squad_members sm ON sm.squad_id = s.id
     WHERE sm.user_id = ? AND sm.left_at IS NULL AND s.closed_at IS NULL`,
    [userId],
  );
}

export function evaluableUnitIds() {
  return [...new Set(PUBLISHED_TRAILS.flatMap((trail) => [
    ...trail.units.filter((unit) => unit.questions.length > 0).map((unit) => unit.id),
    trail.labUnitId,
  ]))];
}

async function ensureUnitSnapshots() {
  const missing = await many<{ id: string }>(
    `SELECT c.id FROM competitions c
     WHERE c.status IN ('draft','active') AND NOT EXISTS (SELECT 1 FROM competition_units cu WHERE cu.competition_id=c.id)`,
  );
  const units = evaluableUnitIds();
  for (const competition of missing) {
    for (const unitId of units) {
      await run("INSERT INTO competition_units (competition_id, unit_id) VALUES (?, ?) ON CONFLICT DO NOTHING", [competition.id, unitId]);
    }
  }
}

async function refreshStatuses(squadId?: string) {
  await ensureUnitSnapshots();
  const now = new Date().toISOString();
  await run(
    `UPDATE competitions SET status = 'active'
     WHERE status = 'draft' AND starts_at <= ? AND ends_at > ?${squadId ? " AND squad_id = ?" : ""}`,
    squadId ? [now, now, squadId] : [now, now],
  );
}

function parseSaoPauloDate(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00-03:00` : value;
  return new Date(normalized);
}

export async function createCompetition(userId: string, input: {
  name: string;
  startsAt: string;
  endsAt: string;
  minimumCoverage: number;
  prizeMode: string;
  prizeDescription: string;
}) {
  const squad = await membershipOf(userId);
  if (!squad || squad.mentor_id !== userId) return { error: "mentor" as const };
  const name = input.name.trim().replace(/\s+/g, " ");
  const prize = input.prizeDescription.trim().replace(/\s+/g, " ");
  const starts = parseSaoPauloDate(input.startsAt);
  const ends = parseSaoPauloDate(input.endsAt);
  const now = new Date();
  if (name.length < 3 || name.length > 60) return { error: "nome-competicao" as const };
  if (prize.length < 3 || prize.length > 240) return { error: "premio" as const };
  if (!Number.isFinite(starts.getTime()) || !Number.isFinite(ends.getTime()) || starts <= now || ends <= starts) {
    return { error: "periodo" as const };
  }
  if (!Number.isInteger(input.minimumCoverage) || input.minimumCoverage < 1 || input.minimumCoverage > 100) {
    return { error: "cobertura" as const };
  }
  if (input.prizeMode !== "winner" && input.prizeMode !== "top3") return { error: "premiacao" as const };

  try {
    await withTx(async () => {
      await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`competition:${squad.id}`]);
      const currentSquad = await one<{ id: string }>(
        `SELECT s.id FROM squads s JOIN squad_members sm ON sm.squad_id=s.id
         WHERE s.id=? AND s.mentor_id=? AND s.closed_at IS NULL
           AND sm.user_id=? AND sm.left_at IS NULL`,
        [squad.id, userId, userId],
      );
      if (!currentSquad) throw new Error("CLOSED_SQUAD");
      await refreshStatuses(squad.id);
      const existing = await one<{ id: string }>(
        "SELECT id FROM competitions WHERE squad_id = ? AND status IN ('draft','active') LIMIT 1",
        [squad.id],
      );
      if (existing) throw new Error("OPEN_COMPETITION");
      const id = randomUUID();
      const createdAt = now.toISOString();
      await run(
        `INSERT INTO competitions (id,squad_id,name,starts_at,ends_at,timezone,status,scoring_version,minimum_coverage,prize_mode,prize_description,created_by,created_at)
         VALUES (?,?,?,?,?,?,'draft',?,?,?,?,?,?)`,
        [id, squad.id, name, starts.toISOString(), ends.toISOString(), TIMEZONE, SCORING_VERSION, input.minimumCoverage, input.prizeMode, prize, userId, createdAt],
      );
      await run(
        `INSERT INTO competition_participants (competition_id,user_id,joined_at)
         SELECT ?, user_id, ? FROM squad_members
         WHERE squad_id = ? AND left_at IS NULL ON CONFLICT DO NOTHING`,
        [id, createdAt, squad.id],
      );
      for (const unitId of evaluableUnitIds()) {
        await run("INSERT INTO competition_units (competition_id, unit_id) VALUES (?, ?) ON CONFLICT DO NOTHING", [id, unitId]);
      }
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if ((error instanceof Error && error.message === "OPEN_COMPETITION") || code === "23505") {
      return { error: "competicao-existente" as const };
    }
    if (error instanceof Error && error.message === "CLOSED_SQUAD") return { error: "mentor" as const };
    throw error;
  }
  return { ok: true as const };
}

export async function getSquadCompetition(squadId: string) {
  await refreshStatuses(squadId);
  const row = await one<CompetitionRow>(
    "SELECT * FROM competitions WHERE squad_id = ? ORDER BY (status IN ('draft','active')) DESC, starts_at DESC LIMIT 1",
    [squadId],
  );
  return row ? mapCompetition(row) : null;
}

function pointsForAttempt(attempt: number) {
  return attempt === 1 ? 20 : attempt === 2 ? 12 : attempt === 3 ? 6 : 0;
}
function efficiencyForAttempt(attempt: number) {
  return attempt === 1 ? 10 : attempt === 2 ? 7 : attempt === 3 ? 4 : 1;
}

export async function lockAttemptSequence(userId: string, unitId: string) {
  await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`attempt:${userId}:${unitId}`]);
}

export async function recordAttempt(input: {
  userId: string;
  unitId: string;
  score: number;
  passed: boolean;
  alreadyDone: boolean;
  questionVersion?: string;
}) {
  return withTx(async () => {
    await lockAttemptSequence(input.userId, input.unitId);
    const submittedAt = new Date().toISOString();
    const count = await one<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM attempts WHERE user_id = ? AND unit_id = ?",
      [input.userId, input.unitId],
    );
    const attemptNumber = Number(count?.count ?? 0) + 1;
    let mode: AttemptMode = input.alreadyDone ? "practice" : "learning";
    let competitionId: string | null = null;

    if (!input.alreadyDone) {
      await ensureUnitSnapshots();
      const candidate = await one<{ id: string }>(
        `SELECT c.id FROM competitions c
         JOIN squads s ON s.id = c.squad_id AND s.closed_at IS NULL
         JOIN competition_participants p ON p.competition_id = c.id AND p.user_id = ?
         JOIN competition_units cu ON cu.competition_id = c.id AND cu.unit_id = ?
         WHERE c.status IN ('draft','active') AND c.starts_at <= ? AND c.ends_at >= ?
         ORDER BY c.starts_at DESC LIMIT 1`,
        [input.userId, input.unitId, submittedAt, submittedAt],
      );
      if (candidate) {
        await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`competition-id:${candidate.id}`]);
        const active = await one<{ id: string }>(
          `SELECT c.id FROM competitions c
           JOIN squads s ON s.id=c.squad_id AND s.closed_at IS NULL
           JOIN competition_participants p ON p.competition_id=c.id AND p.user_id=?
           JOIN competition_units cu ON cu.competition_id=c.id AND cu.unit_id=?
           WHERE c.id=? AND c.status IN ('draft','active') AND c.starts_at<=? AND c.ends_at>=?`,
          [input.userId, input.unitId, candidate.id, submittedAt, submittedAt],
        );
        if (active) {
          mode = "competition";
          competitionId = active.id;
          await run("UPDATE competitions SET status='active' WHERE id=? AND status='draft'", [active.id]);
        }
      }
    }

    const id = randomUUID();
    await run(
      `INSERT INTO attempts (id,user_id,unit_id,mode,score,passed,attempt_number,started_at,submitted_at,active_duration_ms,question_version,competition_id)
       VALUES (?,?,?,?,?,?,?,NULL,?,0,?,?)`,
      [id, input.userId, input.unitId, mode, input.score, input.passed, attemptNumber, submittedAt, input.questionVersion ?? "content-v2", competitionId],
    );

    if (mode === "competition" && input.passed && competitionId) {
      const competitiveAttempts = await one<{ count: string }>(
        "SELECT COUNT(*)::text AS count FROM attempts WHERE competition_id=? AND user_id=? AND unit_id=?",
        [competitionId, input.userId, input.unitId],
      );
      const ordinal = Number(competitiveAttempts?.count ?? 1);
      const accuracy = Math.round(input.score * 0.6);
      const first = pointsForAttempt(ordinal);
      const efficiency = efficiencyForAttempt(ordinal);
      await run(
        `INSERT INTO competition_scores (competition_id,user_id,unit_id,attempt_id,accuracy_points,first_pass_points,efficiency_points,speed_points,total_points,finalized_at)
         VALUES (?,?,?,?,?,?,?,0,?,?) ON CONFLICT(competition_id,user_id,unit_id) DO NOTHING`,
        [competitionId, input.userId, input.unitId, id, accuracy, first, efficiency, accuracy + first + efficiency, submittedAt],
      );
    }
    return { id, mode, attemptNumber };
  });
}

export async function competitionRanking(competitionId: string) {
  const totalRow = await one<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM competition_units WHERE competition_id = ?",
    [competitionId],
  );
  const total = Number(totalRow?.count ?? 0);
  const rows = await many<{
    user_id: string; name: string; points: string; units: string; accuracy: string | null;
    first_passes: string; attempts: string; first_submitted: string | null;
    eligible: boolean; final_rank: number | null; final_score: number | null;
  }>(
    `SELECT p.user_id, u.name, p.eligible, p.final_rank, p.final_score,
       COALESCE((SELECT SUM(s.total_points) FROM competition_scores s WHERE s.competition_id=p.competition_id AND s.user_id=p.user_id),0)::text points,
       (SELECT COUNT(*) FROM competition_scores s WHERE s.competition_id=p.competition_id AND s.user_id=p.user_id)::text units,
       (SELECT ROUND(AVG(a.score)) FROM attempts a WHERE a.competition_id=p.competition_id AND a.user_id=p.user_id)::text accuracy,
       COALESCE((SELECT SUM(CASE WHEN s.first_pass_points=20 THEN 1 ELSE 0 END) FROM competition_scores s WHERE s.competition_id=p.competition_id AND s.user_id=p.user_id),0)::text first_passes,
       (SELECT COUNT(*) FROM attempts a WHERE a.competition_id=p.competition_id AND a.user_id=p.user_id)::text attempts,
       (SELECT MIN(a.submitted_at) FROM attempts a WHERE a.competition_id=p.competition_id AND a.user_id=p.user_id) first_submitted
     FROM competition_participants p JOIN users u ON u.id=p.user_id WHERE p.competition_id=?`,
    [competitionId],
  );
  const ranking = rows.map((row) => ({
    userId: row.user_id,
    name: row.name,
    points: Number(row.points),
    units: Number(row.units),
    coverage: total ? Math.round((Number(row.units) / total) * 100) : 0,
    accuracy: row.accuracy === null ? 0 : Number(row.accuracy),
    firstPasses: Number(row.first_passes),
    attempts: Number(row.attempts),
    firstSubmitted: row.first_submitted,
    eligible: row.eligible,
    finalRank: row.final_rank,
    finalScore: row.final_score,
  }));
  const closed = ranking.some((row) => row.finalRank !== null);
  return ranking.sort((a, b) => closed
    ? (a.finalRank ?? Number.MAX_SAFE_INTEGER) - (b.finalRank ?? Number.MAX_SAFE_INTEGER) || b.points - a.points || a.userId.localeCompare(b.userId)
    : b.points - a.points || b.coverage - a.coverage || b.firstPasses - a.firstPasses ||
      b.accuracy - a.accuracy || (a.firstSubmitted ?? "9999").localeCompare(b.firstSubmitted ?? "9999") ||
      a.userId.localeCompare(b.userId));
}

export async function closeCompetition(userId: string) {
  const squad = await membershipOf(userId);
  if (!squad || squad.mentor_id !== userId) return { error: "mentor" as const };
  return withTx(async () => {
    await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`competition:${squad.id}`]);
    const row = await one<CompetitionRow>(
      "SELECT * FROM competitions WHERE squad_id=? ORDER BY (status IN ('draft','active')) DESC, starts_at DESC LIMIT 1 FOR UPDATE",
      [squad.id],
    );
    if (!row) return { error: "sem-competicao" as const };
    await run("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", [`competition-id:${row.id}`]);
    if (row.status === "closed") return { ok: true as const };
    if (new Date(row.ends_at) > new Date()) return { error: "ainda-ativa" as const };

    // Fechar primeiro impede que novas tentativas encontrem a janela como competitiva.
    const homologatedAt = new Date().toISOString();
    await run("UPDATE competitions SET status='closed', closed_at=COALESCE(closed_at,?) WHERE id=?", [homologatedAt, row.id]);
    const ranking = await competitionRanking(row.id);
    const competition = mapCompetition({ ...row, status: "closed", closed_at: homologatedAt });
    const eligible = ranking.filter((entry) => entry.coverage >= competition.minimumCoverage);
    for (const entry of ranking) {
      const eligibleRank = eligible.findIndex((candidate) => candidate.userId === entry.userId);
      await run(
        "UPDATE competition_participants SET eligible=?, final_score=?, final_rank=? WHERE competition_id=? AND user_id=?",
        [eligibleRank >= 0, entry.points, eligibleRank >= 0 ? eligibleRank + 1 : null, competition.id, entry.userId],
      );
    }
    const winners = eligible.slice(0, competition.prizeMode === "top3" ? 3 : 1);
    for (const [index, entry] of winners.entries()) {
      await run(
        `INSERT INTO awards (competition_id,user_id,position,score,prize_description,homologated_at)
         VALUES (?,?,?,?,?,?) ON CONFLICT(competition_id,position) DO NOTHING`,
        [competition.id, entry.userId, index + 1, entry.points, competition.prizeDescription, homologatedAt],
      );
    }
    return { ok: true as const };
  });
}

export async function competitionAwards(competitionId: string) {
  return many<{ position: number; user_id: string; name: string; score: number; prize_description: string }>(
    `SELECT a.position,a.user_id,u.name,a.score,a.prize_description FROM awards a
     JOIN users u ON u.id=a.user_id WHERE a.competition_id=? ORDER BY a.position`,
    [competitionId],
  );
}
