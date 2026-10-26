import type { SceneCatalog } from "./types";

export const accessControlScenes = {
  "controle-acesso:idor-proposito": {
    id: "access-control-owner-resource",
    type: "compare",
    eyebrow: "Duas perguntas",
    title: "Saber quem entrou abre todas as portas?",
    accessibleSummary:
      "A cena contrasta identificação e permissão: reconhecer a pessoa inicia o pedido, mas a rota ainda precisa conferir se ela pode agir sobre aquele recurso.",
    caption: "Identidade inicia o pedido; dono, recurso e regra da rota decidem o acesso.",
    tone: "accent",
    sides: [
      { id: "access-control-owner-resource-identity", label: "Quem está pedindo?", description: "A sessão identifica a pessoa.", items: ["Identidade confirmada", "Pedido associado à sessão"] },
      { id: "access-control-owner-resource-permission", label: "Pode acessar este recurso?", description: "A rota aplica a regra ao recurso solicitado.", items: ["Dono conferido", "Papel permitido"] },
    ],
  },
  "controle-acesso:idor-onde": {
    id: "access-control-route-boundaries",
    type: "boundary",
    eyebrow: "Fronteiras reais",
    title: "Onde a permissão precisa morar?",
    accessibleSummary:
      "A cena separa interface, rota e dados: esconder controles na tela ajuda a experiência, mas somente a rota no servidor pode comparar a pessoa da sessão com o dono do recurso antes de consultar ou alterar dados.",
    caption: "A proteção está na rota que liga a identidade confiável ao recurso certo.",
    tone: "danger",
    zones: [
      { id: "access-control-route-boundaries-interface", label: "Interface", description: "Mostra apenas ações adequadas, sem ser a barreira de segurança.", items: ["Botão pode ficar oculto", "Identificador pode ser longo"] },
      { id: "access-control-route-boundaries-route", label: "Rota no servidor", description: "Decide cada leitura ou alteração.", items: ["Lê a identidade da sessão", "Nega quando a regra não permite"] },
      { id: "access-control-route-boundaries-resource", label: "Recurso", description: "Só é alcançado depois da decisão.", items: ["Pedido ligado ao dono", "Campos aceitos escolhidos pelo servidor"] },
    ],
  },
  "controle-acesso:idor-sintomas": {
    id: "access-control-query-path",
    type: "flow",
    eyebrow: "Siga o pedido",
    title: "O identificador chegou sozinho à consulta?",
    accessibleSummary:
      "O fluxo seguro parte do dono identificado pela sessão, passa pela rota, consulta o recurso usando identificador e dono juntos e só então permite ou nega a resposta.",
    caption: "Uma consulta só pelo identificador perde o dono no caminho.",
    tone: "defense",
    steps: [
      { id: "access-control-query-path-owner", label: "Dono na sessão", detail: "O servidor obtém a identidade sem confiar no corpo ou na URL." },
      { id: "access-control-query-path-route", label: "Regra da rota", detail: "A ação e o papel exigido são conferidos." },
      { id: "access-control-query-path-resource", label: "Recurso + dono", detail: "A busca combina o identificador pedido com o dono autenticado." },
      { id: "access-control-query-path-result", label: "Permitir ou negar", detail: "Ausência de vínculo termina em negação, sem revelar outro registro." },
    ],
  },
  "controle-acesso:idor-lab": {
    id: "access-control-simulated-checklist",
    type: "sequence",
    eyebrow: "Checklist simulado",
    title: "A rota fictícia reconhece o dono?",
    accessibleSummary:
      "Checklist simulado, sem executar código: conferir identidade vinda da sessão, filtro por identificador e dono, campos permitidos e negação padrão na rota fictícia de pedidos.",
    caption: "O lab apenas confere a configuração declarada; nenhum código do participante é executado.",
    tone: "defense",
    events: [
      { id: "access-control-simulated-checklist-session", marker: "1", label: "Conferir sessão", detail: "O dono vem da identidade reconhecida pelo servidor." },
      { id: "access-control-simulated-checklist-filter", marker: "2", label: "Combinar filtros", detail: "Identificador e dono precisam aparecer na mesma decisão." },
      { id: "access-control-simulated-checklist-fields", marker: "3", label: "Limitar alterações", detail: "A rota aceita somente os campos previstos." },
      { id: "access-control-simulated-checklist-deny", marker: "4", label: "Negar por padrão", detail: "Tudo o que não foi liberado termina bloqueado." },
    ],
  },
  "controle-acesso:idor-checkpoint": {
    id: "access-control-final-decision",
    type: "decision",
    eyebrow: "Decisão final",
    title: "Qual rota merece o selo?",
    accessibleSummary:
      "A decisão final compara uma rota que valida dono e papel no servidor e nega por padrão com alternativas que apenas escondem botões ou dificultam adivinhar identificadores.",
    caption: "O selo vai para a rota que decide no servidor e nasce fechada.",
    tone: "accent",
    prompt: "Qual conjunto protege o recurso mesmo quando o pedido é feito sem usar a interface?",
    options: [
      { id: "access-control-final-decision-server-rule", label: "Dono e papel conferidos na rota, com negação por padrão", outcome: "A regra acompanha cada recurso e bloqueia pedidos não liberados.", recommended: true },
      { id: "access-control-final-decision-hidden-button", label: "Botão escondido para quem não é administrador", outcome: "A interface muda, mas a rota continua acessível diretamente." },
      { id: "access-control-final-decision-long-id", label: "Identificador longo no endereço", outcome: "Fica difícil adivinhar, mas um identificador vazado ainda abre o recurso." },
    ],
  },
} satisfies SceneCatalog;
