import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "sessao",
  title: "Sessão",
  summary:
    "Como um site reconhece você depois do login — e quais decisões impedem que outra pessoa reutilize essa identidade.",
};

export const UNITS: Unit[] = [
  {
    id: "sessao-chave",
    order: 1,
    title: "A chave temporária",
    summary: "Do login ao pedido seguinte: quem guarda a identidade e quem carrega a chave.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "quem",
        prompt: "Depois do login, quem confirma a identidade em cada novo pedido?",
        choices: [
          {
            id: "servidor",
            label: "O servidor, ao validar a chave e encontrar a sessão correspondente",
            correct: true,
            explain:
              "A sessão fica sob controle do servidor. O navegador apresenta a chave; o servidor verifica se ela ainda aponta para uma identidade válida.",
          },
          {
            id: "navegador",
            label: "O navegador, que escolhe sozinho qual usuário está conectado",
            explain:
              "O navegador guarda e reenvia a chave, mas não decide em qual identidade o servidor deve confiar.",
          },
          {
            id: "senha",
            label: "A senha, que deve ser enviada de novo em cada página",
            explain:
              "A senha participa da autenticação inicial. A sessão evita repetir esse segredo em cada pedido.",
          },
        ],
      },
      {
        kind: "choice",
        id: "chave",
        prompt: "O que um cookie de sessão deve carregar?",
        choices: [
          {
            id: "temp",
            label: "Uma chave temporária que o servidor relaciona à sessão",
            correct: true,
            explain:
              "A chave representa a sessão enquanto for válida. Ela não é a senha nem uma identidade permanente.",
          },
          {
            id: "senha",
            label: "A senha da pessoa, para o servidor economizar uma consulta",
            explain:
              "A senha não deve voltar ao navegador dentro do cookie. Expor o segredo amplia o dano de qualquer vazamento.",
          },
          {
            id: "html",
            label: "O conteúdo HTML completo da área logada",
            explain:
              "O cookie leva um pequeno valor de identificação da sessão, não o conteúdo das páginas.",
          },
        ],
      },
      {
        kind: "text",
        id: "por-que",
        prompt: "Em uma frase: por que o vazamento da chave de sessão é grave?",
        min: 24,
        stems: ["servidor", "usuário", "usuario", "como se", "identidade", "chave"],
        explain:
          "Enquanto a chave continuar válida, o servidor pode tratar quem a apresenta como o usuário ligado à sessão.",
      },
    ],
  },
  {
    id: "sessao-flags",
    order: 2,
    title: "Limites para a chave",
    summary: "Três instruções ao navegador e duas decisões no servidor reduzem caminhos de abuso.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "httponly",
        prompt: "O que o atributo HttpOnly muda?",
        choices: [
          {
            id: "script",
            label: "Impede o JavaScript da página de ler o cookie",
            correct: true,
            explain:
              "O navegador ainda pode enviar o cookie ao servidor, mas não o entrega à leitura direta do JavaScript.",
          },
          {
            id: "https",
            label: "Cria uma conexão HTTPS para o site",
            explain:
              "HttpOnly controla leitura por script. Secure controla o envio por conexão, e o site ainda precisa oferecer HTTPS.",
          },
          {
            id: "senha",
            label: "Transforma a senha guardada no banco",
            explain:
              "HttpOnly é um atributo do cookie. Armazenamento de senha pertence ao fluxo de autenticação.",
          },
        ],
      },
      {
        kind: "choice",
        id: "samesite",
        prompt: "O que SameSite=None permite em comparação com Lax ou Strict?",
        choices: [
          {
            id: "cruzado",
            label: "Que o cookie acompanhe pedidos entre sites",
            correct: true,
            explain:
              "None permite esse envio e normalmente exige Secure. Lax limita o envio e ainda aceita algumas navegações; Strict é mais restritivo.",
          },
          {
            id: "some",
            label: "Que o cookie seja apagado ao fechar qualquer página",
            explain:
              "SameSite controla o contexto de envio entre sites; não define sozinho quando o cookie expira.",
          },
          {
            id: "banco",
            label: "Que o navegador escolha quais consultas chegam ao banco",
            explain:
              "SameSite só orienta o envio do cookie. Consultas e permissões continuam sob responsabilidade do servidor.",
          },
        ],
      },
      {
        kind: "choice",
        id: "rotacao",
        prompt: "Por que gerar outra chave quando o login termina?",
        choices: [
          {
            id: "antiga",
            label: "Para a chave conhecida antes do login não identificar a sessão autenticada",
            correct: true,
            explain:
              "A rotação separa o estado anterior da nova sessão autenticada e o servidor deve invalidar a chave antiga.",
          },
          {
            id: "visual",
            label: "Para o valor parecer mais complexo no inspetor",
            explain:
              "A aparência não é a defesa. O que importa é criar outro identificador e invalidar o anterior.",
          },
          {
            id: "email",
            label: "Para enviar uma cópia da senha por e-mail",
            explain:
              "A rotação troca a chave da sessão no servidor; não envia nem recupera a senha.",
          },
        ],
      },
    ],
  },
  {
    id: "sessao-sintomas",
    order: 3,
    title: "Ler os sintomas",
    summary: "Use o que é observável para escolher a defesa certa, sem confundir responsabilidades.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "sintoma",
        prompt: "O JavaScript da página lê `sessao=chave-da-alice`. Qual decisão está ausente?",
        choices: [
          {
            id: "httponly",
            label: "Adicionar HttpOnly ao cookie",
            correct: true,
            explain:
              "HttpOnly remove o cookie da leitura direta por JavaScript. Secure e SameSite tratam outros caminhos.",
          },
          {
            id: "cors",
            label: "Mudar a cor do botão de login",
            explain:
              "Uma mudança visual não altera quem consegue ler o cookie. A decisão relacionada ao sintoma é HttpOnly.",
          },
          {
            id: "senha",
            label: "Colocar a senha junto da chave",
            explain:
              "Isso exporia também a prova de autenticação. O cookie de sessão não deve carregar a senha.",
          },
        ],
      },
      {
        kind: "choice",
        id: "http",
        prompt: "O navegador envia a chave numa conexão sem HTTPS. Qual atributo impede esse envio?",
        choices: [
          {
            id: "secure",
            label: "Secure",
            correct: true,
            explain:
              "Secure orienta o navegador a enviar o cookie somente por HTTPS; ele não configura HTTPS no servidor.",
          },
          {
            id: "httponly",
            label: "HttpOnly",
            explain:
              "HttpOnly controla a leitura por JavaScript, não escolhe entre conexões HTTP e HTTPS.",
          },
          {
            id: "cache",
            label: "Desativar o cache dos estilos",
            explain:
              "O cache visual não controla o transporte do cookie. O atributo relacionado ao sintoma é Secure.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fixa",
        prompt: "A chave é igual antes e depois da autenticação. O que o servidor deve fazer?",
        choices: [
          {
            id: "troca",
            label: "Gerar uma nova chave no login e invalidar a anterior",
            correct: true,
            explain:
              "Assim, uma chave conhecida antes do login não passa a representar a identidade autenticada.",
          },
          {
            id: "css",
            label: "Ocultar o campo de senha depois do envio",
            explain:
              "Ocultar um elemento da tela não muda a validade da chave no servidor.",
          },
          {
            id: "none",
            label: "Alterar SameSite para None",
            explain:
              "None permite envio entre sites e não troca o identificador. A correção aqui é a rotação da chave.",
          },
        ],
      },
    ],
  },
  {
    id: "sessao-lab",
    order: 4,
    title: "Decidir a configuração",
    summary: "Complete um checklist simulado para a chave e para seu ciclo no servidor.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "sessao-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "Conecte os limites do cookie ao nascimento e ao fim da sessão.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto resume as decisões exercitadas no checklist?",
        choices: [
          {
            id: "todas",
            label: "HttpOnly, Secure, SameSite adequado, rotação no login e invalidação no logout",
            correct: true,
            explain:
              "Esse é o conjunto exercitado no lab. Em uma aplicação real, também é preciso definir expiração e revisar outros riscos.",
          },
          {
            id: "none",
            label: "SameSite=None e a chave em um local legível por JavaScript",
            explain:
              "Essa escolha amplia o envio entre sites e expõe a chave à leitura por scripts. Ela piora os riscos estudados.",
          },
          {
            id: "esconder",
            label: "Esconder o botão de sair sem invalidar a chave",
            explain:
              "A interface muda, mas a sessão continua válida no servidor. Logout precisa invalidar a chave.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "O que o lab verde demonstra nesta trilha?",
        choices: [
          {
            id: "lab",
            label: "Que as decisões esperadas foram selecionadas no checklist simulado",
            correct: true,
            explain:
              "O lab registra somente decisões de configuração; não executa nem certifica uma implementação real. O selo também exige concluir este checkpoint.",
          },
          {
            id: "leitura",
            label: "Que uma aplicação real foi testada apenas com a leitura da teoria",
            explain:
              "A teoria e o checklist ensinam decisões, mas validar código real exige testes e revisão da implementação.",
          },
        ],
      },
    ],
  },
];
