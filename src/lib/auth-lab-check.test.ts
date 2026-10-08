import { describe, expect, it } from "vitest";
import { missingAuthLabDefenses } from "@/lib/auth-lab-check";

describe("auth lab checker", () => {
  it("exige as quatro defesas", () => {
    expect(missingAuthLabDefenses({})).toEqual(["hash", "generic", "policy", "limit"]);
    expect(
      missingAuthLabDefenses({
        hash: "on",
        generic: "on",
        policy: "on",
        limit: "on",
      }),
    ).toEqual([]);
  });
});
