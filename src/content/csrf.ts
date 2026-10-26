import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "csrf",
  title: "Falsificação de pedidos entre sites (CSRF)",
  summary:
    "Investigue como outro site tenta usar uma sessão já aberta e combine camadas para reconhecer a intenção legítima.",
};

export const UNITS: Unit[] = [
  {
    id: "csrf-proposito",
    order: 1,
    title: "Uma transferência que ninguém iniciou",
    summary: "Cross-Site Request Forgery explora a confiança do servidor na sessão do navegador.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "cookie",
        prompt: "Por que uma sessão já aberta pode viabilizar Cross-Site Request Forgery (CSRF)?",
        choices: [
          {
            id: "auto",
            label: "O navegador pode anexar o cookie da sessão a um pedido iniciado por outro site",
            correct: true,
            explain: "Exato. Se o cookie acompanhar o pedido e nenhuma camada confirmar a intenção, o servidor pode aceitar uma ação forjada como legítima.",
          },
          {
            id: "senha",
            label: "Porque o site atacante precisa descobrir e reenviar a senha",
            explain: "CSRF normalmente não precisa conhecer a senha. Ele tenta aproveitar a credencial que o navegador já envia.",
          },
          {
            id: "sql",
            label: "Porque todo pedido entre sites altera dados automaticamente",
            explain: "O pedido só causa efeito se o endpoint aceitar a operação e suas defesas não o recusarem.",
          },
        ],
      },
      {
        kind: "choice",
        id: "xss",
        prompt: "Qual contraste separa CSRF de XSS?",
        choices: [
          {
            id: "nao",
            label: "XSS injeta conteúdo ativo na página; CSRF força um pedido usando uma sessão existente",
            correct: true,
            explain: "Correto. As falhas podem se combinar, mas têm mecanismos e decisões defensivas diferentes.",
          },
          {
            id: "sim",
            label: "Não há diferença: ambos dependem de inserir HTML na página",
            explain: "CSRF pode usar um formulário externo sem injetar nada na página legítima. O foco é a autenticidade do pedido.",
          },
        ],
      },
      {
        kind: "choice",
        id: "alvo",
        prompt: "Qual operação exige proteção contra pedidos forjados?",
        choices: [
          {
            id: "mutacao",
            label: "Uma ação que muda estado, como transferir valor ou trocar e-mail",
            correct: true,
            explain: "Mutações têm efeito para a vítima. O servidor precisa confirmar não apenas a sessão, mas a intenção legítima.",
          },
          {
            id: "css",
            label: "Somente a leitura pública de uma página sem sessão",
            explain: "O caso clássico envolve uma operação autenticada com efeito. Comece pelas mutações sensíveis.",
          },
        ],
      },
    ],
  },
  {
    id: "csrf-defesas",
    order: 2,
    title: "Como o servidor reconhece a intenção",
    summary: "Token, SameSite, origem esperada e método correto formam defesa em profundidade.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "token",
        prompt: "Por que um token anti-CSRF validado no servidor diferencia o formulário legítimo?",
        choices: [
          {
            id: "segredo",
            label: "Outra origem pode enviar um formulário, mas normalmente não consegue ler o token do app",
            correct: true,
            explain: "A política de mesma origem impede essa leitura. O servidor compara o valor recebido com o esperado antes da mutação.",
          },
          {
            id: "senha",
            label: "Porque o token substitui autenticação e autorização",
            explain: "O token confirma a origem/intenção do fluxo, mas sessão e autorização continuam necessárias.",
          },
        ],
      },
      {
        kind: "choice",
        id: "samesite",
        prompt: "O que SameSite=Lax ou Strict faz pelo cookie de sessão?",
        choices: [
          {
            id: "cruzado",
            label: "Restringe seu envio em muitos contextos iniciados por outro site",
            correct: true,
            explain: "Isso reduz pedidos autenticados entre sites. É uma camada forte, mas sua cobertura depende do modo e do contexto do pedido.",
          },
          {
            id: "hash",
            label: "Garante sozinho que toda mutação POST foi desejada pelo usuário",
            explain: "SameSite reduz o envio cross-site do cookie, mas não substitui toda validação de intenção em qualquer arquitetura.",
          },
        ],
      },
      {
        kind: "choice",
        id: "get",
        prompt: "Por que uma rota GET não deve excluir uma conta?",
        choices: [
          {
            id: "link",
            label: "GET deve apenas obter dados e pode ser disparado por navegação, link ou recurso",
            correct: true,
            explain: "Use POST ou outro método de mutação com as validações necessárias. POST expressa intenção, mas não é proteção suficiente sozinho.",
          },
          {
            id: "gzip",
            label: "Porque trocar GET por POST elimina automaticamente CSRF",
            explain: "Um formulário externo também envia POST. Método correto é uma camada de semântica e redução de exposição, não defesa completa.",
          },
        ],
      },
    ],
  },
  {
    id: "csrf-sintomas",
    order: 3,
    title: "Leia o endpoint como investigador",
    summary: "Cada lacuna altera o risco; outras camadas podem impedir ou limitar a exploração.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "form",
        prompt: "Um POST de logout usa apenas o cookie de sessão. Qual conclusão é precisa?",
        choices: [
          {
            id: "camadas",
            label: "É preciso verificar se SameSite, origem ou token já impedem o pedido forjado",
            correct: true,
            explain: "A ausência de token é uma lacuna, não prova isolada de exploração. Avalie o conjunto e a cobertura de cada camada.",
          },
          {
            id: "https",
            label: "É necessariamente seguro porque usa POST",
            explain: "POST também pode ser enviado por formulário externo. O servidor ainda precisa reconhecer pedidos legítimos.",
          },
        ],
      },
      {
        kind: "choice",
        id: "origin",
        prompt: "Como Origin e Referer ajudam numa mutação?",
        choices: [
          {
            id: "recusar",
            label: "Permitem comparar a origem do fluxo com a origem esperada e recusar divergências",
            correct: true,
            explain: "Origin é preferível quando presente; Referer pode servir de fallback conforme uma política explícita. Ausência inesperada também precisa de decisão segura.",
          },
          {
            id: "xss",
            label: "Transformam qualquer corpo recebido em conteúdo confiável",
            explain: "Esses cabeçalhos ajudam a identificar de onde veio o pedido; não validam os dados nem substituem autorização.",
          },
        ],
      },
      {
        kind: "text",
        id: "frase",
        prompt: "Em uma frase: qual confiança o CSRF tenta explorar?",
        min: 18,
        stems: ["sess", "cookie", "forjad", "outro site", "cross", "logad"],
        explain: "Síntese esperada: um pedido forjado tenta usar a sessão que o navegador anexa automaticamente para parecer uma ação legítima.",
      },
    ],
  },
  {
    id: "csrf-lab",
    order: 4,
    title: "Simule a proteção da transferência",
    summary: "Checklist de decisão e configuração: componha camadas para um endpoint fictício.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "csrf-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "Consolide como cada camada reconhece ou restringe um pedido forjado.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual configuração oferece defesa em profundidade para a transferência fictícia?",
        choices: [
          {
            id: "todas",
            label: "Token validado, SameSite adequado, origem conferida e mutação fora de GET",
            correct: true,
            explain: "Esse é o conjunto solicitado na simulação. Em sistemas reais, avalie cada arquitetura: camadas se complementam, e uma defesa válida pode bloquear o ataque mesmo sem todas as demais.",
          },
          {
            id: "captcha",
            label: "Apenas trocar GET por POST",
            explain: "POST organiza a semântica da mutação, mas formulários de outro site também podem enviá-lo.",
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
            label: "Concluir a simulação de configuração e explicar as decisões no checkpoint",
            correct: true,
            explain: "O lab registra o conjunto do cenário; o checkpoint confirma que você entende o papel e os limites de cada camada.",
          },
          {
            id: "ler",
            label: "Apenas saber que existe o atributo SameSite",
            explain: "Reconhecer um nome não basta. É preciso relacionar cookie, origem, método e validação de intenção.",
          },
        ],
      },
    ],
  },
];
