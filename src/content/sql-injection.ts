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

/** Metadados e quiz da unidade. O texto mora em `src/content/<trilha>/<id>.mdx`. */
export type Unit = {
  id: string;
  order: number;
  title: string;
  summary: string;
  kind: UnitKind;
  gate: boolean;
  questions: Question[];
};

export const TRAIL = {
  slug: "sql-injection",
  title: "Injeção em SQL (Linguagem de Consulta Estruturada)",
  summary: "Entenda como um dado pode alterar uma consulta e como manter instrução e valor separados.",
};

export const UNITS: Unit[] = [
  {
    id: "banco",
    order: 1,
    title: "Do pedido à consulta",
    summary: "O caminho entre um formulário, o servidor e o banco de dados.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "executa",
        prompt: "Quando recebe uma consulta, em que o banco se baseia para agir?",
        choices: [
          {
            id: "intencao",
            label: "Na intenção de quem escreveu o código",
            explain: "A intenção não viaja até o banco. Ele só pode interpretar a consulta que recebeu.",
          },
          {
            id: "instrucao",
            label: "Na instrução contida na consulta recebida",
            correct: true,
            explain: "Exato. O banco interpreta a consulta recebida; por isso, a forma dessa instrução precisa permanecer sob controle do código.",
          },
          {
            id: "html",
            label: "No resultado que a página deveria mostrar",
            explain: "O resultado esperado orienta o desenvolvimento, mas o banco age a partir da consulta enviada pelo servidor.",
          },
        ],
      },
      {
        kind: "choice",
        id: "orm",
        prompt: "Usar um ORM torna segura qualquer consulta, mesmo quando o código concatena o valor ao texto?",
        choices: [
          {
            id: "falso",
            label: "Não. A segurança depende de usar o método que mantém o valor separado",
            correct: true,
            explain: "Correto. Um ORM ajuda a construir consultas, mas uma consulta manual concatenada pode recriar a mistura entre dado e instrução.",
          },
          {
            id: "verdadeiro",
            label: "Sim. A presença do ORM protege toda consulta automaticamente",
            explain: "A ferramenta não corrige texto SQL montado manualmente. É preciso usar seus recursos de parâmetros ou equivalentes seguros.",
          },
        ],
      },
      {
        kind: "choice",
        id: "papel",
        prompt: "Por que enviar um valor separado do texto da consulta é importante?",
        choices: [
          {
            id: "enfeite",
            label: "Porque reduz o tamanho do código",
            explain: "O código pode até ficar menor, mas esse não é o ganho de segurança. O ganho é preservar o papel do valor.",
          },
          {
            id: "separa",
            label: "Porque mantém o valor como dado, sem deixá-lo definir a instrução",
            correct: true,
            explain: "Isso preserva a regra central da trilha: dados podem variar, mas não devem reescrever a forma da consulta.",
          },
          {
            id: "esconde",
            label: "Porque impede que o servidor conheça o valor",
            explain: "O servidor e o banco ainda precisam receber o valor para fazer a busca. Separar não significa esconder; significa atribuir papéis distintos.",
          },
        ],
      },
    ],
  },
  {
    id: "encontro",
    order: 2,
    title: "Onde a entrada encontra o SQL",
    summary: "Compare duas formas de montar a mesma busca.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "linha",
        prompt: "Em qual linha o valor de email passa a fazer parte do texto da instrução?",
        choices: [
          {
            id: "leitura",
            label: "const email = body.email",
            explain: "Essa linha apenas lê a entrada e guarda o valor em uma variável. Ainda não existe uma consulta.",
          },
          {
            id: "cola",
            label: "Na chamada que junta o texto SQL, o email e as aspas com +",
            correct: true,
            explain: "É nessa concatenação que um valor variável entra no mesmo texto que define a instrução SQL.",
          },
          {
            id: "placeholder",
            label: "Na chamada que usa ? e envia [email] separadamente",
            explain: "Nessa versão, ? marca o lugar do parâmetro e [email] leva o valor à parte; a forma da instrução continua fixa.",
          },
        ],
      },
      {
        kind: "choice",
        id: "sintoma",
        prompt: "Qual regra a concatenação deixa de garantir?",
        choices: [
          {
            id: "layout",
            label: "Que toda busca devolve pelo menos uma linha",
            explain: "Uma busca legítima pode não encontrar nada. A regra de segurança é sobre o papel da entrada, não sobre a quantidade de resultados.",
          },
          {
            id: "invariante",
            label: "Que a entrada continua sendo apenas um dado",
            correct: true,
            explain: "Correto. Misturado ao texto SQL, o valor pode influenciar como o banco interpreta a instrução.",
          },
          {
            id: "senha",
            label: "Que todo email pertence a uma conta cadastrada",
            explain: "A existência da conta é uma regra de negócio. A regra quebrada aqui é a separação entre valor e instrução.",
          },
        ],
      },
      {
        kind: "choice",
        id: "igual",
        prompt: "As versões concatenada e parametrizada tentam realizar a mesma tarefa de negócio?",
        choices: [
          {
            id: "sim",
            label: "Sim. Ambas buscam pelo email; só a parametrizada impede que o valor molde a instrução",
            correct: true,
            explain: "A defesa não remove a busca nem fixa o email. Ela mantém a consulta estável enquanto o valor continua variável.",
          },
          {
            id: "nao",
            label: "Não. Usar um parâmetro muda a tabela consultada",
            explain: "Tabela e filtro permanecem os mesmos. O que muda é a forma segura de entregar o valor ao banco.",
          },
        ],
      },
    ],
  },
  {
    id: "invariante",
    order: 3,
    title: "Como o banco lê a consulta",
    summary: "Construa o modelo mental por trás da falha e da correção.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "leitor",
        prompt: "Quem determina o papel de cada trecho da consulta recebida?",
        choices: [
          {
            id: "usuario",
            label: "A pessoa que preencheu o formulário, por sua intenção",
            explain: "O banco não recebe essa intenção. Ele interpreta a estrutura da consulta enviada pelo servidor.",
          },
          {
            id: "parser",
            label: "O analisador do banco, conforme a estrutura da consulta",
            correct: true,
            explain: "O analisador identifica instruções e valores pela estrutura recebida. Se o texto foi montado de forma insegura, ele não conhece a intenção original.",
          },
          {
            id: "navegador",
            label: "O navegador, ao enviar o formulário",
            explain: "O navegador transporta a entrada. A interpretação da consulta acontece no banco depois que o servidor a constrói.",
          },
        ],
      },
      {
        kind: "choice",
        id: "por que",
        prompt: "Por que bloquear alguns caracteres e continuar concatenando é uma defesa frágil?",
        choices: [
          {
            id: "lento",
            label: "Porque parâmetros sempre tornam a consulta mais rápida",
            explain: "Desempenho não resolve este problema. A questão é impedir que a entrada participe da estrutura da instrução.",
          },
          {
            id: "papel",
            label: "Porque o valor ainda ocupa o mesmo texto da instrução e a correção depende de prever todas as formas perigosas",
            correct: true,
            explain: "Separar estruturalmente é mais forte do que tentar adivinhar cada conteúdo problemático: o valor deixa de definir a gramática da consulta.",
          },
          {
            id: "orm",
            label: "Porque toda validação exige abandonar o ORM",
            explain: "ORM e validação podem continuar existindo. O requisito é usar parâmetros ou o método seguro equivalente.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fixo",
        prompt: "Em uma consulta parametrizada, o que permanece fixo?",
        choices: [
          {
            id: "valor",
            label: "O valor pesquisado",
            explain: "O valor continua mudando a cada operação. Isso é necessário para a busca funcionar.",
          },
          {
            id: "forma",
            label: "A forma da instrução; o valor é enviado separadamente",
            correct: true,
            explain: "Essa é a decisão prática: manter fixa a estrutura SQL e variar somente os parâmetros.",
          },
        ],
      },
    ],
  },
  {
    id: "sintomas",
    order: 4,
    title: "Dos sintomas à hipótese",
    summary: "Use evidências do ambiente autorizado sem confundir sinal com prova.",
    kind: "exercise",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "caso-erro",
        prompt: "No lab, só uma busca provoca erro e o registro técnico aponta falha ao interpretar a consulta. Qual hipótese merece investigação?",
        choices: [
          {
            id: "css",
            label: "O erro confirma sozinho que existe SQL Injection",
            explain: "Não confirma. Um erro é apenas um sintoma; a hipótese precisa da ligação com a entrada, do registro técnico e da revisão da consulta.",
          },
          {
            id: "frase",
            label: "A entrada pode ter alterado a estrutura da consulta montada",
            correct: true,
            explain: "O vínculo entre uma entrada específica e a interpretação SQL sustenta essa hipótese. Ainda é preciso localizar a montagem da consulta no código.",
          },
          {
            id: "senha",
            label: "O banco sempre rejeita consultas que não retornam linhas",
            explain: "Uma consulta válida pode retornar zero linhas sem erro. A evidência descrita aponta para a interpretação da estrutura SQL.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso-lista",
        prompt: "A inspeção simulada mostra um pedido de Bruno na lista que deveria conter apenas pedidos de Alice. O que esse contraste indica?",
        choices: [
          {
            id: "filtro",
            label: "O resultado não respeitou o limite prometido pelo filtro por email",
            correct: true,
            explain: "A decisão prática é verificar como o email entrou na consulta: o resultado mais amplo indica que o filtro efetivo não correspondeu ao filtro esperado.",
          },
          {
            id: "cache",
            label: "Toda lista com duas pessoas prova que o banco está corrompido",
            explain: "O dado pode estar correto no banco e ainda assim ter sido selecionado pela consulta errada. O problema observado é o recorte devolvido.",
          },
          {
            id: "alice",
            label: "A busca por email deveria devolver todos os pedidos",
            explain: "Isso contradiz o requisito do cenário: cada pessoa deve ver apenas seus próprios pedidos.",
          },
        ],
      },
      {
        kind: "choice",
        id: "caso-generico",
        prompt: "Se o lab mostra apenas um erro 500 genérico, o que falta antes de atribuí-lo a SQL Injection?",
        choices: [
          {
            id: "evidencia",
            label: "Uma ligação observável entre a entrada, a consulta montada e o comportamento",
            correct: true,
            explain: "Diagnóstico exige evidência. Compare entradas autorizadas, consulte registros técnicos e revise o ponto que monta a consulta antes de concluir.",
          },
          {
            id: "nome",
            label: "Repetir entradas aleatórias até o erro mudar",
            explain: "Tentativas sem hipótese não explicam a causa. Neste curso, a investigação fica no lab e parte de evidências e revisão do código.",
          },
        ],
      },
    ],
  },
  {
    id: "tipos",
    order: 5,
    title: "Três formas de observar o efeito",
    summary: "Direta, cega e de segunda ordem descrevem evidências diferentes do mesmo erro de fronteira.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "cega",
        prompt: "O que distingue a forma cega da forma direta?",
        choices: [
          {
            id: "defesa",
            label: "Ela exige uma defesa principal diferente",
            explain: "A evidência muda, mas a defesa central continua igual: instrução fixa e valores separados.",
          },
          {
            id: "sintoma",
            label: "O dado não aparece diretamente; a conclusão depende de diferenças de comportamento",
            correct: true,
            explain: "Na forma direta, a resposta revela o resultado indevido. Na cega, erros ou respostas diferentes funcionam apenas como sinais indiretos.",
          },
          {
            id: "banco",
            label: "O banco deixa de receber uma consulta",
            explain: "Ainda há uma consulta. O termo descreve o que a aplicação revela a quem observa, não a ausência de execução.",
          },
        ],
      },
      {
        kind: "choice",
        id: "segunda",
        prompt: "Em que ponto surge a falha de segunda ordem?",
        choices: [
          {
            id: "tela",
            label: "No simples ato de armazenar qualquer texto",
            explain: "Armazenar texto como dado é normal. A falha aparece quando outra operação o insere na estrutura de uma consulta.",
          },
          {
            id: "depois",
            label: "Na consulta posterior que concatena um valor antes armazenado como dado",
            correct: true,
            explain: "A origem do valor pode parecer confiável porque é o próprio banco, mas seu papel continua sendo dado e ele ainda precisa ser parametrizado.",
          },
          {
            id: "css",
            label: "Quando o valor armazenado é exibido sem formatação",
            explain: "Exibição e montagem de SQL são operações diferentes. Segunda ordem, aqui, depende de uma consulta posterior insegura.",
          },
        ],
      },
      {
        kind: "choice",
        id: "nome",
        prompt: "Identificar se o caso é direto, cego ou de segunda ordem muda a defesa central?",
        choices: [
          {
            id: "nao",
            label: "Não. Em todos os casos, cada consulta deve manter valores fora da estrutura da instrução",
            correct: true,
            explain: "Os nomes ajudam a descrever o momento e a evidência. A decisão de implementação continua sendo parametrizar cada consulta.",
          },
          {
            id: "sim",
            label: "Sim. Só a forma direta precisa de parâmetros",
            explain: "Toda forma nasce da mesma mistura de papéis. Resposta indireta ou valor armazenado não tornam a concatenação segura.",
          },
        ],
      },
    ],
  },
  {
    id: "lab-ofensivo",
    order: 6,
    title: "Laboratório: inspecionar o problema",
    summary: "Leia uma simulação controlada e conecte sintoma, código e hipótese.",
    kind: "lab",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "sintoma",
        prompt: "Na simulação, qual observação contradiz o requisito da listagem?",
        choices: [
          {
            id: "filtro",
            label: "A lista de Alice inclui um pedido atribuído a Bruno",
            correct: true,
            explain: "Esse contraste mostra que o recorte efetivo ficou mais amplo que o requisito. A simulação aponta a concatenação como causa a revisar.",
          },
          {
            id: "senha",
            label: "A lista de Alice contém dois sabores diferentes",
            explain: "Quantidade ou variedade não indicam falha. O dado decisivo é aparecer um pedido pertencente a outra pessoa.",
          },
          {
            id: "rede",
            label: "A página mostra o endereço de email de Alice",
            explain: "Nesse cenário, o email identifica a sessão fictícia. O problema observado é o pedido de Bruno atravessar o filtro.",
          },
        ],
      },
      {
        kind: "choice",
        id: "onde",
        prompt: "Segundo a inspeção estrutural apresentada, quais pontos precisam de correção?",
        choices: [
          {
            id: "as-duas",
            label: "findUser e listOrders, porque ambas concatenam email no texto SQL",
            correct: true,
            explain: "Corrigir apenas o sintoma visível deixaria a mesma fronteira quebrada no outro ponto. As duas consultas precisam parametrizar o valor.",
          },
          {
            id: "css",
            label: "Somente o componente que desenha a lista",
            explain: "A interface exibe o resultado recebido. A inspeção localizou o problema antes dela, na montagem das duas consultas.",
          },
          {
            id: "uma",
            label: "Somente listOrders, porque foi onde a simulação mostrou o sintoma",
            explain: "Um sintoma visível não torna a outra concatenação segura. findUser repete o mesmo padrão estrutural.",
          },
        ],
      },
      {
        kind: "choice",
        id: "depois",
        prompt: "Qual é a próxima decisão segura nesta trilha?",
        choices: [
          {
            id: "fechar",
            label: "Parametrizar as duas consultas no laboratório defensivo e submeter à inspeção",
            correct: true,
            explain: "A prática autorizada continua no ambiente da trilha. O editor verificará a separação estrutural, não executará o código enviado.",
          },
          {
            id: "outro",
            label: "Experimentar a mesma técnica em aplicações de terceiros",
            explain: "Não. Conhecimento de segurança só deve ser praticado em ambiente próprio ou explicitamente autorizado; aqui, use apenas a Pizzaria do Lab.",
          },
        ],
      },
    ],
  },
  {
    id: "debrief",
    order: 7,
    title: "Reconstruindo o que aconteceu",
    summary: "Explique a falha pelo caminho dos dados, sem atribuir intenção ao banco.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "obedeceu",
        prompt: "Se a concatenação altera a estrutura da consulta, o que o banco interpreta?",
        choices: [
          {
            id: "recusou",
            label: "A consulta que o programador pretendia enviar",
            explain: "O banco não conhece essa intenção. Seu analisador recebe apenas a estrutura final produzida pelo servidor.",
          },
          {
            id: "obedeceu",
            label: "A instrução presente na consulta final que recebeu",
            correct: true,
            explain: "Essa é a causa mecânica: ao misturar entrada e SQL, o servidor pode produzir uma instrução diferente, e é essa estrutura que o banco analisa.",
          },
          {
            id: "avisou",
            label: "Somente o valor original do campo, ignorando o restante",
            explain: "Sem parametrização, não existe um canal separado que identifique todo o campo como valor. O banco interpreta o texto final como uma única consulta.",
          },
        ],
      },
      {
        kind: "text",
        id: "explica",
        prompt: "Em duas ou três frases, explique onde a fronteira quebrou e por que o banco interpretou uma instrução diferente.",
        min: 40,
        stems: ["instru", "comando", "frase", "consulta"],
        explain: "Uma boa síntese liga causa e efeito: o servidor concatenou uma entrada ao texto da consulta; isso permitiu mudar sua estrutura; o banco interpretou a instrução final recebida, não a intenção original.",
      },
    ],
  },
  {
    id: "defesas",
    order: 8,
    title: "Defesa principal e camadas de redução",
    summary: "Parametrize consultas e diferencie a correção principal das camadas de redução.",
    kind: "theory",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "principal",
        prompt: "Qual mudança corrige diretamente a mistura entre entrada e instrução?",
        choices: [
          {
            id: "waf",
            label: "Manter a concatenação e depender do WAF para reconhecer toda entrada perigosa",
            explain: "Um WAF pode bloquear alguns pedidos, mas não muda o código que mistura os papéis. A consulta continua estruturalmente vulnerável.",
          },
          {
            id: "param",
            label: "Manter o SQL fixo e enviar cada valor como parâmetro separado",
            correct: true,
            explain: "Essa mudança atua na causa: a entrada deixa de participar da estrutura que o banco interpreta como instrução.",
          },
          {
            id: "esconder",
            label: "Ocultar detalhes de erro e manter a montagem da consulta",
            explain: "Ocultar detalhes reduz informação exposta, mas não impede resultados indevidos nem altera a consulta vulnerável.",
          },
        ],
      },
      {
        kind: "choice",
        id: "privilegio",
        prompt: "Qual é o papel de uma conta de banco com menor privilégio?",
        choices: [
          {
            id: "substituir",
            label: "Substituir a parametrização, pois uma conta limitada torna a concatenação segura",
            explain: "Limitar permissões reduz impacto, mas a consulta ainda pode retornar ou alterar dados que essa conta está autorizada a acessar.",
          },
          {
            id: "limitar",
            label: "Reduzir o alcance de uma falha sem substituir a consulta parametrizada",
            correct: true,
            explain: "Defesa em camadas: parâmetros evitam a mistura; menor privilégio limita o dano caso outra barreira falhe.",
          },
        ],
      },
      {
        kind: "choice",
        id: "validar",
        prompt: "Validar se a entrada tem formato de email é uma correção completa para SQL Injection?",
        choices: [
          {
            id: "nao",
            label: "Não. A validação apoia a regra de negócio, mas o valor ainda deve ser parametrizado",
            correct: true,
            explain: "Validação decide quais valores fazem sentido para a aplicação. Parametrização decide que esses valores nunca serão interpretados como SQL.",
          },
          {
            id: "sim",
            label: "Sim. Depois da validação, concatenar o valor ao SQL é seguro",
            explain: "A validação pode mudar ou ser contornada em outro fluxo. A fronteira robusta não depende do conteúdo: ela separa valor e instrução.",
          },
        ],
      },
    ],
  },
  {
    id: "lab-defensivo",
    order: 9,
    title: "Laboratório: reparar as consultas",
    summary: "Mantenha a tarefa de negócio e separe o email da estrutura SQL.",
    kind: "lab",
    gate: true,
    questions: [],
  },
  {
    id: "checkpoint",
    order: 10,
    title: "Checkpoint",
    summary: "Conecte causa, interpretação, defesa e conclusão prática.",
    kind: "checkpoint",
    gate: true,
    questions: [
      {
        kind: "choice",
        id: "quebra",
        prompt: "Em uma consulta concatenada, qual propriedade de segurança deixa de ser garantida?",
        choices: [
          {
            id: "fronteira",
            label: "A entrada permanece dado e não define a estrutura da instrução",
            correct: true,
            explain: "Essa é a invariante central. Quando ela falha, o texto controlado pela entrada pode mudar a consulta interpretada.",
          },
          {
            id: "https",
            label: "Toda busca precisa retornar exatamente uma linha",
            explain: "A quantidade correta depende da regra de negócio. SQL Injection trata da mistura entre a estrutura SQL e os valores recebidos.",
          },
        ],
      },
      {
        kind: "choice",
        id: "banco",
        prompt: "Por que a intenção original do programador não protege uma consulta concatenada?",
        choices: [
          {
            id: "executa",
            label: "Porque o banco interpreta a consulta final recebida, não a intenção que a originou",
            correct: true,
            explain: "O servidor é responsável por produzir uma estrutura segura. O banco não tem informação separada para reconstruir o plano original.",
          },
          {
            id: "pergunta",
            label: "Porque o banco sempre transforma valores em instruções, mesmo com parâmetros",
            explain: "Parâmetros existem justamente para preservar os valores como dados. O problema surge quando o código os mistura ao texto SQL.",
          },
        ],
      },
      {
        kind: "choice",
        id: "fecha",
        prompt: "Qual revisão de código oferece a evidência mais forte de correção?",
        choices: [
          {
            id: "separa",
            label: "A instrução ficou fixa e cada entrada é passada pelo método como parâmetro",
            correct: true,
            explain: "Essa revisão verifica a causa estrutural. Testes comportamentais reais podem complementar a evidência, mas não substituem a separação no código.",
          },
          {
            id: "waf",
            label: "A mensagem de erro sumiu depois que um filtro de rede foi ligado",
            explain: "Ausência de erro não prova que a consulta está segura. O filtro pode apenas esconder um sintoma ou não cobrir outros fluxos.",
          },
        ],
      },
      {
        kind: "choice",
        id: "selo",
        prompt: "O que ainda é necessário para concluir esta trilha após o checkpoint?",
        choices: [
          {
            id: "nao",
            label: "Aprovar no laboratório defensivo a inspeção estrutural das duas consultas",
            correct: true,
            explain: "O checkpoint confirma o modelo mental. O gate prático exige que findUser e listOrders mantenham o email fora do texto SQL.",
          },
          {
            id: "sim",
            label: "Nada: respostas teóricas substituem a correção no editor",
            explain: "A trilha exige uma decisão aplicada. A inspeção do editor precisa reconhecer parâmetros nas duas funções antes do selo.",
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
