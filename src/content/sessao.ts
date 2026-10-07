import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "sessao",
  title: "Sessão",
  summary: "A chave temporária que o navegador guarda, e as marcas que impedem que ela sirva para outra pessoa.",
};

export const UNITS: Unit[] = [
  {
    id: "sessao-chave",
    order: 1,
    title: "A chave temporária",
    summary: "O servidor lembra quem entrou. O navegador só carrega a chave dessa lembrança.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Depois do login, o servidor cria uma sessão: um registro do lado dele, com o usuário e a hora. Para o navegador, sobra um identificador, quase sempre num cookie. Nas próximas requisições o navegador devolve essa chave, e o servidor trata quem a apresenta como aquele usuário.",
      },
      {
        type: "callout",
        tone: "analogia",
        text: "A chave do quarto de hotel não é a pessoa. Quem chega com a chave certa entra. Por isso a chave tem prazo, não fica escrita no corredor e é trocada quando o hóspede faz um novo check-in.",
      },
      {
        type: "glossary",
        term: "Cookie de sessão",
        text: "Pequeno valor que o navegador guarda e reenvia ao mesmo site. No produto, ele aponta para a sessão no servidor. Não é a senha.",
      },
      {
        type: "callout",
        tone: "armadilha",
        text: "Guardar essa chave onde o JavaScript da página lê com facilidade, como o localStorage, aumenta o estrago se um script indesejado rodar na mesma página. O cookie pode ser marcado para o script não ler.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "quem",
        prompt: "Quem confirma a identidade depois do login?",
        choices: [
          {
            id: "servidor",
            label: "O servidor, ao reconhecer a chave da sessão",
            correct: true,
            explain: "A chave só funciona porque o servidor ainda tem o registro correspondente.",
          },
          {
            id: "navegador",
            label: "O navegador, que decide sozinho quem é o usuário",
            explain: "O navegador só devolve a chave. Quem confia nela é o servidor.",
          },
          {
            id: "senha",
            label: "A senha, reenviada em toda página",
            explain: "A senha autentica o login. A sessão evita pedir a senha de novo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "chave",
        prompt: "O que o cookie de sessão representa?",
        choices: [
          {
            id: "temp",
            label: "Uma chave temporária da sessão que o servidor criou",
            correct: true,
            explain: "Ela aponta para um registro. Não é um documento de identidade permanente.",
          },
          {
            id: "senha",
            label: "A senha, para o servidor não precisar de banco",
            explain: "A senha não deve voltar ao navegador dentro do cookie.",
          },
          {
            id: "html",
            label: "O HTML da área logada",
            explain: "O cookie é um identificador, não a página.",
          },
        ],
      },
      {
        kind: "text",
        id: "por-que",
        prompt: "Em uma frase: por que vazar essa chave é grave?",
        min: 24,
        stems: ["servidor", "usuário", "usuario", "como se", "identidade", "chave"],
        explain: "Quem apresenta a chave é tratado como o dono da sessão, enquanto ela continuar válida.",
      },
    ],
  },
  {
    id: "sessao-flags",
    order: 2,
    title: "As marcas da chave",
    summary: "HttpOnly, Secure e SameSite dizem ao navegador quando a chave pode sair e quem pode lê-la.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "O cookie pode viajar demais. Sem marcas, um script da página consegue lê-lo, ele pode sair numa conexão sem HTTPS, e o navegador pode anexá-lo em um pedido que outro site provocou.",
      },
      {
        type: "glossary",
        term: "HttpOnly",
        text: "O JavaScript da página não lê o cookie. O navegador continua enviando a chave nas requisições do site.",
      },
      {
        type: "glossary",
        term: "Secure",
        text: "O navegador só envia o cookie em HTTPS. Uma rede que só vê HTTP não recebe a chave.",
      },
      {
        type: "glossary",
        term: "SameSite",
        text: "Limita o envio do cookie quando o pedido nasce em outro site. Lax ou Strict cobrem o caso comum. None deixa o cookie sair no pedido cruzado.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "No login, gere uma chave nova e esqueça a anterior. No logout, apague o registro no servidor. Um prazo curto encerra a sessão esquecida. As marcas não substituem isso.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "httponly",
        prompt: "O que HttpOnly muda?",
        choices: [
          {
            id: "script",
            label: "O script da página deixa de conseguir ler a chave",
            correct: true,
            explain: "A chave continua indo nas requisições. Só some do alcance do JavaScript.",
          },
          {
            id: "https",
            label: "Obriga o site a usar HTTPS",
            explain: "HTTPS é a marca Secure. HttpOnly é sobre leitura por script.",
          },
          {
            id: "senha",
            label: "Criptografa a senha no banco",
            explain: "A senha e o cookie resolvem problemas diferentes.",
          },
        ],
      },
      {
        kind: "choice",
        id: "samesite",
        prompt: "SameSite=None, sem outra proteção, deixa a chave…",
        choices: [
          {
            id: "cruzado",
            label: "sair em pedidos provocados por outro site",
            correct: true,
            explain: "None é a opção aberta. Lax ou Strict seguram o envio cruzado.",
          },
          {
            id: "some",
            label: "sumir do navegador",
            explain: "None não apaga o cookie. Ele amplia quando o cookie viaja.",
          },
          {
            id: "banco",
            label: "impedir consulta ao banco",
            explain: "SameSite não mexe na consulta. Muda o envio do cookie.",
          },
        ],
      },
      {
        kind: "choice",
        id: "rotacao",
        prompt: "Por que trocar a chave no login?",
        choices: [
          {
            id: "antiga",
            label: "A chave de antes do login deixa de valer",
            correct: true,
            explain: "Se o identificador não muda, quem já o tinha continua apresentando a mesma chave.",
          },
          {
            id: "visual",
            label: "Para o cookie ficar mais longo na barra",
            explain: "O tamanho não é a defesa. A troca invalida o identificador anterior.",
          },
          {
            id: "email",
            label: "Para enviar a senha por e-mail",
            explain: "Senha não viaja por e-mail. A rotação é no servidor, no momento do login.",
          },
        ],
      },
    ],
  },
  {
    id: "sessao-sintomas",
    order: 3,
    title: "O que o dev vê",
    summary: "Três sintomas de uma chave solta, antes de qualquer correção.",
    kind: "exercise",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "No laboratório, a área logada da Pizzaria mostra o cookie da sessão sem marcas. Três sinais bastam para abrir o chamado: o script da página lê a chave, ela aparece numa visita sem HTTPS, e o identificador de antes do login continua igual depois.",
      },
      {
        type: "callout",
        tone: "conceito",
        text: "O nome disso, em alto nível, é sessão vazada ou fixada. O efeito é o mesmo: o servidor aceita a chave e atende como se fosse o usuário. A correção são as marcas, a troca no login e o apagar no logout.",
      },
      {
        type: "code",
        caption: "O que o inspetor mostra, ainda sem defesa",
        code: "sessao=chave-da-alice",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "sintoma",
        prompt: "O script da página consegue ler sessao=chave-da-alice. Qual marca está faltando?",
        choices: [
          {
            id: "httponly",
            label: "HttpOnly",
            correct: true,
            explain: "HttpOnly tira a chave do alcance do script. Secure e SameSite cuidam de outros caminhos.",
          },
          {
            id: "cors",
            label: "Um cabeçalho de cor do botão",
            explain: "Aparência não esconde o cookie do script.",
          },
          {
            id: "senha",
            label: "Repetir a senha no HTML",
            explain: "Mostrar a senha piora o quadro. A marca que falta é HttpOnly.",
          },
        ],
      },
      {
        kind: "choice",
        id: "http",
        prompt: "A mesma chave aparece numa visita sem HTTPS. Qual marca segura esse caminho?",
        choices: [
          {
            id: "secure",
            label: "Secure",
            correct: true,
            explain: "Secure faz o navegador guardar a chave para conexões HTTPS.",
          },
          {
            id: "httponly",
            label: "HttpOnly",
            explain: "HttpOnly esconde do script. Não escolhe HTTP ou HTTPS.",
          },
          {
            id: "cache",
            label: "Desligar o cache do CSS",
            explain: "O cache da folha de estilo não decide se o cookie viaja.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fixa",
        prompt: "O identificador é o mesmo antes e depois do login. O que falta no servidor?",
        choices: [
          {
            id: "troca",
            label: "Trocar a chave no login e esquecer a anterior",
            correct: true,
            explain: "A chave antiga deixa de apontar para a sessão autenticada.",
          },
          {
            id: "css",
            label: "Esconder o campo de senha com CSS",
            explain: "Esconder o campo não troca o identificador.",
          },
          {
            id: "none",
            label: "Marcar SameSite=None",
            explain: "None abre o envio cruzado. Não troca a chave.",
          },
        ],
      },
    ],
  },
  {
    id: "sessao-lab",
    order: 4,
    title: "Fechar a chave",
    summary: "Marque as defesas. O checker só aceita a chave quando todas estão presentes.",
    kind: "lab",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "A Pizzaria do Lab começa com sessao=chave-da-alice, sem marcas. Cada caixa liga uma defesa. O servidor confere a forma da chave: ele não executa o que você escreve e não abre um alvo fora daqui.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "O conjunto que passa: HttpOnly, Secure, SameSite Lax ou Strict, chave nova no login, registro apagado no logout.",
      },
    ],
    questions: [],
  },
  {
    id: "sessao-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de sessão espera este checkpoint e o lab em que a chave passou no checker.",
    kind: "checkpoint",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Três decisões de produto. O selo não sai só da leitura: o lab de flags precisa estar verde.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto fecha a chave no caso comum?",
        choices: [
          {
            id: "todas",
            label: "HttpOnly, Secure, SameSite Lax, troca no login e apagar no logout",
            correct: true,
            explain: "Cada peça cobre um caminho. Uma só não substitui as outras.",
          },
          {
            id: "none",
            label: "SameSite=None e a chave no localStorage",
            explain: "None deixa o cookie sair em pedido cruzado, e o localStorage entrega a chave ao script da página.",
          },
          {
            id: "esconder",
            label: "Esconder o botão de sair",
            explain: "O botão some da tela. A chave antiga continua válida no servidor.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de sessão pode sair?",
        choices: [
          {
            id: "lab",
            label: "Depois do lab das flags e deste checkpoint",
            correct: true,
            explain: "A especialidade inclui a chave que o checker aceitou.",
          },
          {
            id: "leitura",
            label: "Assim que a teoria das flags é lida",
            explain: "Ler explica. O selo pede a defesa conferida.",
          },
        ],
      },
    ],
  },
];
