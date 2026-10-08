export const CSRF_LAB_GAPS: Record<string, string> = {
  token: "Formulários de mutação ainda não carregam token anti-CSRF validado no servidor.",
  samesite: "SameSite precisa ser Lax ou Strict para segurar cookie em pedido cruzado comum.",
  origin: "POST sensível ainda não confere Origin ou Referer contra a origem esperada.",
  postonly: "Ainda existe mutação de estado via GET — fácil de disparar por link ou img.",
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
