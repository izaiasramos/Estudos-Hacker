import { describe, expect, it } from "vitest";
import {
  findPizzariaUser,
  runPizzariaBehaviorChecks,
  verifyPizzariaPassword,
} from "@/lib/pizzaria-lab";

describe("pizzaria-lab", () => {
  it("autentica a Alice com a senha do fixture", () => {
    const alice = findPizzariaUser("alice@lab.local");
    expect(alice).toBeTruthy();
    if (!alice) return;
    expect(verifyPizzariaPassword(alice, "pizza-lab")).toBe(true);
    expect(verifyPizzariaPassword(alice, "errada")).toBe(false);
  });

  it("checker de comportamento fica verde no cenário esperado", () => {
    const checks = runPizzariaBehaviorChecks();
    expect(checks.every((item) => item.ok)).toBe(true);
  });
});
