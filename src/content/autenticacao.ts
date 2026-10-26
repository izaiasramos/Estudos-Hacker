import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "autenticacao",
  title: "Autenticação quebrada e senhas",
  summary:
    "Como verificar identidade sem revelar contas, facilitar adivinhação ou transformar um vazamento em uma lista de senhas legíveis.",
};

export const UNITS: Unit[] = [
  {
    id: "auth-proposito",
    order: 1,
    title: "O que o login prova",
    summary: "Comece por uma resposta que vaza informação e separe identidade, continuidade e permissão.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "papel",
        prompt: "Depois de verificar a identidade, o que o login costuma criar?",
        choices: [
          {
            id: "sessao",
            label: "Uma sessão ou outra credencial temporária, sem devolver a senha",
            correct: true,
            explain:
              "A autenticação verifica a prova. Depois, uma sessão pode manter a identidade sem repetir a senha em cada pedido.",
          },
          {
            id: "senha",
            label: "Uma cópia da senha em texto para o navegador guardar",
            explain:
              "A senha não deve ser devolvida nem usada como identificador contínuo. Ela é uma prova de autenticação.",
          },
          {
            id: "banco",
            label: "Permissão direta para consultar todo o banco",
            explain:
              "Autenticar identifica a pessoa. A autorização ainda precisa decidir quais recursos essa identidade pode acessar.",
          },
        ],
      },
      {
        kind: "choice",
        id: "authz",
        prompt: "Negar a Ana acesso aos dados de Bruno é uma decisão de…",
        choices: [
          {
            id: "autorizacao",
            label: "Autorização",
            correct: true,
            explain:
              "Autenticação verifica quem é Ana. Autorização decide se Ana pode acessar aquele recurso específico.",
          },
          {
            id: "hash",
            label: "Armazenamento de senha",
            explain:
              "Proteger a senha armazenada é parte da autenticação, mas não decide o acesso a cada recurso.",
          },
          {
            id: "css",
            label: "Aparência da página de erro",
            explain:
              "Ocultar um botão não aplica permissão. A decisão precisa acontecer no servidor.",
          },
        ],
      },
      {
        kind: "choice",
        id: "quebra",
        prompt: "Qual comportamento enfraquece a autenticação?",
        choices: [
          {
            id: "enum",
            label: "Responder de um jeito para e-mail inexistente e de outro para senha errada",
            correct: true,
            explain:
              "A diferença permite descobrir contas cadastradas antes mesmo de acertar uma senha.",
          },
          {
            id: "bcrypt",
            label: "Usar um algoritmo próprio para hash de senha",
            explain:
              "Esse é um controle de armazenamento. A próxima unidade explica como ele funciona e quais opções existem.",
          },
          {
            id: "logout",
            label: "Invalidar a sessão quando a pessoa sai",
            explain:
              "Isso encerra a continuidade da identidade. É uma defesa de sessão, não uma quebra do login.",
          },
        ],
      },
    ],
  },
  {
    id: "auth-senha",
    order: 2,
    title: "Senha no servidor",
    summary: "Compare senha legível e prova não reversível; depois escolha armazenamento e política de cadastro.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "armazenar",
        prompt: "Qual é a forma adequada de armazenar uma senha?",
        choices: [
          {
            id: "hash",
            label: "Hash com salt único e algoritmo próprio para senhas",
            correct: true,
            explain:
              "bcrypt, scrypt e Argon2 são opções próprias para esse trabalho. A biblioteca guarda também os parâmetros necessários para verificar a senha.",
          },
          {
            id: "plain",
            label: "Texto puro, porque apenas a equipe interna acessa o banco",
            explain:
              "Bancos, backups e logs podem vazar. Texto puro transforma esse incidente em exposição imediata das senhas.",
          },
          {
            id: "base64",
            label: "Base64, porque o resultado deixa de parecer uma senha",
            explain:
              "Base64 é uma codificação reversível, não um hash. Qualquer pessoa com o valor pode recuperar o texto.",
          },
        ],
      },
      {
        kind: "choice",
        id: "politica",
        prompt: "O que uma política mínima de cadastro acrescenta ao hash?",
        choices: [
          {
            id: "barreira",
            label: "Recusa senhas muito curtas, óbvias ou conhecidas antes de armazená-las",
            correct: true,
            explain:
              "Hash desacelera testes, mas não transforma uma senha previsível em uma boa senha.",
          },
          {
            id: "email",
            label: "Prova automaticamente que o e-mail pertence à pessoa",
            explain:
              "Qualidade da senha e controle do endereço de e-mail são verificações diferentes.",
          },
          {
            id: "oauth",
            label: "Impede qualquer uso de OAuth no produto",
            explain:
              "OAuth trata autorização delegada e pode participar de um fluxo com provedor. Ele não é desligado por uma política de senha local.",
          },
        ],
      },
      {
        kind: "text",
        id: "porque-hash",
        prompt: "Em uma frase: por que o vazamento de hashes de senha ainda é grave?",
        min: 20,
        stems: ["tentativa", "reutiliz", "lista", "offline", "descobrir", "testar"],
        explain:
          "Com os hashes, um atacante pode testar palpites offline. Senhas comuns ou reutilizadas ainda podem ser descobertas, mesmo quando o algoritmo desacelera cada tentativa.",
      },
    ],
  },
  {
    id: "auth-sintomas",
    order: 3,
    title: "Ler os sintomas",
    summary: "Diagnostique conta padrão, resposta reveladora e repetição automatizada em um ambiente de teste.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "generica",
        prompt: "Qual resposta reduz a descoberta de contas cadastradas?",
        choices: [
          {
            id: "unica",
            label: "“E-mail ou senha inválidos” em qualquer falha de credencial",
            correct: true,
            explain:
              "A mesma resposta deixa de confirmar se o e-mail existe. Outros sinais do fluxo também devem evitar essa diferença.",
          },
          {
            id: "404",
            label: "404 para e-mail inexistente e 401 para senha errada",
            explain:
              "Códigos diferentes ainda revelam se a conta existe, mesmo que a interface esconda o texto.",
          },
          {
            id: "senha",
            label: "“Senha errada” mesmo quando o e-mail não existe",
            explain:
              "Essa mensagem confirma que a busca por e-mail aconteceu e continua ajudando a descobrir contas.",
          },
        ],
      },
      {
        kind: "choice",
        id: "default",
        prompt: "`admin` / `admin` ainda funciona em staging. Qual é o risco?",
        choices: [
          {
            id: "backdoor",
            label: "Uma credencial previsível pode abrir o ambiente se ele for exposto ou copiado",
            correct: true,
            explain:
              "Staging é ambiente de teste, não sinônimo de ambiente descartável. Credenciais padrão devem ser removidas.",
          },
          {
            id: "hash",
            label: "O único problema é não saber qual algoritmo gerou o hash",
            explain:
              "Mesmo com hash adequado, aceitar uma senha pública e previsível mantém a conta vulnerável.",
          },
          {
            id: "https",
            label: "A página não exibe um ícone ao lado do título",
            explain:
              "Um detalhe visual não corrige a credencial conhecida. O risco está no acesso previsível.",
          },
        ],
      },
      {
        kind: "choice",
        id: "limit",
        prompt: "O que rate limiting reduz diretamente no login?",
        choices: [
          {
            id: "forca",
            label: "Tentativas automatizadas e repetidas de adivinhar credenciais",
            correct: true,
            explain:
              "O limite desacelera tentativas online. Hash adequado continua necessário contra testes offline após vazamento.",
          },
          {
            id: "xss",
            label: "Leitura de uma chave de sessão por JavaScript",
            explain:
              "Esse é um problema do contexto da página e da sessão. Limitar tentativas de login não impede a leitura.",
          },
          {
            id: "sql",
            label: "Consultas inseguras montadas com texto do usuário",
            explain:
              "Esse problema exige consultas parametrizadas. Rate limiting controla frequência, não a estrutura da consulta.",
          },
        ],
      },
    ],
  },
  {
    id: "auth-lab",
    order: 4,
    title: "Decidir as defesas",
    summary: "Complete um checklist simulado para armazenamento, respostas, cadastro e tentativas.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "auth-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "Una as decisões e reconheça o que o checklist consegue — e não consegue — demonstrar.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto cobre os riscos apresentados nesta trilha?",
        choices: [
          {
            id: "todas",
            label:
              "Hash adequado, resposta coerente, política de cadastro, remoção de credenciais padrão e rate limiting",
            correct: true,
            explain:
              "Cada decisão cobre um caminho diferente. Conforme o risco, o produto ainda pode exigir segundo fator, recuperação segura e monitoramento.",
          },
          {
            id: "plain",
            label: "Senha em texto puro protegida apenas por CAPTCHA",
            explain:
              "CAPTCHA pode dificultar automação, mas não protege senhas que vazam do banco nem substitui os outros controles.",
          },
          {
            id: "esconder",
            label: "Formulário escondido por estilo visual",
            explain:
              "Ocultar a interface não remove o endpoint nem aplica autenticação no servidor.",
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
              "O checker confirma somente as opções marcadas; não executa hash, mede tentativas nem certifica um login real. O selo também exige concluir este checkpoint.",
          },
          {
            id: "leitura",
            label: "Que uma aplicação real ficou segura apenas com a leitura da teoria",
            explain:
              "A trilha ensina decisões. Uma implementação real ainda exige revisão, testes e observação do comportamento.",
          },
        ],
      },
    ],
  },
];
