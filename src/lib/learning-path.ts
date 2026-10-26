import { trailBySlug } from "@/content/trails";
import { one, run } from "@/lib/db";

export type LearningLevel = "beginner" | "intermediate" | "advanced";

export type LearningPath = {
  userId: string;
  trailSlug: string;
  level: LearningLevel;
  selectedAt: string;
};

const LEVELS = new Set<LearningLevel>(["beginner", "intermediate", "advanced"]);

export function isLearningLevel(value: string): value is LearningLevel {
  return LEVELS.has(value as LearningLevel);
}

export async function getLearningPath(userId: string, trailSlug: string) {
  const row = await one<{ user_id: string; trail_slug: string; level: LearningLevel; selected_at: string }>(
    "SELECT user_id, trail_slug, level, selected_at FROM learning_paths WHERE user_id = ? AND trail_slug = ?",
    [userId, trailSlug],
  );
  return row
    ? { userId: row.user_id, trailSlug: row.trail_slug, level: row.level, selectedAt: row.selected_at }
    : null;
}

export async function setLearningPath(userId: string, trailSlug: string, level: string) {
  const trail = trailBySlug(trailSlug);
  if (!trail || trail.status === "rascunho") return { error: "trilha" as const };
  if (!isLearningLevel(level)) return { error: "nivel" as const };
  const selectedAt = new Date().toISOString();
  await run(
    `INSERT INTO learning_paths (user_id, trail_slug, level, selected_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, trail_slug) DO UPDATE SET level = excluded.level, selected_at = excluded.selected_at`,
    [userId, trailSlug, level, selectedAt],
  );
  return { ok: true as const, path: { userId, trailSlug, level, selectedAt } };
}

export const LEARNING_LEVEL_LABELS: Record<LearningLevel, { name: string; action: string; guidance: string }> = {
  beginner: { name: "Iniciante", action: "Aprender do zero", guidance: "Siga o conteúdo completo e avance etapa por etapa." },
  intermediate: { name: "Intermediário", action: "Revisar e praticar", guidance: "Use o conteúdo como revisão e confirme o aprendizado na avaliação." },
  advanced: { name: "Avançado", action: "Ir direto à prática", guidance: "Vá direto ao quiz ou laboratório quando estiver pronto, sem pular os critérios de conclusão." },
};
