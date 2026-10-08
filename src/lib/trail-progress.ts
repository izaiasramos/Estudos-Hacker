import type { Question, Unit } from "@/content/sql-injection";
import { locateUnit, trailBySlug, type Trail } from "@/content/trails";
import { many, run, withTx } from "@/lib/db";
import { touchStreak } from "@/lib/streak";

export type ProgressRow = {
  unitId: string;
  status: string;
  score: number | null;
  attempts: number;
  xpAwarded: number;
};

type StoredProgress = {
  unit_id: string;
  status: string;
  score: number | null;
  attempts: number;
  xp_awarded: number;
};

const READ_XP = 10;
const QUIZ_XP = 15;
const EXERCISE_XP = 25;
const LAB_XP = 40;
const SEAL_XP = 60;

export async function listProgress(userId: string) {
  const rows = await many<StoredProgress>(
    "SELECT unit_id, status, score, attempts, xp_awarded FROM progress WHERE user_id = ?",
    [userId],
  );
  const map = new Map<string, ProgressRow>();
  for (const row of rows) {
    map.set(row.unit_id, {
      unitId: row.unit_id,
      status: row.status,
      score: row.score,
      attempts: row.attempts,
      xpAwarded: row.xp_awarded,
    });
  }
  return map;
}

export function isUnitDone(unitId: string, progress: Map<string, ProgressRow>, ethicsDone: boolean) {
  if (unitId === "etica") return ethicsDone;
  return progress.get(unitId)?.status === "done";
}

function unitById(id: string) {
  return locateUnit(id)?.unit ?? null;
}

function gatedUnits(slug = "sql-injection") {
  return trailBySlug(slug)?.units.filter((unit) => unit.gate) ?? [];
}

export function isUnlocked(unit: Unit, progress: Map<string, ProgressRow>, ethicsDone: boolean) {
  if (!unit.gate) return false;
  const located = locateUnit(unit.id);
  const gated = located ? located.trail.units.filter((item) => item.gate) : [];
  const index = gated.findIndex((item) => item.id === unit.id);
  if (index < 0) return false;
  if (index === 0) return ethicsDone;
  const previous = gated[index - 1];
  return isUnitDone(previous.id, progress, ethicsDone);
}

export function nextUnit(
  progress: Map<string, ProgressRow>,
  ethicsDone: boolean,
  slug = "sql-injection",
) {
  return (
    gatedUnits(slug).find(
      (unit) => !isUnitDone(unit.id, progress, ethicsDone) && isUnlocked(unit, progress, ethicsDone),
    ) ?? null
  );
}

export function unitStatus(
  unit: Unit,
  progress: Map<string, ProgressRow>,
  ethicsDone: boolean,
) {
  if (isUnitDone(unit.id, progress, ethicsDone)) return "concluída";
  if (isUnlocked(unit, progress, ethicsDone)) return "agora";
  return "bloqueada";
}

function xpForPass(unit: Unit) {
  if (unit.kind === "lab") return LAB_XP;
  if (unit.kind === "exercise") return EXERCISE_XP;
  return QUIZ_XP;
}

export function hasTrailSeal(progress: Map<string, ProgressRow>, sealId: string) {
  return progress.get(sealId)?.status === "done";
}

/** Nível de conta da seção 10: Jr → Pleno defensivo (1 selo) → Especialista (2 ou mais). */
export function accountLevel(seals: number) {
  if (seals >= 2) return "Especialista";
  if (seals === 1) return "Pleno defensivo";
  return "Jr";
}

