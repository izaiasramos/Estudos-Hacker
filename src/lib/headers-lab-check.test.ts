import { describe, expect, it } from "vitest";
import { missingHeadersLabDefenses } from "@/lib/headers-lab-check";

const ALL = { fields: "on", errors: "on", powered: "on", csp: "nonce", hsts: "on", nosniff: "on", frame: "self" };

describe("missingHeadersLabDefenses", () => {
  it("aponta todas as lacunas na configuração inicial", () => {
    expect(missingHeadersLabDefenses({ csp: "none", frame: "any" })).toEqual([
      "fields",
      "errors",
      "powered",
      "csp",
      "hsts",
      "nosniff",
      "frame",
    ]);
  });

  it("passa com tudo fechado; frame-ancestors aceita 'self' ou 'none'", () => {
    expect(missingHeadersLabDefenses(ALL)).toEqual([]);
    expect(missingHeadersLabDefenses({ ...ALL, frame: "none" })).toEqual([]);
  });

  it("CSP com 'unsafe-inline' não conta como defesa", () => {
    expect(missingHeadersLabDefenses({ ...ALL, csp: "unsafe-inline" })).toEqual(["csp"]);
  });

  it("headers sem tirar os campos do JSON não fecham a exposição", () => {
    expect(missingHeadersLabDefenses({ ...ALL, fields: "" })).toEqual(["fields"]);
  });
});
