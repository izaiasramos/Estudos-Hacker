export const IDOR_LAB_GAPS: Record<string, string> = {
  owner: "A consulta ainda busca o pedido só pelo id. Filtre também pelo dono da sessão.",
  server: "O papel ainda é conferido só na interface. A rota precisa conferir no servidor.",
  deny: "Rota nova ainda nasce aberta. Negue por padrão e libere de propósito.",
  allowlist: "O servidor ainda grava qualquer campo do corpo, inclusive `role` e `userId`. Use lista permitida.",
  response: "Pedido de outra pessoa ainda volta com 200 e o conteúdo. Responda 404 ou 403, sem os dados.",
};

type IdorLabForm = {
  owner?: string | null;
  server?: string | null;
  deny?: string | null;
  allowlist?: string | null;
  response?: string | null;
  /** UUID no lugar do id sequencial: aceito, mas não conta como defesa. */
  uuid?: string | null;
};

/** Checker puro do lab de controle de acesso. Devolve as chaves das defesas que faltam. */
export function missingIdorLabDefenses(form: IdorLabForm) {
  const missing: string[] = [];
  if (form.owner !== "on") missing.push("owner");
  if (form.server !== "on") missing.push("server");
  if (form.deny !== "on") missing.push("deny");
  if (form.allowlist !== "on") missing.push("allowlist");
  if (form.response !== "404" && form.response !== "403") missing.push("response");
  return missing;
}
