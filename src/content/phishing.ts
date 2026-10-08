import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "phishing",
  title: "Phishing interno",
  summary:
    "O alvo é a pessoa: ler sinais em mensagens fictícias e fechar defesas de produto — sem clone de banco nem kit de ataque.",
};

export const UNITS: Unit[] = [
  {
    id: "phishing-proposito",
    order: 1,
    title: "Alvo humano",
    summary: "Engenharia social antes de exploit técnico.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "alvo",
        prompt: "O que phishing tenta primeiro?",
        choices: [
          {
            id: "pessoa",
            label: "Enganar a pessoa, não o compilador",
            correct: true,
            explain: "A decisão errada do usuário entrega acesso.",
          },
          {
            id: "cpu",
            label: "Sobrecarregar CPU do servidor",
            explain: "Isso é negação de serviço, não phishing.",
          },
        ],
      },
      {
        kind: "choice",
        id: "dev",
        prompt: "Como um dev reduz risco de phishing no produto?",
        choices: [
          {
            id: "politica",
            label: "Políticas claras, avisos de login, 2FA e treino interno",
            correct: true,
            explain: "Tecnologia + processo + educação do time.",
          },
          {
            id: "sql",
            label: "Só parametrizar SQL",
            explain: "SQL seguro não impede e-mail falso.",
          },
        ],
      },
      {
        kind: "choice",
        id: "lab",
        prompt: "O lab desta trilha permite…",
        choices: [
          {
            id: "ficticio",
            label: "Classificar e-mails fictícios e marcar defesas de produto",
            correct: true,
            explain: "Aprendizado defensivo, sem arma real.",
          },
          {
            id: "clone",
            label: "Publicar clone do login do Google para testar colegas",
            explain: "Fora do escopo ético deste produto.",
          },
        ],
      },
    ],
  },
  {
    id: "phishing-sinais",
    order: 2,
    title: "Sinais na mensagem",
    summary: "Urgência, domínio parecido, pedido de senha, anexo estranho.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "senha",
        prompt: "E-mail pedindo “confirme sua senha aqui” é…",
        choices: [
          {
            id: "phish",
            label: "Quase sempre phishing ou política quebrada",
            correct: true,
            explain: "Produto legítimo não coleta senha por e-mail.",
          },
          {
            id: "ok",
            label: "Normal se o logo estiver bonito",
            explain: "Logo fácil de copiar. Canal importa.",
          },
        ],
      },
      {
        kind: "choice",
        id: "urgente",
        prompt: "Urgência extrema + link desconhecido deve…",
        choices: [
          {
            id: "pausa",
            label: "Fazer pausar e checar canal oficial",
            correct: true,
            explain: "Pressa é ferramenta do atacante.",
          },
          {
            id: "clique",
            label: "Significar que precisa clicar rápido",
            explain: "Urgência artificial é sinal clássico.",
          },
        ],
      },
      {
        kind: "choice",
        id: "anexo",
        prompt: "Anexo .exe inesperado “do RH” é…",
        choices: [
          {
            id: "sus",
            label: "Suspeito no mínimo — confirmar por canal separado",
            correct: true,
            explain: "Tipo de arquivo e contexto não batem.",
          },
          {
            id: "legit",
            label: "Legítimo se o nome da empresa estiver no assunto",
            explain: "Assunto forjável. Tipo de arquivo importa.",
          },
        ],
      },
    ],
  },
  {
    id: "phishing-classificar",
    order: 3,
    title: "Classificar sem clicar",
    summary: "Exercício de leitura — legítimo, suspeito ou phishing.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "caso1",
        prompt: "Aviso de login no app, link só para shieldpath.app, sem pedir senha no e-mail?",
        choices: [
          {
            id: "legitimo",
            label: "Legítimo (se você esperava o aviso)",
            correct: true,
            explain: "Canal e conteúdo coerentes com política.",
          },
          {
            id: "phishing",
            label: "Phishing sempre",
            explain: "Notificação real de login pode ser legítima.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso2",
        prompt: "“shieldpath-secure-login.com” pede senha em 10 minutos?",
        choices: [
          {
            id: "phishing",
            label: "Phishing",
            correct: true,
            explain: "Domínio falso + segredo no e-mail.",
          },
          {
            id: "suspeito",
            label: "Só suspeito",
            explain: "Combinação clássica de phishing.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso3",
        prompt: "RH manda contracheque.exe sem você ter pedido?",
        choices: [
          {
            id: "suspeito",
            label: "Suspeito",
            correct: true,
            explain: "Confirmar por canal conhecido antes de abrir.",
          },
          {
            id: "legitimo",
            label: "Legítimo porque veio do RH",
            explain: "Remetente pode ser falsificado. Arquivo executável é alerta.",
          },
        ],
      },
    ],
  },
  {
    id: "phishing-lab",
    order: 4,
    title: "Caixa do lab",
    summary: "Classifique os três e-mails fictícios e marque as defesas de produto.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "phishing-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "Selo de phishing espera lab e este checkpoint.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Programa anti-phishing interno saudável inclui…",
        choices: [
          {
            id: "todas",
            label: "Treino simulado, 2FA, aviso de login e nunca senha por e-mail",
            correct: true,
            explain: "Camadas humanas e técnicas.",
          },
          {
            id: "punir",
            label: "Só punir quem clicou, sem treino",
            explain: "Cultura de medo esconde incidente.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de phishing interno sai?",
        choices: [
          {
            id: "lab",
            label: "Depois do lab da caixa e deste checkpoint",
            correct: true,
            explain: "Classificação correta + políticas marcadas.",
          },
          {
            id: "ler",
            label: "Depois de ler sobre urgência",
            explain: "Leitura não substitui lab.",
          },
        ],
      },
    ],
  },
];
