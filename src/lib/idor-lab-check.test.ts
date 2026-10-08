import { describe, expect, it } from "vitest";
import { missingIdorLabDefenses } from "@/lib/idor-lab-check";

const ALL = { owner: "on", server: "on", deny: "on", allowlist: "on" };

describe("missingIdorLabDefenses", () => {
  it("aponta todas as lacunas na configuração inicial", () => {
    expect(missingIdorLabDefenses({ response: "200" })).toEqual([
      "owner",
      "server",
      "deny",
      "allowlist",
      "response",
    ]);
  });

  it("aceita 404 ou 403 para recurso de outra pessoa", () => {
    expect(missingIdorLabDefenses({ ...ALL, response: "404" })).toEqual([]);
    expect(missingIdorLabDefenses({ ...ALL, response: "403" })).toEqual([]);
  });

  it("UUID sozinho não fecha o buraco", () => {
    expect(missingIdorLabDefenses({ uuid: "on", response: "404" })).toEqual([
      "owner",
      "server",
      "deny",
      "allowlist",
    ]);
  });
});