export async function markUnitRead(userId: string, unitId: string, ethicsDone: boolean) {
  const unit = unitById(unitId);
  if (!unit?.gate) return { error: "unidade" as const };
  const progress = await listProgress(userId);
  if (!isUnlocked(unit, progress, ethicsDone)) return { error: "bloqueada" as const };
  const current = progress.get(unit.id);
  if (current?.status === "done") return { ok: true as const };
  const award = unit.kind === "theory" || unit.kind === "checkpoint" ? READ_XP : 0;
  const already = current?.xpAwarded ?? 0;
  const gain = already > 0 ? 0 : award;
  await withTx(async () => {
    await run(
      `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
       VALUES (?, ?, 'read', NULL, 0, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = CASE WHEN progress.status = 'done' THEN 'done' ELSE 'read' END,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, unit.id, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
    }
  });
  return { ok: true as const };
}

export async function gradeUnit(
  userId: string,
  unitId: string,
  answers: Record<string, string>,
  ethicsDone: boolean,
) {
  const unit = unitById(unitId);
  if (!unit?.gate || unit.questions.length === 0) return { error: "unidade" as const };
  const progress = await listProgress(userId);
  if (!isUnlocked(unit, progress, ethicsDone) && progress.get(unit.id)?.status !== "done") {
    return { error: "bloqueada" as const };
  }

  const graded = scoreUnitAnswers(unit.questions, answers);
  const { score, passed, wrong } = graded;
  const current = progress.get(unit.id);
  const attempts = (current?.attempts ?? 0) + 1;
  const passXp = passed && current?.status !== "done" ? xpForPass(unit) : 0;
  const readXp =
    passed &&
    (unit.kind === "theory" || unit.kind === "checkpoint") &&
    (current?.xpAwarded ?? 0) === 0
      ? READ_XP
      : 0;
  const gain = passXp + readXp;

  await withTx(async () => {
    await run(
      `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = CASE
           WHEN excluded.status = 'done' OR progress.status = 'done' THEN 'done'
           ELSE excluded.status
         END,
         score = excluded.score,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [
        userId,
        unit.id,
        passed ? "done" : current?.status === "read" ? "read" : "available",
        score,
        attempts,
        gain,
        gain,
      ],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
    }
    if (passed && current?.status !== "done") await touchStreak(userId);
  });

  const trail = locateUnit(unit.id)?.trail;
  const sealed = passed && trail ? await awardTrailSeal(userId, trail) : false;
  return { ok: true as const, passed, score, wrong, attempts, sealed };
}

/**
 * Fecha o lab defensivo de uma trilha (o checker já passou na rota) e tenta emitir o selo.
 * Só aceita a unidade que a trilha declara como `labUnitId`: o selo depende dela.
 */
export async function completeLab(userId: string, unitId: string, ethicsDone: boolean) {
  const located = locateUnit(unitId);
  if (!located || located.trail.labUnitId !== unitId) return { error: "unidade" as const };
  const { trail, unit } = located;
  const progress = await listProgress(userId);
  if (!isUnlocked(unit, progress, ethicsDone) && progress.get(unit.id)?.status !== "done") {
    return { error: "bloqueada" as const };
  }
  const current = progress.get(unit.id);
  const attempts = (current?.attempts ?? 0) + 1;
  const gain = current?.status === "done" ? 0 : LAB_XP;
  await withTx(async () => {
    await run(
      `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
       VALUES (?, ?, 'done', 100, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, unit.id, attempts, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
      await touchStreak(userId);
    }
  });
  return { ok: true as const, trail, sealed: await awardTrailSeal(userId, trail) };
}

/** Regra pura do selo: lab defensivo e checkpoint concluídos, selo ainda não emitido. */
export function sealIsDue(progress: Map<string, ProgressRow>, trail: Trail) {
  if (progress.get(trail.labUnitId)?.status !== "done") return false;
  if (progress.get(trail.checkpointId)?.status !== "done") return false;
  return progress.get(trail.sealId)?.status !== "done";
}

async function awardTrailSeal(userId: string, trail: Trail) {
  if (!sealIsDue(await listProgress(userId), trail)) return false;
  // O XP só entra se a linha do selo nasceu agora. Dois envios ao mesmo tempo não pagam duas vezes.
  return withTx(async () => {
    const inserted = await many<{ unit_id: string }>(
      `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
       VALUES (?, ?, 'done', 100, 1, ?)
       ON CONFLICT(user_id, unit_id) DO NOTHING
       RETURNING unit_id`,
      [userId, trail.sealId, SEAL_XP],
    );
    if (inserted.length === 0) return false;
    await run("UPDATE users SET xp = xp + ? WHERE id = ?", [SEAL_XP, userId]);
    return true;
  });
}

export function scoreUnitAnswers(questions: Question[], answers: Record<string, string>) {
  const wrong: { id: string; choice: string; explain: string }[] = [];
  let correct = 0;
  for (const question of questions) {
    const given = (answers[question.id] ?? "").trim();
    if (questionPasses(question, given)) {
      correct += 1;
      continue;
    }
    wrong.push({
      id: question.id,
      choice: given,
      explain: explainFor(question, given),
    });
  }
  const score =
    questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100);
  return { score, passed: score >= 70, correct, wrong };
}

function questionPasses(question: Question, given: string) {
  if (question.kind === "text") {
    if (given.length < question.min) return false;
    const normalized = given.toLocaleLowerCase("pt-BR");
    return question.stems.some((stem) => normalized.includes(stem));
  }
  return question.choices.some((choice) => choice.correct && choice.id === given);
}

function explainFor(question: Question, given: string) {
  if (question.kind === "text") return question.explain;
  return (
    question.choices.find((choice) => choice.id === given)?.explain ??
    "Escolha uma alternativa para ver o porquê."
  );
}

export function shuffleChoices<T>(items: T[], seed: number) {
  const copy = [...items];
  let state = seed || 1;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}
