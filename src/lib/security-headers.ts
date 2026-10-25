/**
 * Headers de segurança da própria plataforma (seção 21: ela aplica o que ensina na trilha de headers).
 * Funções puras: o `src/proxy.ts` e o `next.config.ts` só montam a resposta com o que sai daqui.
 */

export type CspOptions = {
  nonce: string;
  /** `next dev` precisa de `'unsafe-eval'` para o React montar a pilha de erro no navegador. */
  dev: boolean;
  /** Só com HTTPS. Em `http://localhost` (dev e E2E) o upgrade quebraria os pedidos. */
  https: boolean;
  /** Lab legado com `LAB_RUNTIME=local`: o iframe aponta para `http://127.0.0.1:<porta>`. */
  localLab: boolean;
};

export function contentSecurityPolicy({ nonce, dev, https, localLab }: CspOptions) {
  const directives: [string, ...string[]][] = [
    ["default-src", "'self'"],
    // Só script com o nonce desta resposta. `strict-dynamic` deixa esses scripts carregarem os chunks do Next.
    ["script-src", "'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(dev ? ["'unsafe-eval'"] : [])],
    // <style> e <link> só com nonce. Atributo `style=""` é permitido: o React usa para posição e atraso de
    // animação. Ele não executa código; o risco que sobra é estilo injetado, não script.
    ["style-src", "'self'", ...(dev ? ["'unsafe-inline'"] : [`'nonce-${nonce}'`])],
    ["style-src-attr", "'unsafe-inline'"],
    ["img-src", "'self'", "data:", "blob:"],
    ["font-src", "'self'"],
    ["connect-src", "'self'"],
    ["frame-src", "'self'", ...(localLab ? ["http://127.0.0.1:*"] : [])],
    // O lab embutido (/lab/pizzaria) roda num iframe do mesmo domínio. Outro site não enquadra a plataforma.
    ["frame-ancestors", "'self'"],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
  ];
  if (https) directives.push(["upgrade-insecure-requests"]);
  return directives.map((parts) => parts.join(" ")).join("; ");
}

/** Headers fixos, iguais em toda resposta (páginas, API e arquivos estáticos). */
export const STATIC_SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Legado para navegador sem `frame-ancestors`. Mesmo efeito: só o próprio domínio enquadra.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** HSTS só faz sentido sobre HTTPS; em HTTP o navegador ignora e em localhost atrapalharia. Sem `preload`. */
export const HSTS_HEADER = { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" };

/** Nonce novo a cada resposta: 128 bits aleatórios em base64. */
export function createNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/** Atrás da Vercel o TLS termina na borda; o protocolo original chega em `x-forwarded-proto`. */
export function isHttps(url: URL, forwardedProto: string | null) {
  const proto = forwardedProto?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  return proto === "https";
}
