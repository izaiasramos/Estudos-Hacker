export const SSRF_LAB_GAPS: Record<string, string> = {
  scheme: "A prévia ainda aceita qualquer esquema, como `file:`. Permita só `https:`.",
  resolve:
    "O destino ainda não é conferido depois de resolver o nome. Recuse IP interno, loopback e link-local e conecte exatamente ao IP validado.",
  redirect: "Redirect ainda é seguido sem checagem. Não siga, ou confira cada salto de novo.",
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
