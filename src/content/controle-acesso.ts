import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "controle-acesso",
  title: "Controle de acesso (IDOR)",
  summary:
    "Quando o servidor confere quem você é, mas esquece de conferir o que você pode ver — e como dono, papel e negação por padrão fecham o buraco.",
};

export const UNITS: Unit[] = [
  {
    id: "idor-proposito",
    order: 1,
    title: "Quem é vs. o que pode",
    summary: "Autenticação identifica. Autorização decide o alcance.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Controle de acesso quebrado é o primeiro item do OWASP Top 10. O login funciona, a sessão é válida, e mesmo assim a pessoa chega num dado que não é dela. O servidor respondeu à pergunta “quem está pedindo?” e pulou a segunda: “esse recurso pertence a quem está pedindo?”.",
      },
      {
        type: "p",
        text: "IDOR (Insecure Direct Object Reference) é o caso mais comum: a rota recebe um identificador — o número do pedido, da fatura, do perfil — e devolve o registro sem amarrar esse identificador ao dono da sessão.",
      },
      {
        type: "callout",
        tone: "analogia",
        text: "O porteiro confere o crachá na entrada do prédio e deixa você subir. Mas todas as salas abrem com qualquer crachá. Entrar no prédio não deveria abrir a sala do vizinho.",
      },
      {
        type: "glossary",
        term: "Invariante",
        text: "Todo acesso a um recurso confere, no servidor, se a identidade da sessão tem direito àquele recurso específico. Saber o id não é permissão.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "diferenca",
        prompt: "Qual pergunta a autorização responde?",
        choices: [
          {
            id: "alcance",
            label: "Esta identidade pode ler ou mudar este recurso específico?",
            correct: true,
            explain: "Autorização decide o alcance de quem já foi identificado.",
          },
          {
            id: "quem",
            label: "Quem é a pessoa que está pedindo?",
            explain: "Isso é autenticação. Ela vem antes, mas não decide o que a pessoa alcança.",
          },
          {
            id: "senha",
            label: "A senha está guardada com hash?",
            explain: "Hash protege a senha guardada. Não diz nada sobre quais registros a sessão pode ver.",
          },
        ],
      },
      {
        kind: "choice",
        id: "idor",
        prompt: "Num IDOR, o que quebrou?",
        choices: [
          {
            id: "dono",
            label: "A rota confiou no identificador recebido sem conferir o dono",
            correct: true,
            explain: "O id chegou do cliente e virou chave de acesso. Faltou amarrar ao usuário da sessão.",
          },
          {
            id: "login",
            label: "O login aceitou senha errada",
            explain: "No IDOR o login funciona. A falha está depois dele.",
          },
          {
            id: "https",
            label: "O site estava sem HTTPS",
            explain: "HTTPS protege o trânsito. A resposta errada sai do servidor mesmo com HTTPS.",
          },
        ],
      },
      {
        kind: "choice",
        id: "sessao",
        prompt: "Sessão válida basta para entregar um registro?",
        choices: [
          {
            id: "nao",
            label: "Não. Sessão diz quem é; o registro precisa pertencer a ela ou ao papel dela",
            correct: true,
            explain: "Duas checagens diferentes. Pular a segunda é o buraco desta trilha.",
          },
          {
            id: "sim",
            label: "Sim, se a pessoa está logada pode ver o que pedir",
            explain: "Logado não é dono. Esse atalho é exatamente o IDOR.",
          },
        ],
      },
    ],
  },
  {
    id: "idor-onde",
    order: 2,
    title: "Onde o controle some",
    summary: "Esconder não é proteger. UUID não é permissão.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "O controle de acesso costuma sumir em quatro lugares. Checagem só na interface: o botão some para quem não é admin, mas a rota responde para qualquer sessão. Rota “escondida”: ninguém linkou o endpoint, então ninguém protegeu. Consulta pelo id puro: o banco busca o registro sem filtrar pelo dono. Campos que o cliente não devia mandar: o corpo do pedido traz `role` ou `userId` e o servidor grava o que recebeu.",
      },
      {
        type: "callout",
        tone: "armadilha",
        text: "Trocar o id sequencial por UUID dificulta adivinhar, mas não decide nada. Um UUID vaza em link, log ou e-mail. A checagem do dono continua obrigatória.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Negar por padrão: rota nova começa fechada e alguém libera, de propósito, quem pode. O contrário — começar aberta e lembrar de fechar — é como o buraco nasce.",
      },
      {
        type: "glossary",
        term: "Mass assignment",
        text: "O servidor copia todos os campos do corpo para o registro. Se o modelo tem `role`, quem manda `role` no corpo muda o próprio papel.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "botao",
        prompt: "Esconder o botão de admin para quem não é admin…",
        choices: [
          {
            id: "ux",
            label: "É boa UX, mas a rota precisa conferir o papel no servidor",
            correct: true,
            explain: "A interface é do cliente. O pedido pode chegar à rota sem passar pelo botão.",
          },
          {
            id: "basta",
            label: "Já protege a rota",
            explain: "Esconder muda o que se vê, não o que o servidor aceita.",
          },
        ],
      },
      {
        kind: "choice",
        id: "uuid",
        prompt: "O time trocou ids sequenciais por UUID. O IDOR fechou?",
        choices: [
          {
            id: "nao",
            label: "Não. Fica mais difícil adivinhar, mas a rota ainda precisa conferir o dono",
            correct: true,
            explain: "UUID é obscuridade. Ele aparece em link compartilhado, log e histórico.",
          },
          {
            id: "sim",
            label: "Sim, UUID ninguém adivinha",
            explain: "Ninguém precisa adivinhar um id que vazou. Sem checagem de dono, o vazamento vira acesso.",
          },
        ],
      },
      {
        kind: "choice",
        id: "mass",
        prompt: "O cadastro grava todos os campos do corpo. Qual é o risco?",
        choices: [
          {
            id: "role",
            label: "Quem mandar `role` ou `userId` no corpo muda papel ou dono",
            correct: true,
            explain: "O servidor deve escolher quais campos aceita, com lista permitida.",
          },
          {
            id: "lento",
            label: "O cadastro fica mais lento",
            explain: "Desempenho não é o problema. O problema é aceitar campo que o cliente não devia controlar.",
          },
        ],
      },
    ],
  },
  {
    id: "idor-sintomas",
    order: 3,
    title: "Sintomas no código",
    summary: "Ler a consulta e achar onde falta o dono.",
    kind: "exercise",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Em code review, o sintoma aparece como uma consulta que recebe só o id vindo da URL. Compare as duas versões da rota de pedidos da Pizzaria do Lab.",
      },
      {
        type: "code",
        caption: "Rota que confia no id (vulnerável)",
        code: "const pedido = await db.one(\n  \"SELECT * FROM pedidos WHERE id = ?\",\n  [params.id],\n);\nreturn pedido;",
      },
      {
        type: "code",
        caption: "Rota que amarra ao dono da sessão",
        code: "const pedido = await db.one(\n  \"SELECT * FROM pedidos WHERE id = ? AND user_id = ?\",\n  [params.id, sessao.userId],\n);\nif (!pedido) return notFound();\nreturn pedido;",
      },
      {
        type: "callout",
        tone: "dev",
        text: "O `user_id` vem da sessão, que o servidor emitiu. Nunca do corpo, da query ou de um campo escondido no formulário.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "linha",
        prompt: "Na versão vulnerável, qual é a linha perigosa?",
        choices: [
          {
            id: "where",
            label: "`WHERE id = ?` sem nenhuma condição de dono",
            correct: true,
            explain: "O parâmetro protege contra SQL Injection, mas não diz de quem é o pedido.",
          },
          {
            id: "return",
            label: "`return pedido;`",
            explain: "Devolver o resultado é normal. O problema é qual resultado a consulta aceitou buscar.",
          },
          {
            id: "await",
            label: "O `await`",
            explain: "Assíncrono ou não, a consulta continua sem filtro de dono.",
          },
        ],
      },
      {
        kind: "choice",
        id: "origem",
        prompt: "De onde deve vir o `user_id` usado no filtro?",
        choices: [
          {
            id: "sessao",
            label: "Da sessão que o servidor emitiu",
            correct: true,
            explain: "É o único valor que o cliente não escolhe.",
          },
          {
            id: "corpo",
            label: "De um campo escondido no formulário",
            explain: "Campo escondido é do cliente. Qualquer um edita antes de enviar.",
          },
          {
            id: "query",
            label: "Da query string, `?user=`",
            explain: "Mesmo problema: o cliente escolhe o valor.",
          },
        ],
      },
      {
        kind: "choice",
        id: "resposta",
        prompt: "Pedido de outra pessoa chegou na rota corrigida. Qual resposta?",
        choices: [
          {
            id: "negar",
            label: "404 ou 403, sem o conteúdo do pedido",
            correct: true,
            explain: "404 também evita confirmar que o registro existe. 403 é aceitável quando o time prefere clareza.",
          },
          {
            id: "200",
            label: "200 com os dados, já que a pessoa está logada",
            explain: "Logado não é dono. Esse é o vazamento.",
          },
        ],
      },
      {
        kind: "text",
        id: "frase",
        prompt: "Em uma frase: qual invariante o IDOR quebra?",
        min: 18,
        stems: ["dono", "pertence", "autoriza", "permiss", "sessão", "sessao", "usuário", "usuario"],
        explain: "O servidor precisa conferir se o recurso pertence à identidade da sessão (ou ao papel dela), não só se a sessão existe.",
      },
    ],
  },
  {
    id: "idor-lab",
    order: 4,
    title: "Fechar os pedidos",
    summary: "Configure a rota fictícia de pedidos. O checker confere a regra, não executa código seu.",
    kind: "lab",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "A rota `/pedidos/:id` da Pizzaria do Lab começa confiando no id. A Alice, logada, recebe também o pedido do Bruno. Cada opção abaixo endurece uma parte da regra de acesso. O painel mostra o que a Alice receberia com a configuração atual.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Conjunto que passa: filtro pelo dono da sessão, papel conferido no servidor, negar por padrão, lista permitida de campos e resposta 404 ou 403 para recurso de outra pessoa.",
      },
    ],
    questions: [],
  },
  {
    id: "idor-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de controle de acesso espera o lab verde e este checkpoint.",
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
        prompt: "Qual conjunto fecha IDOR de verdade?",
        choices: [
          {
            id: "camadas",
            label: "Filtro pelo dono no servidor, papel conferido na rota e negação por padrão",
            correct: true,
            explain: "A regra mora no servidor e vale para toda rota, inclusive a que ninguém linkou.",
          },
          {
            id: "uuid",
            label: "UUID no lugar do id e esconder o botão",
            explain: "As duas coisas melhoram a superfície, mas nenhuma decide quem pode ver o quê.",
          },
        ],
      },
      {
        kind: "choice",
        id: "nova",
        prompt: "O time cria uma rota nova de relatório. Como ela nasce?",
        choices: [
          {
            id: "fechada",
            label: "Fechada, liberando de propósito os papéis que podem ler",
            correct: true,
            explain: "Negar por padrão faz o esquecimento virar erro visível, não vazamento.",
          },
          {
            id: "aberta",
            label: "Aberta, e alguém fecha depois se precisar",
            explain: "“Depois” costuma ser depois do vazamento.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de controle de acesso pode sair?",
        choices: [
          {
            id: "lab",
            label: "Depois do lab e deste checkpoint",
            correct: true,
            explain: "Teoria mais defesa conferida.",
          },
          {
            id: "ler",
            label: "Depois de ler sobre IDOR",
            explain: "Leitura não fecha a rota.",
          },
        ],
      },
    ],
  },
];
