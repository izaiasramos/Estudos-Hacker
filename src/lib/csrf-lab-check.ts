export const CSRF_LAB_GAPS: Record<string, string> = {
  token:
    "Falta provar que o pedido veio do seu formulário. Inclua um token anti-CSRF imprevisível e valide no servidor.",
  samesite:
    "O cookie ainda aceita SameSite=None, ou seja, viaja em pedidos de qualquer site. Use Lax ou Strict.",
  origin:
    "Falta conferir de onde o pedido veio. Compare o cabeçalho Origin (ou o Referer, se faltar) com o endereço exato esperado.",
  postonly:
    "A ação que muda dados ainda usa GET. Deixe o GET só para leitura e use POST, junto com as outras proteções.",
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
