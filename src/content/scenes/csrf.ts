import type { SceneCatalog } from "./types";

export const csrfScenes = {
  "csrf:csrf-proposito": {
    id: "scene-csrf-purpose-cross-site-request",
    type: "flow",
    eyebrow: "Pedido sob investigação",
    title: "Quem iniciou a transferência?",
    accessibleSummary:
      "Fluxo em quatro passos: um site externo induz uma ação, o navegador prepara o pedido, a sessão já aberta pode acompanhá-lo e o servidor precisa decidir se houve intenção legítima antes de alterar dados.",
    caption: "Decisão: toda ação que muda estado deve confirmar intenção, não apenas reconhecer a sessão.",
    tone: "danger",
    steps: [
      { id: "csrf-purpose-external-site", label: "Site externo", detail: "Inicia um pedido que a pessoa não planejou." },
      { id: "csrf-purpose-browser", label: "Navegador", detail: "Monta o pedido e pode incluir a sessão aberta." },
      { id: "csrf-purpose-server", label: "Servidor", detail: "Recebe um pedido com aparência autenticada." },
      { id: "csrf-purpose-state", label: "Mudança de estado", detail: "Só deve ocorrer quando a intenção for reconhecida." },
    ],
  },
  "csrf:csrf-defesas": {
    id: "scene-csrf-defenses-layered-boundary",
    type: "boundary",
    eyebrow: "Defesa em camadas",
    title: "O que um site externo não consegue provar?",
    accessibleSummary:
      "Diagrama de três zonas: o site externo pode tentar enviar um formulário; o navegador restringe cookies entre sites conforme SameSite; o servidor valida token, origem e método antes da mutação.",
    caption: "Decisão: combinar restrição do navegador com validações do servidor para reconhecer o fluxo legítimo.",
    tone: "defense",
    zones: [
      { id: "csrf-defense-external-zone", label: "Site externo", description: "Pode iniciar um envio, mas não deve conhecer a prova do app.", items: ["Formulário entre sites"] },
      { id: "csrf-defense-browser-zone", label: "Navegador", description: "Aplica limites ao contexto entre sites.", items: ["Política de mesma origem", "Cookie com SameSite"] },
      { id: "csrf-defense-server-zone", label: "Servidor", description: "Confirma o pedido antes de mudar estado.", items: ["Token anti-CSRF", "Origin ou Referer", "Método de mutação"] },
    ],
  },
  "csrf:csrf-sintomas": {
    id: "scene-csrf-investigation-request-sequence",
    type: "sequence",
    eyebrow: "Leitura do endpoint",
    title: "Uma lacuna basta para fechar o diagnóstico?",
    accessibleSummary:
      "Sequência de investigação em quatro eventos: identificar a mutação, observar quais credenciais o navegador envia, conferir token e origem e então concluir se as camadas restantes bloqueiam ou permitem o pedido forjado.",
    caption: "Decisão: registrar a lacuna sem declarar exploração até avaliar todas as camadas do pedido.",
    tone: "accent",
    events: [
      { id: "csrf-investigation-mutation", marker: "1", label: "Localize o efeito", detail: "Confirme qual estado o endpoint altera." },
      { id: "csrf-investigation-session", marker: "2", label: "Observe a sessão", detail: "Verifique quando o cookie acompanha o pedido." },
      { id: "csrf-investigation-layers", marker: "3", label: "Teste as camadas", detail: "Token, SameSite e origem podem interromper o fluxo." },
      { id: "csrf-investigation-conclusion", marker: "4", label: "Qualifique a conclusão", detail: "Diferencie lacuna observada de exploração demonstrada." },
    ],
  },
  "csrf:csrf-lab": {
    id: "scene-csrf-lab-transfer-checklist",
    type: "decision",
    eyebrow: "Simulação defensiva",
    title: "Qual checklist libera a transferência fictícia?",
    accessibleSummary:
      "Checklist simulado de uma transferência fictícia com três alternativas: validar token e origem em uma mutação protegida por SameSite, confiar apenas no cookie ou apenas trocar GET por POST. Somente a primeira combina as camadas já estudadas.",
    caption: "Decisão do lab: liberar a mutação apenas após validar token, origem, método e política de cookie.",
    tone: "defense",
    prompt: "Escolha a configuração que reconhece a sessão e também a intenção legítima.",
    options: [
      { id: "csrf-lab-layered", label: "Token + origem + SameSite + método de mutação", outcome: "As camadas se complementam antes de o servidor alterar o saldo fictício.", recommended: true },
      { id: "csrf-lab-cookie-only", label: "Somente cookie de sessão", outcome: "O navegador pode anexar a credencial sem comprovar a intenção." },
      { id: "csrf-lab-post-only", label: "Somente trocar GET por POST", outcome: "A semântica melhora, mas um formulário externo ainda pode enviar POST." },
    ],
  },
  "csrf:csrf-checkpoint": {
    id: "scene-csrf-checkpoint-layer-roles",
    type: "compare",
    eyebrow: "Papéis complementares",
    title: "Qual camada restringe e qual confirma?",
    accessibleSummary:
      "Comparação entre navegador e servidor: SameSite reduz o envio de cookie entre sites; no servidor, token, verificação de origem e método correto reconhecem ou recusam a intenção. Nenhuma camada deve ser confundida com autenticação ou autorização completas.",
    caption: "Decisão final: compor camadas pelo papel de cada uma e manter autorização em toda mutação.",
    tone: "defense",
    sides: [
      { id: "csrf-checkpoint-browser", label: "Navegador restringe", description: "Diminui pedidos autenticados entre sites.", items: ["SameSite adequado", "Política de mesma origem"] },
      { id: "csrf-checkpoint-server", label: "Servidor confirma", description: "Verifica o fluxo antes do efeito.", items: ["Token validado", "Origem esperada", "Método correto e autorização"] },
    ],
  },
} satisfies SceneCatalog;
