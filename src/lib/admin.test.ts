import { describe, expect, it } from "vitest";
import { PUBLISHED_TRAILS, TRAILS, trailAfter, type Trail } from "@/content/trails";
import { canSeeTrail, isAdmin } from "@/lib/access";
import { trailFunnel } from "@/lib/admin-metrics";

const sql = TRAILS.find((trail) => trail.slug === "sql-injection") as Trail;
const draft: Trail = { ...sql, slug: "rascunho-teste", status: "rascunho" };

describe("acesso", () => {
  it("só role admin é admin", () => {
    expect(isAdmin({ role: "admin" })).toBe(true);
    expect(isAdmin({ role: "learner" })).toBe(false);
    expect(isAdmin({ role: "mentor" })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it("rascunho só aparece para admin; publicada aparece para todos", () => {
    expect(canSeeTrail({ role: "learner" }, draft)).toBe(false);
    expect(canSeeTrail(null, draft)).toBe(false);
    expect(canSeeTrail({ role: "admin" }, draft)).toBe(true);
    expect(canSeeTrail({ role: "learner" }, sql)).toBe(true);
  });

  it("lista publicada não tem rascunho e “próxima trilha” pula rascunho", () => {
    expect(PUBLISHED_TRAILS.every((trail) => trail.status !== "rascunho")).toBe(true);
    for (const trail of TRAILS) {
      const after = trailAfter(trail.slug);
      if (after) expect(after.status).not.toBe("rascunho");
    }
  });
});

describe("funil do admin", () => {
  it("conta a unidade antes do lab defensivo e calcula a taxa", () => {
    const done = new Map([
      ["banco", 10],
      ["defesas", 8],
      ["lab-defensivo", 6],
      ["selo", 5],
    ]);
    expect(trailFunnel(sql, done)).toMatchObject({
      started: 10,
      beforeLab: 8,
      labDone: 6,
      sealed: 5,
      labRate: 75,
    });
  });

  it("sem ninguém no lab, a taxa fica vazia em vez de 0%", () => {
    expect(trailFunnel(sql, new Map()).labRate).toBeNull();
  });
});
