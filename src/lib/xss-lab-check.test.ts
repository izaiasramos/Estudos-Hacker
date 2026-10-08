import { describe, expect, it } from "vitest";
import { missingXssLabDefenses } from "@/lib/xss-lab-check";

describe("xss lab checker", () => {
  it("exige as quatro camadas", () => {
    expect(missingXssLabDefenses({})).toEqual(["escape", "csp", "safedom", "sanitize"]);
    expect(
      missingXssLabDefenses({
        escape: "on",
        csp: "on",
        safedom: "on",
        sanitize: "on",
      }),
    ).toEqual([]);
  });
});
