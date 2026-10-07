export type CalloutTone = "conceito" | "analogia" | "armadilha" | "dev";

export type Block =
  | { type: "p"; text: string }
  | { type: "callout"; tone: CalloutTone; text: string }
  | { type: "code"; caption: string; code: string }
  | { type: "glossary"; term: string; text: string };

export type Choice = {
  id: string;
  label: string;
  correct?: boolean;
  explain: string;
};

export type Question =
  | {
      kind: "choice";
      id: string;
      prompt: string;
      choices: Choice[];
    }
  | {
      kind: "text";
      id: string;
      prompt: string;
      min: number;
      stems: string[];
      explain: string;
    };

export type UnitKind = "theory" | "exercise" | "checkpoint" | "lab";

export type Unit = {
  id: string;
  order: number;
  title: string;
  summary: string;
  kind: UnitKind;
  gate: boolean;
  blocks: Block[];
  questions: Question[];
};

export const TRAIL = {
  slug: "sql-injection",
  title: "SQL Injection",
  summary: "Entender quando um dado vira instrução, e como separar os dois de novo.",
};

export const UNITS: Unit[] = [
  {
    id: "banco",
    order: 1,
    title: "O banco e a query",
    summary: "O que o aplicativo pede e o que o banco executa.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Um app web quase sempre guarda coisas num banco: usuários, pedidos, mensagens. Quando alguém clica em entrar ou busca um pedido, o servidor monta uma consulta e o banco devolve linhas.",
      },
      {
        type: "callout",
        tone: "conceito",
        text: "A consulta é uma instrução. O e-mail, o id e o texto da busca são dados. A segurança começa quando esses dois papéis não se misturam.",
      },
      {
        type: "callout",
        tone: "analogia",
        text: "No restaurante, o pedido é o dado e a receita é a instrução. Se o cliente puder reescrever a receita no meio do pedido, a cozinha deixa de fazer o prato e passa a seguir outra ordem.",
      },
      {
        type: "p",
        text: "O caminho comum é curto: o navegador manda o formulário, uma função no servidor lê o campo, uma consulta segue para o banco, e a resposta volta como página. O buraco mora nesse meio, quando o campo entra dentro do texto da consulta.",
      },
      {
        type: "glossary",
        term: "invariante",
        text: "Uma regra que o sistema precisa manter verdade. Aqui: dado continua dado, instrução continua instrução.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Você vê isso numa rota, num repositório ou num serviço que abre conexão com o banco. Se a consulta é um texto montado na hora, vale parar e olhar como o valor do usuário entrou ali.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "executa",
        prompt: "O que o banco executa?",
        choices: [
          {
            id: "intencao",
            label: "A intenção de quem preencheu o formulário",
            explain: "O banco não lê intenção. Ele executa a instrução que chegou.",
          },
          {
            id: "instrucao",
            label: "A instrução da consulta que o servidor enviou",
            correct: true,
            explain: "Chegou uma consulta. O banco obedece essa instrução.",
          },
          {
            id: "html",
            label: "O HTML da página",
            explain: "O HTML é a resposta do app. O banco trabalha com a consulta.",
          },
        ],
      },
      {
        kind: "choice",
        id: "orm",
        prompt: "Um ORM, sozinho, elimina o problema de misturar dado e instrução.",
        choices: [
          {
            id: "falso",
            label: "Falso. Dá para furar a proteção se o valor for colado na consulta por fora",
            correct: true,
            explain: "A ferramenta ajuda quando o valor viaja separado. Concatenar por fora desfaz isso.",
          },
          {
            id: "verdadeiro",
            label: "Verdadeiro. Se existe um ORM, a consulta está segura",
            explain: "O ORM não salva uma consulta que ainda é texto montado à mão.",
          },
        ],
      },
      {
        kind: "choice",
        id: "papel",
        prompt: "Qual é o papel de um valor separado da consulta?",
        choices: [
          {
            id: "enfeite",
            label: "Deixar a consulta mais curta, só por estilo",
            explain: "O tamanho não é o ponto. O ponto é o valor não ser lido como comando.",
          },
          {
            id: "separa",
            label: "Manter o valor como dado, fora do texto da instrução",
            correct: true,
            explain: "Separar os papéis é a invariante que a consulta precisa manter.",
          },
          {
            id: "esconde",
            label: "Esconder a tabela de quem usa o sistema",
            explain: "Esconder nome de tabela não separa dado de instrução.",
          },
        ],
      },
    ],
  },
  {
    id: "encontro",
    order: 2,
    title: "Onde o input encontra o SQL",
    summary: "Achar a linha em que o campo deixa de ser só um valor.",
    kind: "exercise",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "O campo do formulário é só texto quando chega. Ele vira problema na linha em que esse texto é costurado na consulta. Antes disso, é um valor. Depois disso, o banco pode lê-lo como parte do comando.",
      },
      {
        type: "code",
        caption: "O encontro perigoso",
        code: `const email = body.email
db.query("SELECT id FROM usuarios WHERE email = '" + email + "'")`,
      },
      {
        type: "code",
        caption: "O mesmo pedido, com o valor separado",
        code: `const email = body.email
db.query("SELECT id FROM usuarios WHERE email = ?", [email])`,
      },
      {
        type: "callout",
        tone: "conceito",
        text: "A primeira versão mistura o campo com a instrução. A segunda manda a instrução e o valor por caminhos diferentes. O banco continua buscando um e-mail. O que muda é quem controla a forma da consulta.",
      },
      {
        type: "callout",
        tone: "armadilha",
        text: "Trocar aspas ou filtrar um caractere famoso não é a correção. A correção é o valor não entrar no texto do comando.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "linha",
        prompt: "Em qual linha o dado do usuário encontra a instrução?",
        choices: [
          {
            id: "leitura",
            label: "const email = body.email",
            explain: "Aqui o campo só foi lido. Ainda é dado.",
          },
          {
            id: "cola",
            label: "A consulta que junta aspas, o email e mais aspas num texto só",
            correct: true,
            explain: "É nessa linha que o valor passa a fazer parte da instrução.",
          },
          {
            id: "placeholder",
            label: "A consulta com ? e a lista [email]",
            explain: "Aqui o valor viaja separado. A forma da consulta não muda com o campo.",
          },
        ],
      },
      {
        kind: "choice",
        id: "sintoma",
        prompt: "O que essa junção de textos quebra?",
        choices: [
          {
            id: "layout",
            label: "O layout da página de login",
            explain: "A página pode até continuar igual. O que quebrou foi a fronteira dentro da consulta.",
          },
          {
            id: "invariante",
            label: "A invariante de que o campo continua sendo dado",
            correct: true,
            explain: "O texto do campo passou a poder alterar a instrução.",
          },
          {
            id: "senha",
            label: "A política de tamanho da senha",
            explain: "Senha fraca é outro problema. Aqui o assunto é a consulta.",
          },
        ],
      },
      {
        kind: "choice",
        id: "igual",
        prompt: "As duas versões pedem o mesmo tipo de coisa ao banco.",
        choices: [
          {
            id: "sim",
            label: "Sim. As duas buscam um usuário pelo e-mail. A diferença é se o valor altera a instrução",
            correct: true,
            explain: "O pedido de negócio é o mesmo. A segunda versão não deixa o campo reescrever a consulta.",
          },
          {
            id: "nao",
            label: "Não. A versão com ? busca outra tabela",
            explain: "A tabela e o filtro são os mesmos. O que muda é o caminho do valor.",
          },
        ],
      },
    ],
  },
  {
    id: "invariante",
    order: 3,
    title: "Quando a string quebra a invariante",
    summary: "Por que colar texto muda o que o banco entende.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Uma consulta concatenada é uma frase só. O banco tem um leitor dessa frase: ele decide onde acaba um texto e onde começa um comando. Se o valor do usuário contém o caractere que fecha esse texto, o leitor pode passar a tratar o resto como instrução.",
      },
      {
        type: "callout",
        tone: "analogia",
        text: "É a diferença entre uma carta dentro do envelope e uma ordem escrita do lado de fora. Concatenar é deixar a pessoa escrever no lado de fora.",
      },
      {
        type: "p",
        text: "O servidor pode achar que mandou “busque este e-mail”. O banco recebe uma frase e obedece a frase inteira. Não há uma segunda leitura para adivinhar o que o programador queria.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Quando revisar um pull request, procure consulta montada com +, template string ou formato equivalente, com variável que veio de request, query string, cabeçalho ou corpo. Esse é o lugar da invariante.",
      },
      {
        type: "glossary",
        term: "consulta parametrizada",
        text: "A instrução fica fixa e os valores entram por um canal separado, como um ?. O banco não reinterpreta o valor como comando.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "leitor",
        prompt: "Quem decide se um pedaço da consulta é texto ou comando?",
        choices: [
          {
            id: "usuario",
            label: "A pessoa que preencheu o formulário, pela intenção dela",
            explain: "A intenção não chega ao banco. Chega a frase.",
          },
          {
            id: "parser",
            label: "O leitor da consulta no banco, a partir da frase que recebeu",
            correct: true,
            explain: "Ele separa texto e comando segundo a frase. Se a frase mudou, a leitura muda.",
          },
          {
            id: "navegador",
            label: "O navegador, antes de enviar o formulário",
            explain: "O navegador manda o campo. Quem interpreta a consulta é o banco.",
          },
        ],
      },
      {
        kind: "choice",
        id: "por que",
        prompt: "Por que “filtrar um caractere e seguir concatenando” é frágil?",
        choices: [
          {
            id: "lento",
            label: "Porque deixa a consulta lenta",
            explain: "Velocidade não é o defeito. O defeito é o valor continuar dentro da instrução.",
          },
          {
            id: "papel",
            label: "Porque o valor continua no mesmo texto que o comando. A fronteira ainda pode ser reescrita",
            correct: true,
            explain: "A correção é separar os papéis, não caçar caractere por caractere.",
          },
          {
            id: "orm",
            label: "Porque obriga o time a apagar o ORM",
            explain: "Dá para manter o ORM. O problema é a consulta que ainda é texto colado.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fixo",
        prompt: "Numa consulta parametrizada, o que fica fixo?",
        choices: [
          {
            id: "valor",
            label: "O valor digitado, para ninguém mais poder buscar",
            explain: "O valor muda a cada pedido. O que fica fixo é a forma da instrução.",
          },
          {
            id: "forma",
            label: "A forma da instrução. O valor viaja à parte",
            correct: true,
            explain: "A busca continua útil. Ela só não muda de forma por causa do campo.",
          },
        ],
      },
    ],
  },
  {
    id: "sintomas",
    order: 4,
    title: "O que um dev vê",
    summary: "Sintomas no laboratório, e qual hipótese eles sustentam.",
    kind: "exercise",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "No laboratório, o app de pedidos usa dados fictícios. Alice tem as pizzas dela. Bruno tem as dele. Quando a fronteira entre dado e instrução quebra, o sintoma aparece no comportamento, não num discurso.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Três sinais cabem nesta hipótese: um erro 500 que menciona a consulta, uma busca que passa a listar pedido de outra pessoa, ou um login do lab que entra sem ser a conta dona da senha. Fora do lab, esses sinais pedem correção e incidente, não um teste por conta própria.",
      },
      {
        type: "p",
        text: "O erro de sintaxe da consulta diz que o banco não conseguiu ler a frase. A listagem a mais diz que a frase foi lida e devolveu linhas que o filtro não deveria incluir. Os dois apontam para a mesma invariante, com evidências diferentes.",
      },
      {
        type: "callout",
        tone: "armadilha",
        text: "Um 500 genérico, sem relação com a consulta, pode ser outra coisa: arquivo ausente, serviço fora, bug de tipo. A hipótese de consulta quebrada precisa da evidência, não só do susto.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "caso-erro",
        prompt: "No lab, uma busca devolve 500 e o log cita a consulta. Qual hipótese cabe?",
        choices: [
          {
            id: "css",
            label: "O CSS da listagem quebrou",
            explain: "CSS quebrado muda a cara da página. Não gera erro de consulta no log.",
          },
          {
            id: "frase",
            label: "A frase enviada ao banco não foi lida como a consulta que o dev esperava",
            correct: true,
            explain: "O log aponta para a consulta. A frase que chegou não era a frase imaginada.",
          },
          {
            id: "senha",
            label: "A senha do banco expirou",
            explain: "Senha expirada falha antes, em geral para todo mundo, e não só numa busca.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso-lista",
        prompt: "A listagem do lab mostra pedidos da Alice para quem buscou outra coisa. O que isso evidencia?",
        choices: [
          {
            id: "filtro",
            label: "O filtro da consulta não limitou as linhas como a tela prometia",
            correct: true,
            explain: "A tela prometeu um recorte. O banco devolveu um recorte maior. O filtro não segurou.",
          },
          {
            id: "cache",
            label: "O navegador guardou a página de ontem",
            explain: "Cache pode repetir uma tela. Não explica o banco devolver a linha de outra pessoa nesta busca.",
          },
          {
            id: "alice",
            label: "A conta da Alice está sem senha",
            explain: "O sintoma está na listagem, não na senha da Alice.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso-generico",
        prompt: "Um 500 sem nenhuma menção à consulta. O que falta para cravar a hipótese?",
        choices: [
          {
            id: "evidencia",
            label: "Evidência de que a frase da consulta mudou ou falhou",
            correct: true,
            explain: "Sem essa evidência, o 500 é só um 500. A hipótese precisa do log, do comportamento ou dos dois.",
          },
          {
            id: "nome",
            label: "O nome do atacante",
            explain: "O diagnóstico da consulta não começa pelo nome de alguém.",
          },
        ],
      },
    ],
  },
  {
    id: "tipos",
    order: 5,
    title: "Três formas de o efeito aparecer",
    summary: "Nomes que você vai ouvir, e o que cada um muda para quem defende.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "O mecanismo de fundo é um só: dado virou instrução. O que muda é como o efeito volta para quem observa. Saber o nome ajuda a ler um relatório. Não muda a defesa principal.",
      },
      {
        type: "callout",
        tone: "conceito",
        text: "Na forma direta, a resposta da própria página traz o que não deveria. Na forma cega, a página não mostra o dado, mas o comportamento muda: erro, resultado vazio, ou uma diferença que denuncia a frase. Na forma de segunda ordem, o valor é guardado agora e só entra numa consulta concatenada mais tarde.",
      },
      {
        type: "p",
        text: "Para quem programa, a segunda ordem é a que mais escapa no review. O campo foi salvo “só como texto”. Outra função, em outro dia, cola esse texto numa consulta. O buraco não está na tela que gravou. Está na consulta que confiou no que estava guardado.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "Defender os três é a mesma invariante em todos os pontos que montam consulta, inclusive nos que leem dado já salvo. Não existe uma defesa por nome e outra por nome.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "cega",
        prompt: "O que a forma cega muda, em relação à forma direta?",
        choices: [
          {
            id: "defesa",
            label: "A defesa principal, que passa a ser outra",
            explain: "A defesa continua sendo separar dado e instrução. Muda o sintoma, não a correção.",
          },
          {
            id: "sintoma",
            label: "O sintoma. A página não devolve o dado, mas o comportamento ainda denuncia a frase",
            correct: true,
            explain: "Quem observa vê erro, vazio ou diferença. A invariante quebrada é a mesma.",
          },
          {
            id: "banco",
            label: "O banco, que deixa de executar a consulta",
            explain: "Se a frase chegou, o banco tenta executá-la. O que muda é o que a página mostra.",
          },
        ],
      },
      {
        kind: "choice",
        id: "segunda",
        prompt: "Onde mora o buraco da segunda ordem?",
        choices: [
          {
            id: "tela",
            label: "Só na tela que salvou o texto",
            explain: "Salvar texto é normal. O buraco abre quando uma consulta posterior cola esse texto na instrução.",
          },
          {
            id: "depois",
            label: "Na consulta que, mais tarde, concatena um valor que já estava salvo",
            correct: true,
            explain: "O dado ficou quieto até alguém tratá-lo como parte do comando.",
          },
          {
            id: "css",
            label: "No CSS da tela de cadastro",
            explain: "Aparência não transforma dado em instrução.",
          },
        ],
      },
      {
        kind: "choice",
        id: "nome",
        prompt: "Saber o nome da forma dispensa a consulta parametrizada.",
        choices: [
          {
            id: "nao",
            label: "Não. Os três nomes descrevem o sintoma. A correção é a mesma fronteira",
            correct: true,
            explain: "Nome ajuda a conversar. A invariante não muda com o nome.",
          },
          {
            id: "sim",
            label: "Sim. Cada nome pede um produto diferente",
            explain: "Produto extra pode observar. Quem segura a fronteira é a consulta que não concatena.",
          },
        ],
      },
    ],
  },
  {
    id: "lab-ofensivo",
    order: 6,
    title: "Laboratório: ver o buraco",
    summary: "O app fictício de pedidos, e o que o checker já registrou.",
    kind: "lab",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "O alvo é a Pizzaria do Lab. Só existem a Alice e o Bruno, com pedidos inventados. Nada aqui sai da plataforma. O trabalho desta unidade é ler o sintoma e apontar onde a fronteira quebrou. O fechamento fica no laboratório seguinte.",
      },
      {
        type: "callout",
        tone: "dev",
        text: "O checker olhou as duas funções que montam consulta. As duas colam o email no texto. Na listagem, o filtro não segurou: apareceu pedido de outra pessoa. Não há um segundo passo escondido. O sintoma e a linha já estão na mesa.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "sintoma",
        prompt: "O que o checker registrou na listagem?",
        choices: [
          {
            id: "filtro",
            label: "O filtro não segurou. A listagem trouxe pedido de outra pessoa",
            correct: true,
            explain: "Esse é o sintoma. A tela prometeu um recorte e devolveu mais do que devia.",
          },
          {
            id: "senha",
            label: "A senha da Alice vazou para o Bruno",
            explain: "O registro fala da listagem, não da senha.",
          },
          {
            id: "rede",
            label: "O app conseguiu abrir um site de fora",
            explain: "Este lab não fala com a internet. O achado é a consulta.",
          },
        ],
      },
      {
        kind: "choice",
        id: "onde",
        prompt: "Onde a fronteira quebrou?",
        choices: [
          {
            id: "as-duas",
            label: "Nas duas funções que colam o email dentro da consulta",
            correct: true,
            explain: "Login e listagem repetem o mesmo encontro. As duas precisam mudar.",
          },
          {
            id: "css",
            label: "No visual da lista de pizzas",
            explain: "O visual só mostra o que a consulta devolveu.",
          },
          {
            id: "uma",
            label: "Só na tela de login. A listagem está fora disso",
            explain: "A listagem é justamente onde o filtro não segurou.",
          },
        ],
      },
      {
        kind: "choice",
        id: "depois",
        prompt: "Qual é o passo seguinte, dentro deste produto?",
        choices: [
          {
            id: "fechar",
            label: "Fechar as duas consultas no laboratório defensivo, com o valor fora da frase",
            correct: true,
            explain: "O sintoma já foi visto. O que falta é a defesa no código do lab.",
          },
          {
            id: "outro",
            label: "Repetir o mesmo teste num sistema que não é o lab",
            explain: "O único alvo daqui é a Pizzaria do Lab. Fora dela, a prática para.",
          },
        ],
      },
    ],
  },
  {
    id: "debrief",
    order: 7,
    title: "O que o banco executou",
    summary: "Reconstituir a cena sem romancear o que aconteceu.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Depois do sintoma, a reconstituição é seca. O servidor montou uma frase. O banco leu essa frase como uma instrução. Executou o que a frase dizia. Não houve um modo secreto. Houve uma frase diferente da que a pessoa que programou tinha na cabeça.",
      },
      {
        type: "callout",
        tone: "conceito",
        text: "Se a frase fechou o texto cedo e continuou com outra ordem, o banco tratou essa ordem como parte legítima da consulta. Ele não “escolheu o lado” de ninguém. Ele obedeceu a instrução recebida.",
      },
      {
        type: "p",
        text: "Por isso o debrief olha para a consulta que saiu do servidor, não para a fama do problema. A pergunta útil é: em que ponto o valor deixou de viajar separado?",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "obedeceu",
        prompt: "O que o banco fez quando a frase chegou diferente?",
        choices: [
          {
            id: "recusou",
            label: "Adivinhou a consulta original e executou essa",
            explain: "Ele não restaura a intenção. Ele lê a frase que recebeu.",
          },
          {
            id: "obedeceu",
            label: "Executou a instrução da frase que realmente recebeu",
            correct: true,
            explain: "Uma frase entrou. Uma instrução saiu dela.",
          },
          {
            id: "avisou",
            label: "Avisou o time no chat e parou",
            explain: "Esse aviso seria do app ou do monitoramento. O banco, sozinho, executa a consulta.",
          },
        ],
      },
      {
        kind: "text",
        id: "explica",
        prompt:
          "Em duas ou três frases: o que quebrou, e o que o banco executou? Use suas palavras.",
        min: 40,
        stems: ["instru", "comando", "frase", "consulta"],
        explain:
          "A resposta precisa dizer que a frase da consulta mudou e que o banco executou essa instrução. Intenção não entra nessa cena.",
      },
    ],
  },
  {
    id: "defesas",
    order: 8,
    title: "Fechar a fronteira",
    summary: "Consulta parametrizada, menor privilégio, e o que não substitui isso.",
    kind: "theory",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "A defesa que segura o problema é a consulta em que a instrução fica fixa e o valor entra por um canal separado. No SQL isso aparece como parâmetro. Num ORM, como método que recebe o valor fora da string. Se o time voltar a concatenar, a defesa some.",
      },
      {
        type: "glossary",
        term: "menor privilégio",
        text: "A conta do banco que o app usa só pode o que o app precisa. Ler e gravar as tabelas da feature. Não derrubar o banco, não ler o que outra parte do sistema guarda.",
      },
      {
        type: "callout",
        tone: "conceito",
        text: "Menor privilégio não conserta a consulta concatenada. Ele reduz o estrago se a fronteira falhar. As duas camadas contam. Nenhuma substitui a outra.",
      },
      {
        type: "p",
        text: "Validar formato — um e-mail parece e-mail, um id é número — ajuda a feature a falhar cedo. Não é a muralha. Um valor válido ainda pode ser colado numa consulta se alguém concatenar.",
      },
      {
        type: "glossary",
        term: "WAF",
        text: "Um filtro na frente do app que tenta reconhecer pedidos suspeitos. É uma rede. Consulta concatenada continua quebrada se o pedido passar, ou se o dado já estiver salvo.",
      },
      {
        type: "callout",
        tone: "armadilha",
        text: "Tratar o WAF como correção única deixa o código do mesmo jeito. A rede observa. A fronteira se fecha na consulta.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "principal",
        prompt: "Qual mudança fecha a fronteira entre dado e instrução?",
        choices: [
          {
            id: "waf",
            label: "Ligar um WAF e deixar a concatenação",
            explain: "O WAF é rede. A consulta concatenada continua misturando os papéis.",
          },
          {
            id: "param",
            label: "Mandar a instrução fixa e o valor por um canal separado",
            correct: true,
            explain: "A forma da consulta deixa de depender do campo.",
          },
          {
            id: "esconder",
            label: "Esconder a mensagem de erro",
            explain: "Esconder o erro muda o sintoma. A frase continua podendo mudar.",
          },
        ],
      },
      {
        kind: "choice",
        id: "privilegio",
        prompt: "Para que serve a conta do banco com menos privilégio?",
        choices: [
          {
            id: "substituir",
            label: "Substituir a consulta parametrizada",
            explain: "Ela não separa dado e instrução. Ela limita o que uma instrução indevida consegue alcançar.",
          },
          {
            id: "limitar",
            label: "Limitar o alcance se a fronteira falhar",
            correct: true,
            explain: "Menos poder na conta, menos estrago. A consulta certa continua obrigatória.",
          },
        ],
      },
      {
        kind: "choice",
        id: "validar",
        prompt: "Validar o formato do campo é a correção completa?",
        choices: [
          {
            id: "nao",
            label: "Não. É uma camada a mais. O valor ainda não pode ser colado na instrução",
            correct: true,
            explain: "Formato válido e concatenação podem coexistir. A fronteira é outra.",
          },
          {
            id: "sim",
            label: "Sim. Se o e-mail parece e-mail, a consulta pode concatenar",
            explain: "Um valor bem formatado continua sendo texto dentro da frase, se alguém colar.",
          },
        ],
      },
    ],
  },
  {
    id: "lab-defensivo",
    order: 9,
    title: "Laboratório: fechar o buraco",
    summary: "Separe o valor da instrução e deixe os testes verdes.",
    kind: "lab",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "As duas funções abaixo são o app do lab. Hoje elas colam o email na frase. A busca tem de continuar a mesma: achar a pessoa pelo email, listar só os pedidos dela. O que muda é o caminho do valor.",
      },
      {
        type: "callout",
        tone: "conceito",
        text: "A instrução fica fixa, com um lugar marcado. O email segue como dado, num argumento separado. O servidor não executa o que você escrever: ele confere a forma da consulta e, se a fronteira fechou, roda os testes do app corrigido.",
      },
    ],
    questions: [],
  },
  {
    id: "checkpoint",
    order: 10,
    title: "Checkpoint",
    summary: "Quatro perguntas. O selo continua esperando o laboratório.",
    kind: "checkpoint",
    gate: true,
    blocks: [
      {
        type: "p",
        text: "Este checkpoint olha se a história ficou de pé: o que quebra, onde quebra, o que o banco faz e o que fecha a fronteira. O selo da especialidade só sai quando o laboratório defensivo existir e os testes passarem. Aqui você confirma a teoria.",
      },
    ],
    questions: [
      {
        kind: "choice",
        id: "quebra",
        prompt: "O que a concatenação quebra?",
        choices: [
          {
            id: "fronteira",
            label: "A fronteira entre o valor e a instrução",
            correct: true,
            explain: "O valor passa a poder mudar a frase que o banco executa.",
          },
          {
            id: "https",
            label: "O cadeado do navegador",
            explain: "O cadeado é outro assunto. A consulta quebrada acontece dentro do servidor.",
          },
        ],
      },
      {
        kind: "choice",
        id: "banco",
        prompt: "O banco, diante da frase que chegou, faz o quê?",
        choices: [
          {
            id: "executa",
            label: "Executa a instrução daquela frase",
            correct: true,
            explain: "Não há interpretação da intenção original.",
          },
          {
            id: "pergunta",
            label: "Pergunta ao app qual era a consulta desejada",
            explain: "Ele não devolve a frase para uma segunda chance. Ele executa.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fecha",
        prompt: "O que fecha a fronteira?",
        choices: [
          {
            id: "separa",
            label: "Instrução fixa e valor em canal separado",
            correct: true,
            explain: "É a consulta parametrizada, ou o equivalente no ORM.",
          },
          {
            id: "waf",
            label: "Só um WAF na frente",
            explain: "O WAF observa. Não reescreve a consulta concatenada.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "Este checkpoint emite o selo de SQL Injection?",
        choices: [
          {
            id: "nao",
            label: "Não. O selo espera o laboratório em que a defesa passa nos testes",
            correct: true,
            explain: "Teoria confirma o entendimento. O selo pede a defesa feita no código.",
          },
          {
            id: "sim",
            label: "Sim. Acertar o checkpoint completa a especialidade",
            explain: "A especialidade inclui fechar o buraco, não só explicá-lo.",
          },
        ],
      },
    ],
  },
];

export function unitById(id: string) {
  return UNITS.find((unit) => unit.id === id) ?? null;
}

export function gatedUnits() {
  return UNITS.filter((unit) => unit.gate);
}
