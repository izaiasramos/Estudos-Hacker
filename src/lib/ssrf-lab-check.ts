export const SSRF_LAB_GAPS: Record<string, string> = {
  scheme: "A prévia ainda aceita qualquer protocolo, como `file:`. Permita só `https:`.",
  resolve:
    "Falta conferir o IP real do destino. Recuse IPs internos (como 127.0.0.1 e 169.254.x.x) e conecte exatamente no IP que você validou.",
  redirect: "O servidor ainda segue redirecionamentos sem conferir. Não siga, ou confira cada novo destino de novo.",
  response: "O corpo inteiro ainda volta para o cliente. Devolva só o resumo, com limite de tamanho e tempo.",
};

type SsrfLabForm = {
  scheme?: string | null;
  resolve?: string | null;
  redirect?: string | null;
  response?: string | null;
  /** Bloquear `localhost` pelo texto: aceito no formulário, mas não conta como defesa. */
  textblock?: string | null;
};

/** Checker puro do lab de SSRF. Devolve as chaves das defesas que faltam, na ordem do painel. */
export function missingSsrfLabDefenses(form: SsrfLabForm) {
  const missing: string[] = [];
  if (form.scheme !== "on") missing.push("scheme");
  if (form.resolve !== "on") missing.push("resolve");
  if (form.redirect !== "on") missing.push("redirect");
  if (form.response !== "on") missing.push("response");
  return missing;
}
