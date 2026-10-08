import { describe, expect, it } from "vitest";
import { MAX_PER_EMAIL, WINDOW_MS, clientIp, lockState } from "@/lib/login-throttle";

const NOW = Date.parse("2026-10-08T12:00:00.000Z");
const MIN = 60 * 1000;

describe("lockState", () => {
  it("libera abaixo do limite", () => {
    const failures = [NOW - 4 * MIN, NOW - 3 * MIN, NOW - 2 * MIN, NOW - MIN];
    expect(lockState(failures, NOW, MAX_PER_EMAIL)).toEqual({ locked: false });
  });

  it("bloqueia ao chegar no limite e libera quando a falha mais antiga sai da janela", () => {
    const failures = [10, 8, 6, 4, 2].map((ago) => NOW - ago * MIN);
    expect(lockState(failures, NOW, MAX_PER_EMAIL)).toEqual({
      locked: true,
      retryAt: NOW - 10 * MIN + WINDOW_MS,
    });
  });

  it("ignora falhas fora da janela", () => {
    const old = [20, 19, 18, 17, 16].map((ago) => NOW - ago * MIN);
    expect(lockState(old, NOW, MAX_PER_EMAIL)).toEqual({ locked: false });
  });

  it("com falhas acima do limite, espera sobrar menos que o limite na janela", () => {
    const failures = [14, 12, 10, 8, 6, 4].map((ago) => NOW - ago * MIN);
    // 6 falhas, limite 5: libera quando as duas mais antigas saem (a de 12 min atrás).
    expect(lockState(failures, NOW, MAX_PER_EMAIL)).toEqual({
      locked: true,
      retryAt: NOW - 12 * MIN + WINDOW_MS,
    });
  });
});

describe("clientIp", () => {
  it("usa o primeiro valor de x-forwarded-for", () => {
    const request = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(clientIp(request)).toBe("203.0.113.7");
  });

  it("cai num valor fixo quando não há cabeçalho", () => {
    expect(clientIp(new Request("http://localhost/"))).toBe("desconhecido");
  });
});
