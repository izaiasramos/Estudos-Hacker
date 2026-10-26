import type { Unit } from "@/content/sql-injection";

// Texto de cada unidade: src/content/headers/<id>.mdx
export const TRAIL = {
  slug: "headers",
  title: "Exposição de dados e headers",
  summary:
    "O que a resposta do servidor conta sem querer — campos sobrando, erro detalhado, versão do framework — e os headers que dizem ao navegador como se proteger.",
};

export const UNITS: Unit[] = [
  {
    id: "headers-proposito",
    order: 1,
    title: "A resposta fala demais",
    summary: "Exposição de dados é o que sai do servidor sem ninguém ter pedido.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "exposicao",
        prompt: "O que caracteriza exposição de dados sensíveis numa API?",
        choices: [
          {
            id: "sobra",
            label: "A resposta carrega campos ou detalhes que o cliente não precisa ver",
            correct: true,
            explain: "O problema nasce no servidor: ele devolve mais do que a tela usa.",
          },
          {
            id: "lento",
            label: "A API demora para responder",
            explain: "Desempenho é outro assunto. Uma resposta rápida pode vazar do mesmo jeito.",
          },
          {
            id: "senha",
            label: "O usuário escolheu uma senha fraca",
            explain: "Senha fraca é autenticação. Aqui o servidor entrega dado demais, mesmo com senha forte.",
          },
        ],
      },
      {
        kind: "choice",
        id: "esconder",
        prompt: "A tela não mostra o campo `password_hash`, mas o JSON da API traz ele. Está seguro?",
        choices: [
          {
            id: "nao",
            label: "Não. Qualquer pessoa vê o JSON na aba Network do navegador",
            correct: true,
            explain: "O que sai na resposta é público para quem fez o pedido. A tela não é a fronteira.",
          },
          {
            id: "sim",
            label: "Sim, se a interface não exibe, ninguém vê",
            explain: "A interface é do cliente. O corpo da resposta chega inteiro no navegador.",
          },
        ],
      },
      {
        kind: "choice",
        id: "erro",
        prompt: "Por que devolver a pilha de erro (stack trace) em produção é um problema?",
        choices: [
          {
            id: "mapa",
            label: "Mostra caminho de arquivo, versão de biblioteca e consulta — um mapa do sistema",
            correct: true,
            explain: "O detalhe vai para o log do servidor. Para o cliente, uma mensagem genérica e um id do erro.",
          },
          {
            id: "feio",
            label: "Só porque fica feio para o usuário",
            explain: "Também fica feio, mas o motivo de segurança é o que a pilha revela.",
          },
        ],
      },
    ],
  },
  {
    id: "headers-defesas",
    order: 2,
    title: "Headers que protegem",
    summary: "Cada header é uma instrução ao navegador. Sem ela, ele faz o padrão, que é o permissivo.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "csp",
        prompt: "O que a `Content-Security-Policy` com nonce faz?",
        choices: [
          {
            id: "script",
            label: "O navegador só executa script que traz o nonce desta resposta",
            correct: true,
            explain: "Um script injetado não conhece o nonce, que muda a cada resposta. Por isso a CSP segura XSS.",
          },
          {
            id: "cifra",
            label: "Criptografa a página",
            explain: "Quem cifra é o TLS (HTTPS). A CSP diz o que pode rodar e de onde pode carregar.",
          },
          {
            id: "sql",
            label: "Impede SQL Injection",
            explain: "SQL Injection acontece no servidor. CSP é uma regra do navegador.",
          },
        ],
      },
      {
        kind: "choice",
        id: "hsts",
        prompt: "Para que serve o `Strict-Transport-Security`?",
        choices: [
          {
            id: "https",
            label: "Faz o navegador usar só HTTPS neste domínio pelos próximos acessos",
            correct: true,
            explain: "Sem ele, o primeiro pedido em HTTP pode ser interceptado antes do redirect para HTTPS.",
          },
          {
            id: "cookie",
            label: "Marca o cookie como HttpOnly",
            explain: "HttpOnly é um atributo do cookie. HSTS é sobre o protocolo do domínio.",
          },
        ],
      },
      {
        kind: "choice",
        id: "frame",
        prompt: "`frame-ancestors 'self'` (ou `X-Frame-Options: SAMEORIGIN`) protege contra…",
        choices: [
          {
            id: "clickjacking",
            label: "Outro site carregar a sua página num iframe invisível e induzir cliques",
            correct: true,
            explain: "Isso é clickjacking. Com a regra, o navegador recusa mostrar a página dentro de site alheio.",
          },
          {
            id: "xss",
            label: "Script injetado no seu próprio site",
            explain: "Isso é XSS, que a CSP de script cobre. `frame-ancestors` trata de quem pode enquadrar você.",
          },
        ],
      },
      {
        kind: "choice",
        id: "nosniff",
        prompt: "O que `X-Content-Type-Options: nosniff` evita?",
        choices: [
          {
            id: "adivinhar",
            label: "O navegador adivinhar o tipo do arquivo e executar como script algo que era texto",
            correct: true,
            explain: "Com nosniff, o navegador respeita o Content-Type que o servidor declarou.",
          },
          {
            id: "cache",
            label: "Que a resposta fique em cache",
            explain: "Cache é `Cache-Control`. nosniff é sobre o tipo do conteúdo.",
          },
        ],
      },
    ],
  },
  {
    id: "headers-sintomas",
    order: 3,
    title: "Sintomas na resposta",
    summary: "Ler o pedido na aba Network e achar o que sobra e o que falta.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "campo",
        prompt: "Na resposta do lab, qual campo não deveria estar no JSON do perfil?",
        choices: [
          {
            id: "hash",
            label: "`password_hash`",
            correct: true,
            explain: "Hash de senha não sai do servidor, nem para o próprio dono.",
          },
          {
            id: "nome",
            label: "`name`",
            explain: "O nome é o que a tela do perfil mostra. Ele pode sair.",
          },
          {
            id: "id",
            label: "`id`",
            explain: "O id do próprio usuário costuma ser necessário para a tela. O problema é outro campo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "powered",
        prompt: "O que fazer com `X-Powered-By: Express 4.17.1`?",
        choices: [
          {
            id: "remover",
            label: "Remover: ele anuncia framework e versão sem ajudar ninguém que usa o site",
            correct: true,
            explain: "Esconder a versão não corrige falha, mas não há motivo para facilitar a busca por uma conhecida.",
          },
          {
            id: "manter",
            label: "Manter, é só informativo",
            explain: "Informativo para quem procura uma versão vulnerável. O navegador não usa esse header.",
          },
        ],
      },
      {
        kind: "choice",
        id: "unsafe",
        prompt: "A CSP do lab é `script-src 'self' 'unsafe-inline'`. O que isso significa?",
        choices: [
          {
            id: "fraca",
            label: "Qualquer script inline roda, inclusive um injetado — a CSP quase não segura XSS",
            correct: true,
            explain: "`'unsafe-inline'` desliga a parte que mais protege. Nonce ou hash é o caminho.",
          },
          {
            id: "forte",
            label: "Está forte, porque tem `'self'`",
            explain: "`'self'` limita arquivos externos, mas o `'unsafe-inline'` libera justamente o script injetado.",
          },
        ],
      },
      {
        kind: "text",
        id: "frase",
        prompt: "Em uma frase: por que a regra de campos fica no servidor e não na tela?",
        min: 18,
        stems: ["servidor", "resposta", "cliente", "navegador", "network", "json"],
        explain: "Tudo o que sai na resposta chega inteiro ao cliente. Só o servidor decide o que sai.",
      },
    ],
  },
  {
    id: "headers-lab",
    order: 4,
    title: "Fechar a resposta",
    summary: "Configure a resposta fictícia do perfil. O checker confere a configuração, não executa código seu.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "headers-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de headers espera o lab verde e este checkpoint.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto fecha a resposta do perfil?",
        choices: [
          {
            id: "camadas",
            label: "Lista de campos no servidor, erro genérico, CSP com nonce, HSTS, nosniff e `frame-ancestors`",
            correct: true,
            explain: "Duas partes: o que a resposta conta e o que o navegador pode fazer com ela.",
          },
          {
            id: "header",
            label: "Só a CSP, que resolve o resto",
            explain: "CSP não remove `password_hash` do JSON nem a pilha do erro.",
          },
        ],
      },
      {
        kind: "choice",
        id: "onde",
        prompt: "Onde configurar esses headers num app Next.js?",
        choices: [
          {
            id: "servidor",
            label: "No servidor: `next.config` para os fixos e o proxy para a CSP com nonce",
            correct: true,
            explain: "É como esta plataforma faz. O nonce muda a cada resposta, por isso vem do proxy.",
          },
          {
            id: "meta",
            label: "Numa `<meta>` escrita pelo JavaScript da página depois de carregar",
            explain: "Regra criada depois do carregamento chega tarde, e boa parte dos headers nem funciona em `<meta>`.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de headers pode sair?",
        choices: [
          {
            id: "lab",
            label: "Depois do lab e deste checkpoint",
            correct: true,
            explain: "Teoria mais defesa conferida.",
          },
          {
            id: "ler",
            label: "Depois de ler sobre CSP",
            explain: "Leitura não fecha a resposta.",
          },
        ],
      },
    ],
  },
];
