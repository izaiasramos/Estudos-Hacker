import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "phishing",
  title: "Phishing interno",
  summary:
    "Investigue mensagens plausíveis sem clicar, confirme pelo canal oficial e projete barreiras humanas e técnicas.",
};

export const UNITS: Unit[] = [
  {
    id: "phishing-proposito",
    order: 1,
    title: "A mensagem que parece rotina",
    summary: "Phishing transforma confiança, pressa e hábito em caminho para uma decisão perigosa.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "alvo",
        prompt: "Qual é o primeiro alvo de uma mensagem de phishing?",
        choices: [
          {
            id: "pessoa",
            label: "A decisão da pessoa diante de uma história plausível",
            correct: true,
            explain: "Isso mesmo. A mensagem tenta induzir clique, abertura, entrega de segredo ou aprovação antes da verificação.",
          },
          {
            id: "cpu",
            label: "A capacidade de processamento do servidor",
            explain: "Phishing começa pela persuasão. O componente técnico pode vir depois da decisão induzida.",
          },
        ],
      },
      {
        kind: "choice",
        id: "dev",
        prompt: "Qual conjunto reduz o impacto de phishing sem depender de atenção perfeita?",
        choices: [
          {
            id: "politica",
            label: "Política clara, canal de alerta, avisos de login, 2FA e treino seguro",
            correct: true,
            explain: "Controles de produto, processo e aprendizagem se complementam e tornam um erro menos decisivo.",
          },
          {
            id: "sql",
            label: "Apenas ensinar a procurar erros de ortografia",
            explain: "Mensagens maliciosas podem ser impecáveis. A defesa precisa incluir confirmação independente e barreiras técnicas.",
          },
        ],
      },
      {
        kind: "choice",
        id: "lab",
        prompt: "O que a simulação desta trilha permite?",
        choices: [
          {
            id: "ficticio",
            label: "Classificar mensagens fictícias e decidir defesas de produto",
            correct: true,
            explain: "É uma simulação defensiva de decisão. Nenhuma mensagem é enviada e nenhuma credencial é coletada.",
          },
          {
            id: "clone",
            label: "Criar uma página falsa e testar pessoas reais sem consentimento",
            explain: "Isso ultrapassa o limite ético. O laboratório trabalha apenas com cenários fictícios e controles defensivos.",
          },
        ],
      },
    ],
  },
  {
    id: "phishing-sinais",
    order: 2,
    title: "Sinais levantam hipóteses",
    summary: "Urgência, origem aparente, pedido e contexto orientam a investigação — não provam autenticidade.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "senha",
        prompt: "Uma mensagem pede sua senha para confirmar a conta. Qual é a decisão segura?",
        choices: [
          {
            id: "phish",
            label: "Não fornecer; abrir o app pelo caminho conhecido e verificar a situação",
            correct: true,
            explain: "Pedidos de segredo contrariam uma política saudável. Confirme diretamente no app ou com o suporte oficial, sem usar o link recebido.",
          },
          {
            id: "ok",
            label: "Fornecer se o remetente, o logo e o texto parecerem corretos",
            explain: "Esses elementos podem ser copiados ou falsificados. Aparência plausível não autentica a mensagem.",
          },
        ],
      },
      {
        kind: "choice",
        id: "urgente",
        prompt: "Urgência extrema acompanha um link para resolver o problema. O que fazer?",
        choices: [
          {
            id: "pausa",
            label: "Pausar e confirmar no app ou canal oficial acessado sem o link",
            correct: true,
            explain: "A pausa quebra a pressão. Digite o endereço conhecido, use o app instalado ou contate um canal já verificado.",
          },
          {
            id: "clique",
            label: "Clicar logo, porque a urgência demonstra legitimidade",
            explain: "Urgência só torna a história persuasiva; nunca prova quem enviou a mensagem.",
          },
        ],
      },
      {
        kind: "choice",
        id: "anexo",
        prompt: "Chega um executável inesperado com o nome do RH. Qual conclusão é adequada?",
        choices: [
          {
            id: "sus",
            label: "É suspeito; não abrir e confirmar por um canal já conhecido",
            correct: true,
            explain: "O tipo de arquivo e a ausência de contexto exigem verificação independente. O nome exibido do remetente não basta.",
          },
          {
            id: "legit",
            label: "É legítimo porque cita um setor real da empresa",
            explain: "Conhecer nomes internos pode tornar a mensagem plausível, mas não comprova sua origem.",
          },
        ],
      },
    ],
  },
  {
    id: "phishing-classificar",
    order: 3,
    title: "Classificar sem clicar",
    summary: "Separe evidência, hipótese e ação segura em três mensagens fictícias.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "caso1",
        prompt: "Um aviso esperado não pede segredo e orienta abrir o app pelo caminho conhecido. Como classificá-lo após confirmar no app?",
        choices: [
          {
            id: "legitimo",
            label: "Legítimo neste cenário confirmado",
            correct: true,
            explain: "A confirmação independente no app, e não apenas os sinais da mensagem, sustenta a classificação.",
          },
          {
            id: "phishing",
            label: "Phishing sempre, porque todo aviso de login é falso",
            explain: "Avisos reais existem. Trate sinais como hipóteses e confirme a atividade pelo canal oficial.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso2",
        prompt: "Um domínio parecido com o oficial pede senha em dez minutos. Como agir?",
        choices: [
          {
            id: "phishing",
            label: "Classificar como phishing e reportar pelo canal interno",
            correct: true,
            explain: "O domínio divergente, o pedido de segredo e a pressão formam um cenário explícito da simulação. Não use o link para investigar.",
          },
          {
            id: "suspeito",
            label: "Responder à mensagem para perguntar se é verdadeira",
            explain: "Responder mantém você no canal possivelmente controlado pelo atacante. Use o app ou contato oficial conhecido.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso3",
        prompt: "O RH aparente envia um executável que você não esperava. Qual classificação orienta a próxima ação?",
        choices: [
          {
            id: "suspeito",
            label: "Suspeito; não abrir e confirmar por canal separado",
            correct: true,
            explain: "Ainda não há prova de autoria, mas há risco suficiente para interromper a ação e verificar de forma independente.",
          },
          {
            id: "legitimo",
            label: "Legítimo porque o nome do remetente é conhecido",
            explain: "Nome e endereço aparente podem ser falsificados ou vir de conta comprometida. Contexto e confirmação importam.",
          },
        ],
      },
    ],
  },
  {
    id: "phishing-lab",
    order: 4,
    title: "Simule a triagem da caixa",
    summary: "Checklist de decisão e configuração: classifique cenários fictícios e selecione barreiras de produto.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "phishing-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "Consolide a pausa, a confirmação independente e as defesas que limitam impacto.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual programa interno reduz a chance e o impacto de phishing?",
        choices: [
          {
            id: "todas",
            label: "Treino seguro, 2FA, avisos de login, canal de alerta e nenhuma senha por e-mail",
            correct: true,
            explain: "O conjunto ajuda a reconhecer tentativas, confirmar eventos e conter o dano sem exigir atenção perfeita.",
          },
          {
            id: "punir",
            label: "Punir silenciosamente quem erra, sem oferecer treino ou alerta",
            explain: "O medo desestimula relatos rápidos. Um programa saudável facilita reportar, aprender e responder.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "O que demonstra a conclusão desta investigação?",
        choices: [
          {
            id: "lab",
            label: "Concluir a triagem fictícia, selecionar defesas e fechar este checkpoint",
            correct: true,
            explain: "A simulação pratica decisões; o checkpoint confirma o modelo de verificação e contenção.",
          },
          {
            id: "ler",
            label: "Apenas memorizar que mensagens urgentes são falsas",
            explain: "Urgência é sinal, não prova. A habilidade é pausar e confirmar por canal oficial sem usar o caminho recebido.",
          },
        ],
      },
    ],
  },
];
