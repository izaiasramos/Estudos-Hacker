export const HEADERS_LAB_GAPS: Record<string, string> = {
  fields: "O JSON ainda devolve o registro inteiro, com `password_hash` e `reset_token`. Escolha no servidor os campos que saem.",
  errors: "Erro ainda sai com a pilha completa. Mande mensagem genérica e deixe o detalhe no log do servidor.",
  powered: "A resposta ainda anuncia `X-Powered-By`. Remova o header.",
  csp: "A CSP ainda falta ou usa `'unsafe-inline'`. Use nonce por resposta.",
  hsts: "Falta `Strict-Transport-Security` para o navegador ficar só em HTTPS.",
  nosniff:
    "Falta `X-Content-Type-Options: nosniff`, que impede o navegador de tentar adivinhar outro tipo de conteúdo.",
  frame: "Qualquer site ainda pode enquadrar a página. Use `frame-ancestors 'self'` ou `'none'`.",
};

type HeadersLabForm = {
  fields?: string | null;
  errors?: string | null;
  powered?: string | null;
  csp?: string | null;
  hsts?: string | null;
  nosniff?: string | null;
  frame?: string | null;
};

/** Checker puro do lab de headers. Devolve as chaves das defesas que faltam, na ordem do painel. */
export function missingHeadersLabDefenses(form: HeadersLabForm) {
  const missing: string[] = [];
  if (form.fields !== "on") missing.push("fields");
  if (form.errors !== "on") missing.push("errors");
  if (form.powered !== "on") missing.push("powered");
  if (form.csp !== "nonce") missing.push("csp");
  if (form.hsts !== "on") missing.push("hsts");
  if (form.nosniff !== "on") missing.push("nosniff");
  if (form.frame !== "self" && form.frame !== "none") missing.push("frame");
  return missing;
}
