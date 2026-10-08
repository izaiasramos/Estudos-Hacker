import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "csrf",
  title: "CSRF",
  summary:
    "Quando outro site dispara uma ação autenticada no seu nome — e como token, SameSite e POST seguro fecham o buraco.",
};

export const UNITS: Unit[] = [
  {
    id: "csrf-proposito",
    order: 1,
    title: "Pedido forjado",
    summary: "CSRF abusa do browser que já está logado.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Cross-Site Request Forgery (CSRF) envia, a partir de outra página, um pedido que o navegador completa com os cookies da vítima. O servidor vê sessão válida e executa a ação — transferência, mudança de e-mail, exclusão — sem que a pessoa tenha clicado de propósito no seu app.",
      },
      {
        type: "callout",
        tone: "analogia",
        text: "A vítima deixou a carteira aberta na mesa. O atacante não rouba a senha; só estica o braço e assina um papel enquanto ela olha para outro lugar.",
      },
      {
        type: "glossary",
        term: "Same-origin vs cross-origin",
        text: "Origem = esquema + host + porta. Pedido de outro site é cross-origin, mas o cookie de sessão ainda pode ir se o navegador permitir.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "cookie",
        prompt: "Por que o login prévio da vítima importa?",
        choices: [
          {
            id: "auto",
            label: "O navegador anexa o cookie de sessão no pedido forjado",
            correct: true,
            explain: "Sem sessão ativa, o POST cai como anônimo.",
          },
          {
            id: "senha",
            label: "Porque a senha vai no corpo do form malicioso",
            explain: "CSRF não precisa da senha. Usa a sessão já aberta.",
          },
          {
            id: "sql",
            label: "Porque injeta SQL no link",
            explain: "Isso é outra classe de falha.",
          },
        ],
      },
      {
        kind: "choice",
        id: "xss",
        prompt: "CSRF é a mesma coisa que XSS?",
        choices: [
          {
            id: "nao",
            label: "Não — XSS executa script no seu site; CSRF força pedido HTTP autenticado",
            correct: true,
            explain: "Podem se combinar, mas a mecânica é diferente.",
          },
          {
            id: "sim",
            label: "Sim, nomes diferentes para o mesmo bug",
            explain: "XSS mexe no DOM. CSRF mexe no pedido cross-site.",
          },
        ],
      },
      {
        kind: "choice",
        id: "alvo",
        prompt: "Qual ação é alvo clássico de CSRF?",
        choices: [
          {
            id: "mutacao",
            label: "Mudar dado ou estado (transferir, trocar e-mail, excluir)",
            correct: true,
            explain: "Leitura idempotente em GET é outro problema; CSRF foca mutação.",
          },
          {
            id: "css",
            label: "Trocar a cor do botão",
            explain: "Estilo não é efeito colateral de CSRF típico.",
          },
        ],
      },
    ],
  },
  {
    id: "csrf-defesas",
    order: 2,
    title: "Camadas de defesa",
    summary: "Token, SameSite, Origin e verbos corretos se somam.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Token anti-CSRF: valor secreto no form que o site malicioso não conhece. SameSite Lax/Strict: cookie não sai em muitos pedidos cross-site. Checagem de Origin/Referer: servidor recusa POST vindo de origem estranha. Por fim, nunca mutar estado em GET.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Nesta plataforma, rotas POST checam same-origin via Origin/Referer. É uma camada — não substitui token em apps com requisitos mais rígidos.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "token",
        prompt: "O token anti-CSRF funciona porque…",
        choices: [
          {
            id: "segredo",
            label: "O site atacante não consegue ler o token da página legítima (same-origin policy)",
            correct: true,
            explain: "Ele pode montar form, mas precisa do valor correto emitido pelo app.",
          },
          {
            id: "senha",
            label: "É a senha do usuário codificada em Base64",
            explain: "Token é efêmero por sessão/form, não é senha.",
          },
        ],
      },
      {
        kind: "choice",
        id: "samesite",
        prompt: "SameSite=Lax em cookie de sessão ajuda CSRF quando…",
        choices: [
          {
            id: "cruzado",
            label: "O pedido nasce em form POST de outro site",
            correct: true,
            explain: "Lax/Strict seguram o envio do cookie em muitos cenários cross-site.",
          },
          {
            id: "hash",
            label: "O bcrypt está fraco",
            explain: "Hash de senha é camada de autenticação, não CSRF.",
          },
        ],
      },
      {
        kind: "choice",
        id: "get",
        prompt: "Por que GET que exclui conta é perigoso?",
        choices: [
          {
            id: "link",
            label: "Um link ou imagem em e-mail pode disparar o GET logado",
            correct: true,
            explain: "GET deve ser seguro e idempotente — mutação pertence a POST com proteção.",
          },
          {
            id: "gzip",
            label: "Porque GET não comprime JSON",
            explain: "Compressão não define segurança CSRF.",
          },
        ],
      },
    ],
  },
  {
    id: "csrf-sintomas",
    order: 3,
    title: "Sintomas no código",
    summary: "Três cheiros em code review.",
    kind: "exercise",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "No lab, transferência aceita GET com query string, form sem token, cookie SameSite=None e servidor ignora Origin. Qualquer combinação abre CSRF.",
      },
      {
        type: "code",
        caption: "Mutar estado via GET (anti-padrão)",
        code: "GET /transferir?valor=100&para=atacante",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "form",
        prompt: "Form POST de logout sem token, só cookie de sessão, depende de…",
        choices: [
          {
            id: "camadas",
            label: "SameSite, Origin ou token — senão outro site replica o POST",
            correct: true,
            explain: "Cookie sozinho autentica quem quer que dispare o pedido.",
          },
          {
            id: "https",
            label: "Apenas HTTPS no favicon",
            explain: "HTTPS protege trânsito, não origem do pedido.",
          },
        ],
      },
      {
        kind: "choice",
        id: "origin",
        prompt: "Conferir Origin em POST de API ajuda a…",
        choices: [
          {
            id: "recusar",
            label: "Recusar pedidos iniciados em origem não confiável",
            correct: true,
            explain: "Complementa token. Não é perfeito se headers forem removidos por proxy mal configurado.",
          },
          {
            id: "xss",
            label: "Substituir escape HTML",
            explain: "XSS é sanitização de saída. Origin é CSRF.",
          },
        ],
      },
      {
        kind: "text",
        id: "frase",
        prompt: "Em uma frase: o que CSRF explora?",
        min: 18,
        stems: ["sess", "cookie", "forjad", "outro site", "cross", "logad"],
        explain: "Sessão ativa + pedido cross-origin que o navegador completa automaticamente.",
      },
    ],
  },
  {
    id: "csrf-lab",
    order: 4,
    title: "Fechar a transferência",
    summary: "Ligue as defesas. O checker valida a configuração do endpoint fictício.",
    kind: "lab",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "O endpoint de transferência do lab começa permissivo. Cada caixa endurece uma camada. O servidor confere — não executa código seu.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Conjunto que passa: token, SameSite Lax ou Strict, checagem de Origin e mutação só via POST.",
      },
    ],
    questions: [],
  },
  {
    id: "csrf-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de CSRF espera lab verde e este checkpoint.",
    kind: "checkpoint",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Decisões de produto antes do selo.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Defesa sólida contra CSRF clássico inclui…",
        choices: [
          {
            id: "todas",
            label: "Token, SameSite adequado, Origin/Referer e POST para mutação",
            correct: true,
            explain: "Defesa em camadas — uma falha não derruba todas.",
          },
          {
            id: "captcha",
            label: "Só CAPTCHA em todo clique",
            explain: "CAPTCHA é incômodo e não substitui token estrutural.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de CSRF pode sair?",
        choices: [
          {
            id: "lab",
            label: "Depois do lab e deste checkpoint",
            correct: true,
            explain: "Teoria mais defesa conferida.",
          },
          {
            id: "ler",
            label: "Depois de ler sobre SameSite",
            explain: "Leitura não fecha endpoint.",
          },
        ],
      },
    ],
  },
];
