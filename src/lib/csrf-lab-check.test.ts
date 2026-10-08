import { describe, expect, it } from "vitest";
import { missingCsrfLabDefenses } from "@/lib/csrf-lab-check";

describe("csrf lab checker", () => {
  it("exige token, SameSite, Origin e POST para mutação", () => {
    expect(missingCsrfLabDefenses({ samesite: "none" })).toEqual([
      "token",
      "samesite",
      "origin",
      "postonly",
    ]);
    expect(
      missingCsrfLabDefenses({
        token: "on",
        origin: "on",
        postonly: "on",
        samesite: "lax",
      }),
    ).toEqual([]);
  });
});
