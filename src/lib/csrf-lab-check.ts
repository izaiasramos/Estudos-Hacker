export const CSRF_LAB_GAPS: Record<string, string> = {
  token:
    "Nesta simulação, a mutação ainda não comprova participação no fluxo legítimo. Inclua e valide um token anti-CSRF imprevisível.",
  samesite:
    "O cookie ainda aceita SameSite=None. Para este fluxo, Lax ou Strict restringe seu envio em pedidos cross-site comuns.",
  origin:
    "A procedência ainda não é conferida. Compare Origin — e Referer como fallback definido — com a origem exata esperada.",
  postonly:
    "A operação ainda muda estado via GET. Reserve GET para leitura e use POST com as demais proteções para a mutação.",
};

export function missingCsrfLabDefenses(form: {
  token?: string | null;
  origin?: string | null;
  postonly?: string | null;
  samesite?: string | null;
}) {
  const missing: string[] = [];
  if (form.token !== "on") missing.push("token");
  const sameSite = form.samesite ?? "";
  if (sameSite !== "lax" && sameSite !== "strict") missing.push("samesite");
  if (form.origin !== "on") missing.push("origin");
  if (form.postonly !== "on") missing.push("postonly");
  return missing;
}
