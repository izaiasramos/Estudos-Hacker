import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "autenticacao",
  title: "Autenticação quebrada e senhas",
  summary:
    "Provar identidade sem entregar a chave mestra: hash, mensagens genéricas e limites quando alguém erra o login.",
};

export const UNITS: Unit[] = [
  {
    id: "auth-proposito",
    order: 1,
    title: "O que o login prova",
    summary: "Autenticação responde “quem é você?”. Autorização responde “o que pode fazer?”.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "papel",
        prompt: "O login bem-sucedido entrega o quê, em geral?",
        choices: [
          {
            id: "sessao",
            label: "Uma sessão ou token temporário, não a senha de volta",
            correct: true,
            explain: "A senha autentica uma vez. Depois a sessão evita repetir o segredo.",
          },
          {
            id: "senha",
            label: "A senha em texto para o navegador guardar",
            explain: "A senha não deve voltar ao cliente depois do cadastro.",
          },
          {
            id: "banco",
            label: "Acesso direto ao banco de produção",
            explain: "Login autoriza o usuário no app, não abre o Postgres.",
          },
        ],
      },
      {
        kind: "choice",
        id: "authz",
        prompt: "Bloquear um pedido porque não é do usuário é…",
        choices: [
          {
            id: "autorizacao",
            label: "Autorização (controle de acesso)",
            correct: true,
            explain: "Autenticação identifica. Autorização decide o que essa identidade alcança.",
          },
          {
            id: "hash",
            label: "Hash de senha",
            explain: "Hash protege o segredo armazenado. Autorização olha o recurso pedido.",
          },
          {
            id: "css",
            label: "Estilo da página de erro",
            explain: "Aparência não substitui checagem de permissão.",
          },
        ],
      },
      {
        kind: "choice",
        id: "quebra",
        prompt: "Qual cenário é autenticação quebrada?",
        choices: [
          {
            id: "enum",
            label: "Mensagens diferentes para “e-mail não existe” e “senha errada”",
            correct: true,
            explain: "Isso ajuda a adivinhar contas válidas. A resposta deve ser genérica.",
          },
          {
            id: "bcrypt",
            label: "Guardar senha com bcrypt",
            explain: "Hash moderno é defesa, não quebra.",
          },
          {
            id: "logout",
            label: "Botão de sair que apaga a sessão",
            explain: "Logout correto reduz risco de sessão, não é falha de login.",
          },
        ],
      },
    ],
  },
  {
    id: "auth-senha",
    order: 2,
    title: "Senha no servidor",
    summary: "Nunca texto puro. Hash lento, sal automático e comparação constante.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "armazenar",
        prompt: "Como a senha deve ficar no banco?",
        choices: [
          {
            id: "hash",
            label: "Somente hash com algoritmo moderno",
            correct: true,
            explain: "Texto puro ou criptografia reversível expõe o segredo no vazamento.",
          },
          {
            id: "plain",
            label: "Texto puro, porque só dev interno acessa",
            explain: "Backup, log ou SQL injection transformam “só interno” em vazamento.",
          },
          {
            id: "base64",
            label: "Base64, porque parece embaralhado",
            explain: "Base64 decodifica em um clique. Não é hash.",
          },
        ],
      },
      {
        kind: "choice",
        id: "politica",
        prompt: "Política mínima de senha no cadastro serve para…",
        choices: [
          {
            id: "barreira",
            label: "Barrar senhas óbvias antes de hash",
            correct: true,
            explain: "Listas de senhas comuns quebram hash fraco ou reutilizado em segundos.",
          },
          {
            id: "email",
            label: "Substituir verificação de e-mail",
            explain: "São camadas diferentes. Política não prova que o e-mail é da pessoa.",
          },
          {
            id: "oauth",
            label: "Desligar login com Google",
            explain: "OAuth e senha local podem coexistir com regras claras.",
          },
        ],
      },
      {
        kind: "text",
        id: "porque-hash",
        prompt: "Em uma frase: por que vazar hash ainda é grave?",
        min: 20,
        stems: ["tentativa", "reutiliz", "lista", "rainbow", "quebrar", "testar"],
        explain: "Atacantes testam hashes offline com listas e senhas reutilizadas até achar correspondência.",
      },
    ],
  },
  {
    id: "auth-sintomas",
    order: 3,
    title: "Sintomas no login",
    summary: "Três sinais de login frágil antes de abrir o chamado de segurança.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "generica",
        prompt: "Qual resposta de login inválido é mais segura?",
        choices: [
          {
            id: "unica",
            label: "“E-mail ou senha inválidos” para qualquer falha",
            correct: true,
            explain: "Quem erra não descobre se o e-mail existe.",
          },
          {
            id: "404",
            label: "404 quando o e-mail não existe e 401 quando a senha falha",
            explain: "Dois códigos/mensagens distintos permitem enumerar contas.",
          },
          {
            id: "senha",
            label: "“Senha errada” mesmo quando o e-mail não existe",
            explain: "Ainda confirma que o e-mail está cadastrado.",
          },
        ],
      },
      {
        kind: "choice",
        id: "default",
        prompt: "admin / admin ainda funciona no ambiente de staging. O risco é…",
        choices: [
          {
            id: "backdoor",
            label: "Conta conhecida aberta se o ambiente vazar ou for clonado",
            correct: true,
            explain: "Credencial padrão é autenticação quebrada clássica.",
          },
          {
            id: "hash",
            label: "Falta de hash bcrypt",
            explain: "Pode coexistir com hash; o problema é a senha previsível aceita.",
          },
          {
            id: "https",
            label: "Ausência de favicon",
            explain: "HTTPS importa, mas não corrige senha padrão.",
          },
        ],
      },
      {
        kind: "choice",
        id: "limit",
        prompt: "Rate limit no login protege principalmente contra…",
        choices: [
          {
            id: "forca",
            label: "Tentativas automatizadas em massa",
            correct: true,
            explain: "Desacelera adivinhação online. Hash forte protege o offline.",
          },
          {
            id: "xss",
            label: "Script roubar cookie",
            explain: "XSS é outra categoria. Limitar login não impede script na página.",
          },
          {
            id: "sql",
            label: "SQL injection na listagem",
            explain: "Consulta parametrizada fecha SQLi. Rate limit fecha volume de login.",
          },
        ],
      },
    ],
  },
  {
    id: "auth-lab",
    order: 4,
    title: "Endurecer o login",
    summary: "Marque as defesas. O checker só aceita quando o login fictício fica defensável.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "auth-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "O selo de autenticação espera este checkpoint e o lab com checker verde.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto fecha login no caso comum?",
        choices: [
          {
            id: "todas",
            label: "Hash, mensagem genérica, política no cadastro e limite de tentativas",
            correct: true,
            explain: "Cada peça cobre um vetor. Uma só não substitui as outras.",
          },
          {
            id: "plain",
            label: "Senha em texto puro com CAPTCHA colorido",
            explain: "CAPTCHA atrapalha bots, mas vazamento do banco ainda expõe senhas.",
          },
          {
            id: "esconder",
            label: "Esconder o formulário de login no CSS",
            explain: "Ocultar UI não remove o endpoint.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Quando o selo de autenticação pode sair?",
        choices: [
          {
            id: "lab",
            label: "Depois do lab de login e deste checkpoint",
            correct: true,
            explain: "A especialidade inclui a configuração que o checker aceitou.",
          },
          {
            id: "leitura",
            label: "Assim que a teoria de hash é lida",
            explain: "Ler explica. O selo pede a defesa conferida.",
          },
        ],
      },
    ],
  },
];
