export const PHISHING_LAB_GAPS: Record<string, string> = {
  msg1:
    "Neste cenário, o evento foi confirmado diretamente no app e a mensagem não pede segredo. A confirmação independente sustenta a classificação legítima.",
  msg2:
    "Domínio divergente, pressão e pedido de senha formam o caso explícito de phishing. Não use o endereço recebido; reporte pelo canal oficial.",
  msg3:
    "Um executável inesperado sem confirmação independente é pelo menos suspeito. Não abra; confirme com o RH por um contato conhecido.",
  nosenha:
    "Falta uma política que nunca peça senha ou código por e-mail. Segredos só devem entrar no app oficial acessado pelo caminho conhecido.",
  alerta:
    "Falta tornar logins novos visíveis dentro do app e por aviso, para que a pessoa possa confirmar a atividade por canal independente.",
  mfa:
    "Falta autenticação de dois fatores (2FA). Ela reduz o valor de uma senha roubada, embora não elimine toda tentativa de phishing.",
  treino:
    "Falta treino interno autorizado e seguro, com canal de relato e foco em aprendizagem em vez de punição.",
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
