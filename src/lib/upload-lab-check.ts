export const UPLOAD_LAB_GAPS: Record<string, string> = {
  content: "O tipo ainda vem do nome ou do header. Confira a assinatura do conteúdo e reprocesse a imagem.",
  rename: "O arquivo ainda é salvo com o nome do cliente. Gere um id no servidor.",
  size: "Ainda não há limite de tamanho no servidor.",
  isolate:
    "Os arquivos ainda são servidos da origem da aplicação. Use uma origem separada, sem cookies ou outras credenciais da aplicação, com `X-Content-Type-Options: nosniff`.",
  svg: "SVG ainda entra como está. Recuse ou converta para PNG.",
};

type UploadLabForm = {
  content?: string | null;
  rename?: string | null;
  size?: string | null;
  isolate?: string | null;
  svg?: string | null;
  /** Confiar no `Content-Type` do pedido: aceito no formulário, mas não conta como defesa. */
  contenttype?: string | null;
};

/** Checker puro do lab de upload. Devolve as chaves das defesas que faltam, na ordem do painel. */
export function missingUploadLabDefenses(form: UploadLabForm) {
  const missing: string[] = [];
  if (form.content !== "on") missing.push("content");
  if (form.rename !== "on") missing.push("rename");
  if (form.size !== "on") missing.push("size");
  if (form.isolate !== "on") missing.push("isolate");
  if (form.svg !== "reject" && form.svg !== "convert") missing.push("svg");
  return missing;
}
