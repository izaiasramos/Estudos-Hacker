import { describe, expect, it } from "vitest";
import { unitById } from "@/content/sql-injection";
import {
  isUnlocked,
  nextUnit,
  scoreUnitAnswers,
  shuffleChoices,
  unitStatus,
  type ProgressRow,
} from "@/lib/trail-progress";

function progressMap(entries: Record<string, Partial<ProgressRow>>) {
  const map = new Map<string, ProgressRow>();
  for (const [unitId, row] of Object.entries(entries)) {
    map.set(unitId, {
      unitId,
      status: row.status ?? "available",
      score: row.score ?? null,
      attempts: row.attempts ?? 0,
      xpAwarded: row.xpAwarded ?? 0,
    });
  }
  return map;
}

describe("desbloqueio da trilha", () => {
  it("libera a primeira unidade só depois da ética", () => {
    const banco = unitById("banco");
    expect(banco).toBeTruthy();
    if (!banco) return;
    expect(isUnlocked(banco, new Map(), false)).toBe(false);
    expect(isUnlocked(banco, new Map(), true)).toBe(true);
  });

  it("aponta a próxima unidade desbloqueada e incompleta", () => {
    const progress = progressMap({ banco: { status: "done" } });
    const next = nextUnit(progress, true);
    expect(next?.id).toBe("encontro");
  });

  it("marca status agora, bloqueada ou concluída", () => {
    const banco = unitById("banco");
    expect(banco).toBeTruthy();
    if (!banco) return;
    expect(unitStatus(banco, new Map(), true)).toBe("agora");
    expect(unitStatus(banco, progressMap({ banco: { status: "done" } }), true)).toBe("concluída");
  });
});

describe("scoreUnitAnswers", () => {
  it("exige 70% para passar", () => {
    const questions = [
      {
        kind: "choice" as const,
        id: "a",
        prompt: "A",
        choices: [
          { id: "ok", label: "ok", correct: true, explain: "certo" },
          { id: "nope", label: "nope", explain: "errado" },
        ],
      },
      {
        kind: "choice" as const,
        id: "b",
        prompt: "B",
        choices: [
          { id: "ok", label: "ok", correct: true, explain: "certo" },
          { id: "nope", label: "nope", explain: "errado" },
        ],
      },
      {
        kind: "choice" as const,
        id: "c",
        prompt: "C",
        choices: [
          { id: "ok", label: "ok", correct: true, explain: "certo" },
          { id: "nope", label: "nope", explain: "errado" },
        ],
      },
    ];
    const fail = scoreUnitAnswers(questions, { a: "ok", b: "ok", c: "nope" });
    expect(fail.score).toBe(67);
    expect(fail.passed).toBe(false);
    const pass = scoreUnitAnswers(questions, { a: "ok", b: "ok", c: "ok" });
    expect(pass.score).toBe(100);
    expect(pass.passed).toBe(true);
  });
});

describe("shuffleChoices", () => {
  it("mantém os mesmos itens com o mesmo seed", () => {
    const items = [1, 2, 3, 4];
    expect(shuffleChoices(items, 42)).toEqual(shuffleChoices(items, 42));
    expect(shuffleChoices(items, 42).sort()).toEqual(items.sort());
  });
});
