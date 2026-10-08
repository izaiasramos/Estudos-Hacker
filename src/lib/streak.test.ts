import { describe, expect, it } from "vitest";
import { currentStreak, shiftDay, studyDay } from "@/lib/streak";

describe("streak", () => {
  it("mantém a sequência quando estudou ontem ou hoje", () => {
    const today = "2026-10-07";
    expect(currentStreak(3, today, today)).toBe(3);
    expect(currentStreak(3, shiftDay(today, -1), today)).toBe(3);
  });

  it("zera na tela quando o último dia ficou vazio", () => {
    const today = "2026-10-07";
    expect(currentStreak(5, shiftDay(today, -3), today)).toBe(0);
  });

  it("formata o dia de estudo em São Paulo", () => {
    const noonUtc = new Date("2026-10-07T15:00:00.000Z");
    expect(studyDay(noonUtc)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
