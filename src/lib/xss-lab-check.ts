export const XSS_LAB_GAPS: Record<string, string> = {
  escape: "A saída ainda concatena HTML cru. Codifique para o contexto (HTML, atributo, URL).",
  csp: "Falta Content-Security-Policy que limite script inline e origens desconhecidas.",
  safedom: "O comentário ainda entra via innerHTML. Para texto, prefira textContent ou API equivalente.",
  sanitize:
    "HTML rico do usuário ainda passa direto. Use sanitizador com lista permitida ou não aceite HTML.",
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
