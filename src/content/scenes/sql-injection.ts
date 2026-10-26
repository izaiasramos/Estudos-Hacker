import type { SceneCatalog } from "./types";

export const sqlInjectionScenes = {
  "sql-injection:banco": {
    id: "sql-banco-fluxo",
    type: "flow",
    eyebrow: "Caminho do pedido",
    title: "Quem transforma o clique em consulta?",
    accessibleSummary:
      "Um formulário envia um valor ao servidor; o servidor monta uma consulta com instrução fixa e valor separado; o banco interpreta a consulta e devolve o resultado.",
    caption: "O servidor preserva o papel de cada parte: a instrução define a busca e a entrada continua sendo dado.",
    tone: "neutral",
    steps: [
      { id: "formulario", label: "Formulário", detail: "A pessoa informa um valor." },
      { id: "servidor", label: "Servidor", detail: "Monta a consulta e envia o valor separadamente." },
      { id: "banco", label: "Banco", detail: "Interpreta a consulta recebida e produz o resultado." },
    ],
  },
  "sql-injection:encontro": {
    id: "sql-encontro-comparacao",
    type: "compare",
    eyebrow: "Duas montagens",
    title: "Em qual lado o dado muda de papel?",
    accessibleSummary:
      "A comparação mostra que concatenar o email ao texto SQL mistura dado e instrução, enquanto usar um ponto de parâmetro e enviar o email à parte mantém a consulta fixa.",
    caption: "As duas versões buscam o mesmo email, mas só a parametrizada conserva a entrada como dado.",
    tone: "danger",
    sides: [
      {
        id: "concatenada",
        label: "Texto concatenado",
        description: "A fronteira desaparece no sinal de soma.",
        items: ["SQL + email + aspas", "A entrada entra no texto da instrução"],
      },
      {
        id: "parametrizada",
        label: "Consulta parametrizada",
        description: "A estrutura permanece sob controle do código.",
        items: ["SQL fixo com ?", "email enviado separadamente em [email]"],
      },
    ],
  },
  "sql-injection:invariante": {
    id: "sql-invariante-fronteira",
    type: "boundary",
    eyebrow: "Fronteira de leitura",
    title: "O analisador enxerga intenção?",
    accessibleSummary:
      "O analisador do banco recebe uma estrutura de consulta e distingue instruções de valores pela forma enviada; a parametrização mantém o texto SQL na zona de instrução e a entrada na zona de dado.",
    caption: "A invariante é estrutural: qualquer entrada permanece valor, independentemente de seu conteúdo.",
    tone: "accent",
    zones: [
      {
        id: "instrucao",
        label: "Estrutura da instrução",
        description: "Parte fixa que o analisador lê como SQL.",
        items: ["Operação", "Tabela", "Lugar do parâmetro"],
      },
      {
        id: "dado",
        label: "Valores separados",
        description: "Parte variável que não define a gramática.",
        items: ["Entrada do formulário", "Valor antes armazenado"],
      },
    ],
  },
  "sql-injection:sintomas": {
    id: "sql-sintomas-sequencia",
    type: "sequence",
    eyebrow: "Trilha de evidências",
    title: "Quando um sinal vira hipótese?",
    accessibleSummary:
      "A investigação autorizada começa por um comportamento divergente, relaciona-o a uma entrada específica, consulta os registros técnicos e revisa a montagem da consulta antes de concluir que há SQL Injection.",
    caption: "Erro, resposta ampla ou código 500 são sinais; a ligação entre entrada, consulta e resultado sustenta a conclusão.",
    tone: "danger",
    events: [
      { id: "sinal", marker: "1", label: "Observar", detail: "Registrar o resultado que contradiz o esperado." },
      { id: "entrada", marker: "2", label: "Correlacionar", detail: "Identificar qual entrada acompanha o sintoma." },
      { id: "registro", marker: "3", label: "Conferir", detail: "Buscar no ambiente autorizado o registro técnico relacionado." },
      { id: "codigo", marker: "4", label: "Revisar", detail: "Localizar como a consulta foi montada." },
    ],
  },
  "sql-injection:tipos": {
    id: "sql-tipos-comparacao",
    type: "compare",
    eyebrow: "Formas de observar",
    title: "O efeito aparece agora, depois ou por pistas?",
    accessibleSummary:
      "Na forma direta, a resposta exibe o resultado indevido; na forma cega, diferenças de comportamento funcionam como pistas; na segunda ordem, um dado armazenado altera uma consulta posterior que o concatena.",
    caption: "A evidência muda entre as três formas, mas a correção continua sendo separar valores da instrução.",
    tone: "danger",
    sides: [
      {
        id: "direta",
        label: "Direta",
        description: "O efeito fica visível na resposta atual.",
        items: ["Resultado indevido aparece", "Observação imediata"],
      },
      {
        id: "cega",
        label: "Cega",
        description: "A resposta não mostra o dado diretamente.",
        items: ["Erro ou comportamento diferente", "Conclusão por sinais"],
      },
      {
        id: "segunda-ordem",
        label: "Segunda ordem",
        description: "O valor reaparece em outra operação.",
        items: ["Dado é armazenado", "Consulta posterior o concatena"],
      },
    ],
  },
  "sql-injection:lab-ofensivo": {
    id: "sql-lab-ofensivo-inspecao",
    type: "decision",
    eyebrow: "Inspeção simulada",
    title: "Qual evidência merece revisão?",
    accessibleSummary:
      "A cena representa uma decisão de inspeção no laboratório fictício: diante de um pedido de Bruno na lista de Alice, é preciso relacionar o resultado ao requisito e revisar findUser e listOrders, sem executar ataques nem testar sistemas externos.",
    caption: "No lab, a escolha correta é inspecionar as duas concatenações dentro da simulação autorizada; a cena não executa código real.",
    tone: "danger",
    prompt: "A lista de Alice inclui um pedido de Bruno. O que a inspeção deve fazer?",
    options: [
      {
        id: "interface",
        label: "Alterar apenas a interface",
        outcome: "A lista muda de aparência, mas a origem do resultado não é explicada.",
      },
      {
        id: "uma-funcao",
        label: "Revisar somente listOrders",
        outcome: "O sintoma visível é tratado, mas findUser mantém a mesma concatenação.",
      },
      {
        id: "duas-funcoes",
        label: "Inspecionar findUser e listOrders",
        outcome: "Relaciona requisito, resultado e os dois pontos que concatenam email no SQL simulado.",
        recommended: true,
      },
    ],
  },
  "sql-injection:debrief": {
    id: "sql-debrief-causalidade",
    type: "flow",
    eyebrow: "Cadeia causal",
    title: "Onde a intenção se perdeu?",
    accessibleSummary:
      "Uma entrada chega ao servidor, é concatenada ao texto SQL, altera a estrutura da consulta final e então é interpretada pelo banco como parte da instrução recebida.",
    caption: "O banco não adivinha a intenção original: ele interpreta a estrutura final produzida pelo servidor.",
    tone: "danger",
    steps: [
      { id: "origem", label: "Entrada", detail: "Um valor variável chega à aplicação." },
      { id: "mistura", label: "Concatenação", detail: "O valor é incorporado ao texto SQL." },
      { id: "estrutura", label: "Consulta variável", detail: "A estrutura final já não é fixa." },
      { id: "efeito", label: "Interpretação", detail: "O banco analisa a instrução que recebeu." },
    ],
  },
  "sql-injection:defesas": {
    id: "sql-defesas-camadas",
    type: "boundary",
    eyebrow: "Papéis da defesa",
    title: "O que corrige e o que apenas limita?",
    accessibleSummary:
      "A consulta parametrizada corrige a mistura entre instrução e valor; validação aplica regras de negócio, enquanto menor privilégio, monitoramento e WAF reduzem risco ou impacto sem substituir parâmetros.",
    caption: "Primeiro corrija a fronteira com parâmetros; depois some camadas adequadas ao risco.",
    tone: "defense",
    zones: [
      {
        id: "correcao",
        label: "Correção da causa",
        description: "Impede que o valor defina a estrutura SQL.",
        items: ["Consulta parametrizada", "Método seguro do ORM"],
      },
      {
        id: "camadas",
        label: "Redução de risco",
        description: "Apoia a defesa sem tornar concatenação segura.",
        items: ["Validação de negócio", "Menor privilégio", "Monitoramento", "WAF"],
      },
    ],
  },
  "sql-injection:lab-defensivo": {
    id: "sql-lab-defensivo-checklist",
    type: "decision",
    eyebrow: "Checklist simulado",
    title: "Qual reparo preserva a busca?",
    accessibleSummary:
      "A cena representa a decisão inspecionada pelo checker do laboratório: manter o SQL fixo nas duas funções, usar o ponto de parâmetro e enviar email em uma lista separada; ela não executa consultas nem testa um banco real.",
    caption: "O checker faz uma inspeção textual limitada; a opção recomendada separa estrutura e valor nas duas consultas.",
    tone: "defense",
    prompt: "Qual versão deve ser submetida à inspeção simulada?",
    options: [
      {
        id: "filtro",
        label: "Concatenar depois de filtrar caracteres",
        outcome: "O email ainda ocupa o texto da instrução e a fronteira continua frágil.",
      },
      {
        id: "parcial",
        label: "Parametrizar apenas uma função",
        outcome: "Uma das duas consultas ainda mistura email e SQL.",
      },
      {
        id: "completa",
        label: "Parametrizar findUser e listOrders",
        outcome: "Mantém cada SQL fixo, usa ? e envia [email] separadamente.",
        recommended: true,
      },
    ],
  },
  "sql-injection:checkpoint": {
    id: "sql-checkpoint-decisao",
    type: "decision",
    eyebrow: "Síntese final",
    title: "Qual revisão fecha a hipótese?",
    accessibleSummary:
      "O checkpoint pede reconhecer que concatenação permite à entrada alterar a consulta, que o banco interpreta a estrutura final e que a evidência mais forte de correção é SQL fixo com cada valor enviado como parâmetro.",
    caption: "A conclusão correta conecta causa, interpretação e defesa: entrada é dado, não parte da instrução.",
    tone: "accent",
    prompt: "Qual achado demonstra a correção da causa estrutural?",
    options: [
      {
        id: "erro-oculto",
        label: "Os detalhes de erro foram ocultados",
        outcome: "Reduz informação exposta, mas não corrige a montagem da consulta.",
      },
      {
        id: "valor-separado",
        label: "O SQL ficou fixo e os valores foram separados",
        outcome: "Preserva a entrada como dado em todos os pontos revisados.",
        recommended: true,
      },
      {
        id: "privilegio",
        label: "A conta do banco perdeu alguns privilégios",
        outcome: "Limita possível impacto, mas não substitui a parametrização.",
      },
    ],
  },
} satisfies SceneCatalog;
