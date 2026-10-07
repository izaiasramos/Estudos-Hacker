import { one, run } from "@/lib/db";

const ZONE = "America/Sao_Paulo";

export function studyDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(date);
}

export function shiftDay(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function currentStreak(streak: number, lastStudyOn: string | null, today = studyDay()) {
  if (!lastStudyOn) return 0;
  if (lastStudyOn === today || lastStudyOn === shiftDay(today, -1)) return streak;
  return 0;
}

export async function touchStreak(userId: string) {
  const today = studyDay();
  const row = await one<{ streak: number; last_study_on: string | null }>(
    "SELECT streak, last_study_on FROM users WHERE id = ?",
    [userId],
  );
  if (!row || row.last_study_on === today) return currentStreak(row?.streak ?? 0, row?.last_study_on ?? null);
  const next = row.last_study_on === shiftDay(today, -1) ? row.streak + 1 : 1;
  await run("UPDATE users SET streak = ?, last_study_on = ? WHERE id = ?", [next, today, userId]);
  return next;
}

export async function readStreak(userId: string) {
  const row = await one<{ streak: number; last_study_on: string | null }>(
    "SELECT streak, last_study_on FROM users WHERE id = ?",
    [userId],
  );
  const streak = currentStreak(row?.streak ?? 0, row?.last_study_on ?? null);
  return { streak, studiedToday: row?.last_study_on === studyDay() };
}
