import type { SceneCatalog } from "./types";

export const xssScenes = {
  "xss:xss-proposito": {
    id: "scene-xss-proposito-data-to-browser",
    type: "flow",
    eyebrow: "Fronteira em foco",
    title: "Quando o comentário deixa de ser só comentário?",
    accessibleSummary:
      "Fluxo em três passos: um dado não confiável entra como comentário, a página o mistura ao conteúdo ativo e o navegador o interpreta como código no contexto da sessão.",
    caption:
      "Decisão: manter o dado não confiável separado do HTML e do JavaScript executáveis.",
    tone: "danger",
    steps: [
      { id: "xss-purpose-input", label: "Dado recebido", detail: "Um comentário chega ao aplicativo." },
      { id: "xss-purpose-page", label: "Página montada", detail: "O conteúdo é inserido sem preservar a fronteira." },
      { id: "xss-purpose-code", label: "Código no navegador", detail: "A página dá comportamento ao que deveria ser texto." },
    ],
  },
  "xss:xss-tipos": {
    id: "scene-xss-types-data-routes",
    type: "sequence",
    eyebrow: "Rastro do dado",
    title: "O dado voltou agora ou esperou uma visita?",
    accessibleSummary:
      "Sequência com três trajetos de XSS: o dado pode voltar na resposta atual, permanecer salvo para visitas futuras ou ser transformado em conteúdo ativo pelo código da própria página; todos terminam no navegador.",
    caption: "Decisão: seguir o dado até o ponto em que ele cruza a fronteira entre conteúdo e código.",
    tone: "accent",
    events: [
      { id: "xss-types-reflected", marker: "Agora", label: "Refletido", detail: "Pedido → resposta atual → navegador." },
      { id: "xss-types-stored", marker: "Depois", label: "Armazenado", detail: "Dado salvo → visita futura → navegador." },
      { id: "xss-types-dom", marker: "Na página", label: "Baseado no DOM", detail: "Dado → código da página → DOM ativo." },
    ],
  },
  "xss:xss-sintomas": {
    id: "scene-xss-defenses-context-choice",
    type: "compare",
    eyebrow: "Escolha de saída",
    title: "Texto simples ou HTML realmente necessário?",
    accessibleSummary:
      "Comparação entre duas decisões: para texto, usar APIs de DOM seguro; quando HTML for requisito, sanitizar por lista permitida. Em ambos os lados, uma política de scripts acrescenta contenção sem substituir a prevenção.",
    caption: "Decisão: usar DOM seguro por padrão, sanitizar apenas o HTML necessário e tratar CSP como contenção adicional.",
    tone: "defense",
    sides: [
      {
        id: "xss-defense-text",
        label: "Só precisa de texto",
        description: "Preserve o valor como dado.",
        items: ["textContent", "Interpolação segura do framework"],
      },
      {
        id: "xss-defense-html",
        label: "Precisa de HTML rico",
        description: "Permita somente a marcação prevista.",
        items: ["Sanitização por lista permitida", "CSP com nonce como camada adicional"],
      },
    ],
  },
  "xss:xss-lab": {
    id: "scene-xss-lab-panel-checklist",
    type: "decision",
    eyebrow: "Simulação defensiva",
    title: "Como o painel fictício deve exibir comentários?",
    accessibleSummary:
      "Checklist simulado com três opções para um painel fictício: renderizar texto com DOM seguro, sanitizar HTML quando ele for requisito ou inserir conteúdo arbitrário como HTML. As duas primeiras decisões preservam a fronteira conforme o contexto; a última cria risco.",
    caption: "Decisão do lab: registrar DOM seguro para texto, sanitização para HTML necessário e CSP como camada de contenção.",
    tone: "defense",
    prompt: "Selecione a configuração coerente com o conteúdo que o painel precisa mostrar.",
    options: [
      { id: "xss-lab-safe-text", label: "Mostrar somente texto com API segura", outcome: "O comentário continua sendo dado, sem criar elementos ativos.", recommended: true },
      { id: "xss-lab-sanitized-html", label: "Sanitizar o HTML rico permitido", outcome: "Apenas tags e atributos previstos chegam à renderização.", recommended: true },
      { id: "xss-lab-raw-html", label: "Inserir qualquer comentário como HTML", outcome: "O navegador pode interpretar conteúdo não confiável como código." },
    ],
  },
  "xss:xss-checkpoint": {
    id: "scene-xss-checkpoint-defense-lifecycle",
    type: "lifecycle",
    eyebrow: "Modelo consolidado",
    title: "Em qual etapa o dado quase virou código?",
    accessibleSummary:
      "Ciclo defensivo em quatro estágios: classificar o contexto de saída, manter texto em APIs seguras, sanitizar o HTML estritamente necessário e conter scripts inesperados com CSP; a revisão retorna ao contexto sempre que a interface muda.",
    caption: "Decisão final: prevenir a interpretação na saída e manter CSP como redução de impacto, não como substituta.",
    tone: "defense",
    stages: [
      { id: "xss-checkpoint-context", label: "Reconhecer o contexto", detail: "Texto, atributo, HTML ou script pedem decisões diferentes." },
      { id: "xss-checkpoint-safe-dom", label: "Preservar como dado", detail: "Preferir saída por contexto e DOM seguro." },
      { id: "xss-checkpoint-sanitize", label: "Tratar HTML necessário", detail: "Sanitizar com lista permitida antes de renderizar." },
      { id: "xss-checkpoint-contain", label: "Conter o impacto", detail: "Aplicar CSP coerente e revisar o fluxo novamente." },
    ],
  },
} satisfies SceneCatalog;
