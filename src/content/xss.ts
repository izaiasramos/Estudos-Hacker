import type { Unit } from "@/content/sql-injection";

export const TRAIL = {
  slug: "xss",
  title: "Cross-Site Scripting (XSS): scripts injetados na página",
  summary:
    "Investigue quando texto vira código no navegador e decida onde separar dados, HTML e scripts com segurança.",
};

export const UNITS: Unit[] = [
  {
    id: "xss-proposito",
    order: 1,
    title: "Quando um comentário dá ordens",
    summary: "Cross-Site Scripting começa quando o navegador confunde conteúdo com código.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "onde",
        prompt: "Onde o Cross-Site Scripting (XSS) produz seu efeito principal?",
        choices: [
          {
            id: "browser",
            label: "No navegador da vítima, dentro da página do aplicativo",
            correct: true,
            explain: "Isso mesmo. O navegador interpreta dado não confiável como parte ativa da página e lhe dá o contexto do aplicativo.",
          },
          {
            id: "postgres",
            label: "Somente no banco de dados que guardou o comentário",
            explain: "O banco pode armazenar a entrada, mas o efeito de XSS surge quando o navegador a interpreta como HTML ou JavaScript.",
          },
          {
            id: "smtp",
            label: "Somente fora do site, antes de a página carregar",
            explain: "XSS se manifesta na renderização ou no código da página. Procure o ponto em que dado virou conteúdo ativo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "efeito",
        prompt: "Por que uma sessão ainda corre risco mesmo com o cookie marcado como HttpOnly?",
        choices: [
          {
            id: "script",
            label: "O script injetado pode alterar a interface e disparar ações como a vítima",
            correct: true,
            explain: "HttpOnly impede a leitura direta do cookie por JavaScript, mas não impede que código na página use a sessão pelo navegador.",
          },
          {
            id: "hash",
            label: "Porque HttpOnly transforma todo texto em código",
            explain: "HttpOnly protege o acesso ao cookie. A confusão entre texto e código acontece no ponto de renderização.",
          },
          {
            id: "dns",
            label: "Porque qualquer comentário recebe privilégios de administrador",
            explain: "O código herda o contexto da sessão da vítima, não privilégios automáticos. O impacto depende do que essa sessão pode fazer.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fronteira",
        prompt: "Qual decisão preserva a fronteira central contra XSS?",
        choices: [
          {
            id: "separar",
            label: "Manter dado não confiável separado de HTML e JavaScript executáveis",
            correct: true,
            explain: "Correto. Use saída adequada ao contexto, APIs de texto e sanitização quando HTML for realmente necessário.",
          },
          {
            id: "senha",
            label: "Confiar no conteúdo depois que ele foi salvo pelo servidor",
            explain: "Persistir não torna um dado confiável. A saída ainda precisa tratá-lo conforme o contexto onde será inserido.",
          },
          {
            id: "css",
            label: "Ocultar visualmente o conteúdo suspeito",
            explain: "Código oculto ainda pode executar. A defesa precisa impedir a interpretação como código, não apenas mudar a aparência.",
          },
        ],
      },
    ],
  },
  {
    id: "xss-tipos",
    order: 2,
    title: "Siga o caminho do dado",
    summary: "Refletido, armazenado ou baseado no DOM: muda o trajeto, não a fronteira quebrada.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "refletido",
        prompt: "A busca devolve o termo cru na resposta atual. Que caminho de XSS isso descreve?",
        choices: [
          {
            id: "ref",
            label: "XSS refletido",
            correct: true,
            explain: "O dado chega no pedido e volta imediatamente na resposta, sem precisar ficar armazenado.",
          },
          {
            id: "stored",
            label: "XSS armazenado",
            explain: "No armazenado, a entrada persiste e pode atingir visitantes em acessos posteriores.",
          },
          {
            id: "csrf",
            label: "Apenas uma alteração visual inofensiva",
            explain: "Se o navegador interpreta a entrada como código, ela pode agir no contexto da página; não é só aparência.",
          },
        ],
      },
      {
        kind: "choice",
        id: "stored",
        prompt: "Um comentário malicioso salvo aparece para cada visitante no dia seguinte. Que caminho é esse?",
        choices: [
          {
            id: "arm",
            label: "XSS armazenado",
            correct: true,
            explain: "A entrada persistiu no sistema e é renderizada para outras sessões depois.",
          },
          {
            id: "ref",
            label: "Somente XSS refletido",
            explain: "O refletido acompanha uma resposta imediata; aqui o dado sobreviveu para visitas futuras.",
          },
          {
            id: "idor",
            label: "Não há risco porque o servidor aceitou o comentário",
            explain: "Aceitar e armazenar não prova segurança. O risco aparece no modo como cada página renderiza o valor.",
          },
        ],
      },
      {
        kind: "text",
        id: "invariante",
        prompt: "Em uma frase: qual fronteira o XSS quebra?",
        min: 20,
        stems: ["confi", "markup", "script", "dado", "codif", "escape"],
        explain: "A síntese esperada é: dado não confiável nunca deve ser interpretado como HTML ou JavaScript executável.",
      },
    ],
  },
  {
    id: "xss-sintomas",
    order: 3,
    title: "Escolha a defesa no ponto certo",
    summary: "DOM seguro evita a confusão; sanitização trata HTML necessário; CSP limita o impacto.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "inner",
        prompt: "O painel só precisa mostrar texto de usuário. Qual decisão evita que esse texto vire elementos do DOM?",
        choices: [
          {
            id: "xss",
            label: "Usar textContent ou interpolação segura do framework",
            correct: true,
            explain: "Essas APIs criam texto. innerHTML, ao contrário, pede ao navegador que analise a string como marcação.",
          },
          {
            id: "sql",
            label: "Usar innerHTML e revisar visualmente o comentário",
            explain: "A revisão visual não muda o comportamento da API: innerHTML continua interpretando marcação.",
          },
          {
            id: "hash",
            label: "Codificar o comentário em Base64 antes de usar innerHTML",
            explain: "Base64 é transporte, não defesa de saída. Depois de decodificado, o conteúdo perigoso continua existindo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "csp",
        prompt: "Qual papel uma Content Security Policy (CSP) com nonce cumpre?",
        choices: [
          {
            id: "limit",
            label: "Adiciona uma camada que autoriza scripts esperados e dificulta scripts injetados",
            correct: true,
            explain: "O nonce identifica scripts autorizados naquela resposta. É defesa adicional, não blindagem absoluta nem substituto para saída segura.",
          },
          {
            id: "bcrypt",
            label: "Torna segura qualquer concatenação de HTML feita pela aplicação",
            explain: "CSP pode reduzir impacto, mas não corrige a mistura entre dado e marcação nem cobre todo tipo de abuso.",
          },
          {
            id: "email",
            label: "Remove automaticamente conteúdo perigoso salvo no banco",
            explain: "CSP controla o que o navegador pode executar; sanitização e APIs seguras tratam o conteúdo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "sanitize",
        prompt: "O produto exige comentários com HTML rico. Qual decisão é apropriada?",
        choices: [
          {
            id: "allow",
            label: "Sanitizar com lista permitida de tags e atributos antes de renderizar",
            correct: true,
            explain: "Sanitização preserva somente o subconjunto de HTML necessário e remove construções perigosas. Se HTML não for requisito, prefira texto.",
          },
          {
            id: "black",
            label: "Bloquear apenas a palavra script",
            explain: "Há muitos elementos e atributos capazes de produzir comportamento. Uma lista permitida é mais previsível que uma lista de bloqueio.",
          },
          {
            id: "base64",
            label: "Aceitar qualquer tag desde que exista CSP",
            explain: "CSP é uma camada adicional. Ela não transforma HTML arbitrário em conteúdo confiável.",
          },
        ],
      },
    ],
  },
  {
    id: "xss-lab",
    order: 4,
    title: "Simule as decisões do painel",
    summary: "Checklist de decisão e configuração: selecione camadas coerentes para um painel fictício.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "xss-checkpoint",
    order: 5,
    title: "Checkpoint",
    summary: "Decida o conjunto, explique o papel de cada camada e consolide o modelo mental.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "conjunto",
        prompt: "Qual conjunto trata a causa e também reduz o impacto de XSS?",
        choices: [
          {
            id: "todas",
            label: "Saída por contexto, DOM seguro, sanitização do HTML necessário e CSP",
            correct: true,
            explain: "As três primeiras decisões evitam ou removem a interpretação perigosa; CSP acrescenta contenção caso algo escape.",
          },
          {
            id: "csp-so",
            label: "Somente CSP com nonce",
            explain: "Nonce fortalece a política de scripts, mas não torna segura toda injeção de HTML nem corrige um sink perigoso.",
          },
          {
            id: "hidden",
            label: "Somente esconder o comentário suspeito",
            explain: "Visibilidade não controla execução. O dado precisa continuar sendo dado em cada contexto de saída.",
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
            label: "Concluir a simulação de decisões do painel e este checkpoint",
            correct: true,
            explain: "O lab registra a configuração defensiva; o checkpoint confirma que você entende por que ela funciona.",
          },
          {
            id: "leitura",
            label: "Apenas reconhecer os nomes refletido e armazenado",
            explain: "Os nomes localizam o caminho. A competência está em preservar a fronteira entre dado e código.",
          },
        ],
      },
    ],
  },
];
