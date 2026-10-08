export const AUTH_LAB_GAPS: Record<string, string> = {
  hash: "A senha ainda seria guardada em texto puro. Use hash com algoritmo moderno (bcrypt ou Argon2).",
  generic:
    "A resposta ainda revela se o e-mail existe. Login inválido deve usar a mesma mensagem genérica.",
  policy:
    "Falta política mínima: tamanho e bloqueio de senhas óbvias antes de aceitar o cadastro.",
  limit: "Tentativas de login falhas ainda não são limitadas por IP ou conta.",
};

export function missingAuthLabDefenses(form: {
  hash?: string | null;
  generic?: string | null;
  policy?: string | null;
  limit?: string | null;
}) {
  const missing: string[] = [];
  if (form.hash !== "on") missing.push("hash");
  if (form.generic !== "on") missing.push("generic");
  if (form.policy !== "on") missing.push("policy");
  if (form.limit !== "on") missing.push("limit");
  return missing;
}
