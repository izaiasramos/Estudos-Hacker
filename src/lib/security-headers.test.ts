import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, createNonce, isHttps } from "@/lib/security-headers";

const base = { nonce: "abc123", dev: false, https: true, localLab: false };

function directive(csp: string, name: string) {
  return csp.split("; ").find((part) => part === name || part.startsWith(`${name} `));
}

describe("contentSecurityPolicy", () => {
  it("em produção, script só com nonce e sem unsafe-inline nem unsafe-eval", () => {
    const csp = contentSecurityPolicy(base);
    expect(directive(csp, "script-src")).toBe("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(directive(csp, "style-src")).toBe("style-src 'self' 'nonce-abc123'");
  });

  it("fecha objeto, base, formulário e enquadramento por outro site", () => {
    const csp = contentSecurityPolicy(base);
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(directive(csp, "base-uri")).toBe("base-uri 'self'");
    expect(directive(csp, "form-action")).toBe("form-action 'self'");
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'self'");
  });

  it("upgrade-insecure-requests só sobre HTTPS", () => {
    expect(contentSecurityPolicy(base)).toContain("upgrade-insecure-requests");
    expect(contentSecurityPolicy({ ...base, https: false })).not.toContain("upgrade-insecure-requests");
  });

  it("dev libera eval; lab local libera o iframe em 127.0.0.1", () => {
    expect(directive(contentSecurityPolicy({ ...base, dev: true }), "script-src")).toContain("'unsafe-eval'");
    expect(directive(contentSecurityPolicy(base), "frame-src")).toBe("frame-src 'self'");
    expect(directive(contentSecurityPolicy({ ...base, localLab: true }), "frame-src")).toBe(
      "frame-src 'self' http://127.0.0.1:*",
    );
  });
});

describe("nonce e protocolo", () => {
  it("nonce muda a cada chamada e tem 128 bits", () => {
    const a = createNonce();
    expect(a).not.toBe(createNonce());
    expect(atob(a)).toHaveLength(16);
  });

  it("confia em x-forwarded-proto atrás da borda", () => {
    expect(isHttps(new URL("http://app.local/"), "https")).toBe(true);
    expect(isHttps(new URL("http://localhost:3000/"), null)).toBe(false);
    expect(isHttps(new URL("https://estudos-hacker.vercel.app/"), null)).toBe(true);
  });
});
