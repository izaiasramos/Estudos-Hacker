export const XSS_LAB_GAPS: Record<string, string> = {
  escape:
    "A saída ainda mistura dado e estrutura. Trate o valor para o contexto exato em que será inserido.",
  csp:
    "Falta a camada adicional de CSP para restringir scripts. Ela contém impacto, mas não substitui DOM seguro ou sanitização.",
  safedom:
    "Texto comum ainda chega a uma API que interpreta HTML. Use textContent ou a interpolação segura do framework.",
  sanitize:
    "HTML rico ainda aceita construções arbitrárias. Mantenha somente tags e atributos necessários com um sanitizador confiável.",
};

export function missingXssLabDefenses(form: {
  escape?: string | null;
  csp?: string | null;
  safedom?: string | null;
  sanitize?: string | null;
}) {
  const missing: string[] = [];
  if (form.escape !== "on") missing.push("escape");
  if (form.csp !== "on") missing.push("csp");
  if (form.safedom !== "on") missing.push("safedom");
  if (form.sanitize !== "on") missing.push("sanitize");
  return missing;
}
