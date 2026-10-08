import { describe, expect, it } from "vitest";
import { reviewQueries, VULNERABLE_QUERIES } from "@/lib/lab-check";

const FIXED = `function findUser(db, email) {
  return db.query("SELECT id, name FROM usuarios WHERE email = ?", [email]);
}

function listOrders(db, email) {
  return db.query("SELECT id, item FROM pedidos WHERE email = ?", [email]);
}
`;

describe("reviewQueries", () => {
  it("rejeita consultas que colam o email", () => {
    const result = reviewQueries(VULNERABLE_QUERIES);
    expect(result.ok).toBe(false);
    expect(result.problems[0]).toMatch(/email/);
  });

  it("aceita instrução fixa com email separado", () => {
    const result = reviewQueries(FIXED);
    expect(result.ok).toBe(true);
    expect(result.tests.filter((test) => test.state === "pass").length).toBeGreaterThan(1);
  });
});
