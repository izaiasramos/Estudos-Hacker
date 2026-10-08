import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "xss",
  title: "XSS",
  summary:
    "Quando o navegador trata dado do usuário como código na página — refletido, armazenado, e como fechar cada caminho.",
};

export const UNITS: Unit[] = [
  {
    id: "xss-proposito",
    order: 1,
    title: "Dado vira código",
    summary: "XSS quebra a fronteira entre conteúdo e comportamento no browser.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Cross-Site Scripting (XSS) acontece quando entrada não confiável entra na página e o navegador executa ou interpreta como HTML/JavaScript no contexto do seu site. O atacante passa a agir com os privilégios da vítima naquela origem: ler o DOM, disparar ações, às vezes roubar sessão se a chave estiver exposta ao script.",
      },
      {
        type: "callout",
        tone: "analogia",
        text: "A página é um quadro de avisos. XSS é colar um bilhete que o quadro obedece como ordem, não como texto.",
      },
      {
        type: "glossary",
        term: "Contexto de saída",
        text: "O mesmo dado precisa de regra diferente em HTML, atributo, URL ou JavaScript. Escapar no lugar errado não protege.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "onde",
        prompt: "Onde o XSS se manifesta?",
        choices: [
          {
            id: "browser",
            label: "No navegador da vítima, na origem do app",
            correct: true,
            explain: "O servidor entregou markup ou script; o browser executa no site da vítima.",
          },
          {
            id: "postgres",
            label: "Dentro do Postgres, como SQL injection",
            explain: "SQLi mexe no banco. XSS mexe no DOM e no script da página.",
          },
          {
            id: "smtp",
            label: "No servidor de e-mail, sempre",
            explain: "Phishing usa e-mail. XSS é problema de renderização web.",
          },
        ],
      },
      {
        kind: "choice",
        id: "efeito",
        prompt: "Por que XSS preocupa quem cuida de sessão?",
        choices: [
          {
            id: "script",
            label: "Script na página pode ler o que o JS alcança, inclusive chaves mal guardadas",
            correct: true,
            explain: "HttpOnly tira cookie do script. XSS ainda mexe na UI e em tokens expostos ao JS.",
          },
          {
            id: "hash",
            label: "Porque quebra bcrypt",
            explain: "Hash protege senha no servidor. XSS opera no cliente.",
          },
          {
            id: "dns",
            label: "Porque muda o DNS",
            explain: "XSS não altera DNS. Age dentro da página carregada.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fronteira",
        prompt: "A defesa central de XSS é…",
        choices: [
          {
            id: "separar",
            label: "Não misturar dado não confiável com markup ou script executável",
            correct: true,
            explain: "Codificar, usar APIs seguras, CSP e sanitizar quando HTML é obrigatório.",
          },
          {
            id: "senha",
            label: "Pedir senha de novo a cada clique",
            explain: "Reautenticação ajuda em casos pontuais, não substitui saída segura.",
          },
          {
            id: "css",
            label: "Esconder o botão com CSS",
            explain: "Ocultar UI não remove script já injetado.",
          },
        ],
      },
    ],
  },
  {
    id: "xss-tipos",
    order: 2,
    title: "Refletido e armazenado",
    summary: "Onde o dado entra define o nome — a invariante quebrada é a mesma.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Refletido: o servidor devolve o input na resposta da mesma requisição (busca, erro, query string). Armazenado: o input fica salvo e outras pessoas veem depois (comentário, perfil, ticket). DOM-based: o script da página escreve no DOM sem passar pelo servidor. Em todos, o browser interpreta o trecho como código.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Sintoma comum: campo de busca que ecoa o termo dentro da página sem codificar. Comentário de outro usuário que aparece formatado demais.",
      },
      {
        type: "code",
        caption: "Perigoso vs seguro (texto simples)",
        code: "painel.innerHTML = comentario;  // interpreta markup\npainel.textContent = comentario; // mostra como texto",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "refletido",
        prompt: "Busca que mostra “Você procurou: …” com o termo cru na mesma resposta é…",
        choices: [
          {
            id: "ref",
            label: "XSS refletido",
            correct: true,
            explain: "O eco imediato na resposta é o padrão refletido.",
          },
          {
            id: "stored",
            label: "XSS armazenado",
            explain: "Armazenado exige persistência que outros usuários carregam depois.",
          },
          {
            id: "csrf",
            label: "CSRF",
            explain: "CSRF força ação autenticada. XSS executa script no browser.",
          },
        ],
      },
      {
        kind: "choice",
        id: "stored",
        prompt: "Comentário malicioso que todo visitante vê no dia seguinte é…",
        choices: [
          {
            id: "arm",
            label: "XSS armazenado",
            correct: true,
            explain: "O payload sobrevive no backend e entra na página de outras sessões.",
          },
          {
            id: "ref",
            label: "Só refletido",
            explain: "Refletido não fica guardado para terceiros.",
          },
          {
            id: "idor",
            label: "IDOR",
            explain: "IDOR troca identificador de recurso. XSS injeta conteúdo executável.",
          },
        ],
      },
      {
        kind: "text",
        id: "invariante",
        prompt: "Em uma frase: qual invariante o XSS quebra?",
        min: 20,
        stems: ["confi", "markup", "script", "dado", "codif", "escape"],
        explain: "Dado não confiável não pode ser interpretado como código HTML ou JavaScript na página.",
      },
    ],
  },
  {
    id: "xss-sintomas",
    order: 3,
    title: "Sintomas no produto",
    summary: "Três cheiros antes de abrir o ticket de segurança.",
    kind: "exercise",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "No lab, o painel de comentários ainda usa innerHTML, não há CSP, a busca ecoa HTML e o editor aceita tags arbitrárias. Qualquer um desses abre XSS.",
      },
      {
        type: "callout",
        tone: "armadilha",
        text: "Confiar só no “React escapa por padrão” falha no momento em que alguém usa dangerouslySetInnerHTML, concatena string ou passa URL sem validar.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "inner",
        prompt: "innerHTML com texto de usuário sem tratamento tende a…",
        choices: [
          {
            id: "xss",
            label: "Interpretar markup e script que venham no texto",
            correct: true,
            explain: "innerHTML parseia HTML. Dado vira DOM executável.",
          },
          {
            id: "sql",
            label: "Gerar SQL injection no Postgres",
            explain: "Isso é outra camada. innerHTML afeta o browser.",
          },
          {
            id: "hash",
            label: "Quebrar hash de senha",
            explain: "Senha no servidor não é corrigida por trocar innerHTML.",
          },
        ],
      },
      {
        kind: "choice",
        id: "csp",
        prompt: "CSP bem configurada ajuda principalmente a…",
        choices: [
          {
            id: "limit",
            label: "Limitar de onde script pode rodar e bloquear inline solto",
            correct: true,
            explain: "CSP é rede de proteção. Não substitui codificar saída.",
          },
          {
            id: "bcrypt",
            label: "Substituir bcrypt",
            explain: "CSP não hasheia senha.",
          },
          {
            id: "email",
            label: "Enviar e-mail de verificação",
            explain: "SMTP é outro sistema.",
          },
        ],
      },
      {
        kind: "choice",
        id: "sanitize",
        prompt: "Quando o produto exige HTML rico (editor WYSIWYG), o caminho defensivo é…",
        choices: [
          {
            id: "allow",
            label: "Sanitizador com lista permitida no servidor",
            correct: true,
            explain: "Allowlist remove tags e atributos perigosos. Proibir HTML também é opção.",
          },
          {
            id: "black",
            label: "Lista negra de palavras “script” no comentário",
            explain: "Blacklist contorna fácil. Allowlist ou texto puro é mais confiável.",
          },
          {
            id: "base64",
            label: "Base64 no comentário e confiar no decode no cliente",
            explain: "Base64 não é escape. Decode no cliente ainda vira HTML.",
          },
        ],
      },
    ],
  },
  {
    id: "xss-lab",
    order: 4,
    title: "Fechar o painel",
    summary: "Ligue as camadas. O checker só aceita quando o comentário deixa de ser código.",
    kind: "lab",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "O mini painel do lab começa ecoando HTML, sem CSP, com innerHTML e editor cru. Cada caixa liga uma defesa. O servidor confere — não executa código seu.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Conjunto que passa: codificar saída, CSP, DOM seguro para texto e sanitizador quando HTML é permitido.",
      },
    ],
    questions: [],
  },
  {
    id: "xss-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de XSS espera este checkpoint e o lab verde.",
    kind: "checkpoint",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Três decisões. O selo inclui o lab conferido.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto cobre XSS no caso comum?",
        choices: [
          {
            id: "todas",
            label: "Escape de saída, CSP, DOM seguro e sanitizar HTML rico",
            correct: true,
            explain: "Camadas se somam. Uma só deixa brecha.",
          },
          {
            id: "csp-so",
            label: "Só CSP, sem codificar",
            explain: "CSP complementa. Dado cru ainda quebra em contextos CSP não cobre.",
          },
          {
            id: "hidden",
            label: "display:none no comentário",
            explain: "CSS não remove script.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de XSS pode sair?",
        choices: [
          {
            id: "lab",
            label: "Depois do lab do painel e deste checkpoint",
            correct: true,
            explain: "Teoria + defesa conferida.",
          },
          {
            id: "leitura",
            label: "Depois de ler refletido vs armazenado",
            explain: "Ler não fecha o vetor.",
          },
        ],
      },
    ],
  },
];
