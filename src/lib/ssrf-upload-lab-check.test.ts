import { describe, expect, it } from "vitest";
import { missingSsrfLabDefenses } from "@/lib/ssrf-lab-check";
import { missingUploadLabDefenses } from "@/lib/upload-lab-check";

describe("missingSsrfLabDefenses", () => {
  it("aponta todas as lacunas na configuração inicial", () => {
    expect(missingSsrfLabDefenses({})).toEqual(["scheme", "resolve", "redirect", "response"]);
  });

  it("passa com as quatro defesas", () => {
    expect(missingSsrfLabDefenses({ scheme: "on", resolve: "on", redirect: "on", response: "on" })).toEqual([]);
  });

  it("bloquear localhost pelo texto não substitui conferir o IP resolvido", () => {
    expect(missingSsrfLabDefenses({ scheme: "on", textblock: "on", redirect: "on", response: "on" })).toEqual([
      "resolve",
    ]);
  });
});

describe("missingUploadLabDefenses", () => {
  const ALL = { content: "on", rename: "on", size: "on", isolate: "on" };

  it("aponta todas as lacunas na configuração inicial", () => {
    expect(missingUploadLabDefenses({ svg: "accept" })).toEqual(["content", "rename", "size", "isolate", "svg"]);
  });

  it("SVG recusado ou convertido passa; aceito como está não", () => {
    expect(missingUploadLabDefenses({ ...ALL, svg: "reject" })).toEqual([]);
    expect(missingUploadLabDefenses({ ...ALL, svg: "convert" })).toEqual([]);
    expect(missingUploadLabDefenses({ ...ALL, svg: "accept" })).toEqual(["svg"]);
  });

  it("confiar no Content-Type não substitui conferir o conteúdo", () => {
    expect(missingUploadLabDefenses({ ...ALL, content: "", contenttype: "on", svg: "reject" })).toEqual(["content"]);
  });
});
