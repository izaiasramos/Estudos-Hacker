export const AUTH_LAB_GAPS: Record<string, string> = {
  hash:
    "Na simulação, falta escolher hash com um algoritmo próprio para senhas, como bcrypt, scrypt ou Argon2.",
  generic:
    "A resposta escolhida ainda revelaria se o e-mail existe. Mantenha mensagem e status coerentes para qualquer falha de credencial.",
  policy:
    "Falta escolher uma política de cadastro que recuse senhas muito curtas, óbvias ou comuns.",
  limit:
    "Falta escolher rate limiting para desacelerar tentativas de login falhas e repetidas.",
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
