export const AUTH_LAB_GAPS: Record<string, string> = {
  hash:
    "Falta escolher como guardar a senha: use hash com bcrypt, scrypt ou Argon2.",
  generic:
    "Essa resposta ainda revelaria se o email existe. Use a mesma mensagem e o mesmo status para qualquer login inválido.",
  policy:
    "Falta uma regra no cadastro que recuse senhas curtas, óbvias ou comuns.",
  limit:
    "Falta limitar as tentativas de login (rate limiting) para frear quem tenta adivinhar senhas.",
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
