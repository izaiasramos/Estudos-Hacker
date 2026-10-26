import type { SceneCatalog } from "./types";

export const phishingScenes = {
  "phishing:phishing-proposito": {
    id: "scene-phishing-purpose-decision-sequence",
    type: "sequence",
    eyebrow: "Decisão sob pressão",
    title: "Em que momento a história ganha poder?",
    accessibleSummary:
      "Sequência em três eventos: uma mensagem apresenta uma história plausível, a pessoa encontra pressão para agir e uma decisão como clicar, abrir, entregar um segredo ou aprovar algo produz o efeito pretendido.",
    caption: "Decisão: não agir só porque a história parece rotina; usar as barreiras oficiais.",
    tone: "danger",
    events: [
      { id: "phishing-purpose-story", marker: "Mensagem", label: "História plausível", detail: "O texto tenta parecer parte da rotina." },
      { id: "phishing-purpose-pressure", marker: "Pessoa", label: "Pressão para agir", detail: "A narrativa tenta acelerar uma escolha." },
      { id: "phishing-purpose-decision", marker: "Escolha", label: "Decisão apoiada", detail: "Política, canal de alerta, avisos e 2FA reduzem o impacto." },
    ],
  },
  "phishing:phishing-sinais": {
    id: "scene-phishing-signals-pause-confirm-flow",
    type: "flow",
    eyebrow: "Ritmo de verificação",
    title: "E se a urgência for apenas parte da história?",
    accessibleSummary:
      "Fluxo em três passos: reconhecer sinais como pedido de senha, urgência ou anexo inesperado; pausar sem clicar; confirmar no aplicativo ou canal oficial acessado por um caminho conhecido.",
    caption: "Decisão: tratar o sinal como hipótese, pausar e confirmar fora do caminho recebido.",
    tone: "accent",
    steps: [
      { id: "phishing-signals-observe", label: "Sinal", detail: "Pedido de segredo, urgência ou arquivo inesperado pede atenção." },
      { id: "phishing-signals-pause", label: "Pausa", detail: "Não clique, não abra e não responda sob pressão." },
      { id: "phishing-signals-confirm", label: "Confirmação", detail: "Abra o app ou use um canal oficial já conhecido." },
    ],
  },
  "phishing:phishing-classificar": {
    id: "scene-phishing-classification-evidence-action",
    type: "compare",
    eyebrow: "Triagem sem clique",
    title: "O que você sabe e o que fará agora?",
    accessibleSummary:
      "Comparação entre análise e resposta: primeiro separar a evidência observável da hipótese sobre a mensagem; depois escolher uma ação segura, como confirmar por canal separado, reportar ou encerrar a interação sem abrir o conteúdo.",
    caption: "Decisão: classificar com base na evidência disponível e agir sem transformar hipótese em certeza.",
    tone: "defense",
    sides: [
      { id: "phishing-classify-analysis", label: "Evidência e hipótese", description: "Descreva o que foi observado antes de concluir.", items: ["Domínio parecido e pedido de senha", "Executável inesperado atribuído ao RH"] },
      { id: "phishing-classify-action", label: "Ação segura", description: "Escolha um caminho que não dependa da mensagem.", items: ["Confirmar no app ou canal separado", "Reportar pelo canal interno"] },
    ],
  },
  "phishing:phishing-lab": {
    id: "scene-phishing-lab-inbox-checklist",
    type: "decision",
    eyebrow: "Simulação defensiva",
    title: "Qual rotina guia a caixa fictícia?",
    accessibleSummary:
      "Checklist simulado para mensagens fictícias com três opções: pausar e confirmar em canal independente, reportar sinais pelo canal interno ou investigar clicando no link. As duas primeiras opções apoiam a triagem; a última mantém a pessoa no caminho não verificado.",
    caption: "Decisão do lab: classificar sem clicar, confirmar por caminho independente e reportar pelo canal interno.",
    tone: "defense",
    prompt: "Selecione as ações adequadas para a triagem fictícia.",
    options: [
      { id: "phishing-lab-independent-confirmation", label: "Pausar e confirmar por canal independente", outcome: "A verificação não depende do remetente nem do link recebido.", recommended: true },
      { id: "phishing-lab-report", label: "Reportar pelo canal interno", outcome: "A equipe recebe o sinal sem exigir confronto com o remetente.", recommended: true },
      { id: "phishing-lab-click", label: "Clicar para descobrir se a página parece verdadeira", outcome: "A investigação segue justamente o caminho que ainda não foi confirmado." },
    ],
  },
  "phishing:phishing-checkpoint": {
    id: "scene-phishing-checkpoint-response-lifecycle",
    type: "lifecycle",
    eyebrow: "Resposta sustentável",
    title: "Como um sinal vira aprendizado sem virar culpa?",
    accessibleSummary:
      "Ciclo em quatro estágios: perceber um sinal, pausar a ação, confirmar por canal independente e reportar para resposta e aprendizagem. Treino seguro, 2FA, avisos de login e política de nunca pedir senha por e-mail reduzem a dependência de atenção perfeita.",
    caption: "Decisão final: tornar pausa, confirmação e relato um ciclo apoiado por controles de produto e processo.",
    tone: "defense",
    stages: [
      { id: "phishing-checkpoint-signal", label: "Perceber o sinal", detail: "Descrever o indício sem presumir autoria." },
      { id: "phishing-checkpoint-pause", label: "Pausar", detail: "Interromper clique, abertura, resposta ou aprovação." },
      { id: "phishing-checkpoint-confirm", label: "Confirmar", detail: "Usar o app ou um contato oficial conhecido." },
      { id: "phishing-checkpoint-report", label: "Reportar e aprender", detail: "Acionar resposta, avisos, 2FA, política e treino seguro." },
    ],
  },
} satisfies SceneCatalog;
