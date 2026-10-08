export const PHISHING_LAB_GAPS: Record<string, string> = {
  msg1: "O aviso de login legítimo do produto não pede senha nem link encurtado suspeito.",
  msg2: "Mensagem com domínio lookalike e pedido de senha é phishing.",
  msg3: "Anexo executável inesperado, mesmo com nome conhecido, é pelo menos suspeito.",
  nosenha: "Produto ainda descreve coletar senha por e-mail.",
  alerta: "Falta avisar login novo ou dispositivo desconhecido.",
  mfa: "Contas sensíveis ainda não oferecem segundo fator.",
  treino: "Falta simulação interna de phishing para o time.",
};

const CLASSIFICATION: Record<string, string> = {
  msg1: "legitimo",
  msg2: "phishing",
  msg3: "suspeito",
};

type PhishingLabForm = {
  msg1?: string | null;
  msg2?: string | null;
  msg3?: string | null;
  nosenha?: string | null;
  alerta?: string | null;
  mfa?: string | null;
  treino?: string | null;
};

export function missingPhishingLabDefenses(form: PhishingLabForm) {
  const missing: string[] = [];
  if (form.msg1 !== CLASSIFICATION.msg1) missing.push("msg1");
  if (form.msg2 !== CLASSIFICATION.msg2) missing.push("msg2");
  if (form.msg3 !== CLASSIFICATION.msg3) missing.push("msg3");
  if (form.nosenha !== "on") missing.push("nosenha");
  if (form.alerta !== "on") missing.push("alerta");
  if (form.mfa !== "on") missing.push("mfa");
  if (form.treino !== "on") missing.push("treino");
  return missing;
}
