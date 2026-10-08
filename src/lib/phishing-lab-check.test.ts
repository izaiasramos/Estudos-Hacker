import { describe, expect, it } from "vitest";
import { missingPhishingLabDefenses } from "@/lib/phishing-lab-check";

describe("phishing lab checker", () => {
  it("exige classificação correta e defesas de produto", () => {
    expect(missingPhishingLabDefenses({})).toContain("msg1");
    expect(
      missingPhishingLabDefenses({
        msg1: "legitimo",
        msg2: "phishing",
        msg3: "suspeito",
        nosenha: "on",
        alerta: "on",
        mfa: "on",
        treino: "on",
      }),
    ).toEqual([]);
  });
});
