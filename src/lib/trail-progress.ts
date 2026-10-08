import type { Question, Unit } from "@/content/sql-injection";
import { locateUnit, trailBySlug } from "@/content/trails";
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

export function hasSeal(progress: Map<string, ProgressRow>) {
  return progress.get("selo")?.status === "done";
}

export function hasTrailSeal(progress: Map<string, ProgressRow>, sealId: string) {
  return progress.get(sealId)?.status === "done";
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

  const slug = locateUnit(unit.id)?.trail.slug;
  const sealed = passed
    ? slug === "sessao"
      ? await awardSessionSeal(userId)
      : slug === "autenticacao"
        ? await awardAuthSeal(userId)
        : slug === "xss"
          ? await awardXssSeal(userId)
          : slug === "csrf"
            ? await awardCsrfSeal(userId)
            : slug === "phishing"
              ? await awardPhishingSeal(userId)
              : await awardSeal(userId)
    : false;
  return { ok: true as const, passed, score, wrong, attempts, sealed };
}

export async function completeLab(userId: string, ethicsDone: boolean) {
  const unit = unitById("lab-defensivo");
  if (!unit) return { error: "unidade" as const };
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
       VALUES (?, 'lab-defensivo', 'done', 100, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, attempts, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
      await touchStreak(userId);
    }
  });
  return { ok: true as const, sealed: await awardSeal(userId) };
}

export async function completeSessionLab(userId: string, ethicsDone: boolean) {
  const unit = unitById("sessao-lab");
  if (!unit) return { error: "unidade" as const };
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
       VALUES (?, 'sessao-lab', 'done', 100, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, attempts, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
      await touchStreak(userId);
    }
  });
  return { ok: true as const, sealed: await awardSessionSeal(userId) };
}

export async function completeAuthLab(userId: string, ethicsDone: boolean) {
  const unit = unitById("auth-lab");
  if (!unit) return { error: "unidade" as const };
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
       VALUES (?, 'auth-lab', 'done', 100, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, attempts, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
      await touchStreak(userId);
    }
  });
  return { ok: true as const, sealed: await awardAuthSeal(userId) };
}

export async function completeXssLab(userId: string, ethicsDone: boolean) {
  const unit = unitById("xss-lab");
  if (!unit) return { error: "unidade" as const };
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
       VALUES (?, 'xss-lab', 'done', 100, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, attempts, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
      await touchStreak(userId);
    }
  });
  return { ok: true as const, sealed: await awardXssSeal(userId) };
}

export async function completeCsrfLab(userId: string, ethicsDone: boolean) {
  const unit = unitById("csrf-lab");
  if (!unit) return { error: "unidade" as const };
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
       VALUES (?, 'csrf-lab', 'done', 100, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, attempts, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
      await touchStreak(userId);
    }
  });
  return { ok: true as const, sealed: await awardCsrfSeal(userId) };
}

export async function completePhishingLab(userId: string, ethicsDone: boolean) {
  const unit = unitById("phishing-lab");
  if (!unit) return { error: "unidade" as const };
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
       VALUES (?, 'phishing-lab', 'done', 100, ?, ?)
       ON CONFLICT(user_id, unit_id) DO UPDATE SET
         status = 'done',
         score = 100,
         attempts = excluded.attempts,
         xp_awarded = progress.xp_awarded + ?`,
      [userId, attempts, gain, gain],
    );
    if (gain > 0) {
      await run("UPDATE users SET xp = xp + ? WHERE id = ?", [gain, userId]);
      await touchStreak(userId);
    }
  });
  return { ok: true as const, sealed: await awardPhishingSeal(userId) };
}

async function awardSessionSeal(userId: string) {
  const progress = await listProgress(userId);
  if (progress.get("sessao-lab")?.status !== "done") return false;
  if (progress.get("sessao-checkpoint")?.status !== "done") return false;
  if (progress.get("selo-sessao")?.status === "done") return false;
  await run(
    `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
     VALUES (?, 'selo-sessao', 'done', 100, 1, ?)`,
    [userId, SEAL_XP],
  );
  await run("UPDATE users SET xp = xp + ? WHERE id = ?", [SEAL_XP, userId]);
  return true;
}

async function awardSeal(userId: string) {
  const progress = await listProgress(userId);
  if (progress.get("lab-defensivo")?.status !== "done") return false;
  if (progress.get("checkpoint")?.status !== "done") return false;
  if (progress.get("selo")?.status === "done") return false;
  await run(
    `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
     VALUES (?, 'selo', 'done', 100, 1, ?)`,
    [userId, SEAL_XP],
  );
  await run("UPDATE users SET xp = xp + ? WHERE id = ?", [SEAL_XP, userId]);
  return true;
}

async function awardAuthSeal(userId: string) {
  const progress = await listProgress(userId);
  if (progress.get("auth-lab")?.status !== "done") return false;
  if (progress.get("auth-checkpoint")?.status !== "done") return false;
  if (progress.get("selo-autenticacao")?.status === "done") return false;
  await run(
    `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
     VALUES (?, 'selo-autenticacao', 'done', 100, 1, ?)`,
    [userId, SEAL_XP],
  );
  await run("UPDATE users SET xp = xp + ? WHERE id = ?", [SEAL_XP, userId]);
  return true;
}

async function awardXssSeal(userId: string) {
  const progress = await listProgress(userId);
  if (progress.get("xss-lab")?.status !== "done") return false;
  if (progress.get("xss-checkpoint")?.status !== "done") return false;
  if (progress.get("selo-xss")?.status === "done") return false;
  await run(
    `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
     VALUES (?, 'selo-xss', 'done', 100, 1, ?)`,
    [userId, SEAL_XP],
  );
  await run("UPDATE users SET xp = xp + ? WHERE id = ?", [SEAL_XP, userId]);
  return true;
}

async function awardCsrfSeal(userId: string) {
  const progress = await listProgress(userId);
  if (progress.get("csrf-lab")?.status !== "done") return false;
  if (progress.get("csrf-checkpoint")?.status !== "done") return false;
  if (progress.get("selo-csrf")?.status === "done") return false;
  await run(
    `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
     VALUES (?, 'selo-csrf', 'done', 100, 1, ?)`,
    [userId, SEAL_XP],
  );
  await run("UPDATE users SET xp = xp + ? WHERE id = ?", [SEAL_XP, userId]);
  return true;
}

async function awardPhishingSeal(userId: string) {
  const progress = await listProgress(userId);
  if (progress.get("phishing-lab")?.status !== "done") return false;
  if (progress.get("phishing-checkpoint")?.status !== "done") return false;
  if (progress.get("selo-phishing")?.status === "done") return false;
  await run(
    `INSERT INTO progress (user_id, unit_id, status, score, attempts, xp_awarded)
     VALUES (?, 'selo-phishing', 'done', 100, 1, ?)`,
    [userId, SEAL_XP],
  );
  await run("UPDATE users SET xp = xp + ? WHERE id = ?", [SEAL_XP, userId]);
  return true;
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
