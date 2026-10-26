export const VULNERABLE_QUERIES = `function findUser(db, email) {
  return db.query("SELECT id, name FROM usuarios WHERE email = '" + email + "'");
}

function listOrders(db, email) {
  return db.query("SELECT id, item FROM pedidos WHERE email = '" + email + "'");
}
`;

export type LabTest = {
  id: string;
  name: string;
  state: "pass" | "fail" | "skip";
  detail: string;
};

const STRUCTURAL_RESULTS: LabTest[] = [
  {
    id: "login",
    name: "Estrutura reconhecida em findUser",
    state: "pass",
    detail: "A inspeção textual encontrou a forma parametrizada esperada em findUser; o login não foi executado.",
  },
  {
    id: "senha",
    name: "Recusa de senha incorreta",
    state: "skip",
    detail: "Não executada neste exercício. Esse comportamento exigiria um teste real da aplicação.",
  },
  {
    id: "lista",
    name: "Estrutura reconhecida em listOrders",
    state: "pass",
    detail: "A inspeção textual encontrou a forma parametrizada esperada em listOrders; a consulta não foi executada no banco.",
  },
];

const FIND_USER_QUERY = /^\s*function\s+findUser\s*\(\s*db\s*,\s*email\s*\)\s*\{\s*return\s+db\.query\(\s*["'`]SELECT\s+id\s*,\s*name\s+FROM\s+usuarios\s+WHERE\s+email\s*=\s*\?["'`]\s*,\s*(?:\[\s*email\s*\]|email)\s*\)\s*;?\s*\}\s*$/i;
const LIST_ORDERS_QUERY = /^\s*function\s+listOrders\s*\(\s*db\s*,\s*email\s*\)\s*\{\s*return\s+db\.query\(\s*["'`]SELECT\s+id\s*,\s*item\s+FROM\s+pedidos\s+WHERE\s+email\s*=\s*\?["'`]\s*,\s*(?:\[\s*email\s*\]|email)\s*\)\s*;?\s*\}\s*$/i;

export function reviewQueries(source: string) {
  const problems: string[] = [];
  if (source.length > 4000) {
    problems.push("O arquivo passou do limite de 4.000 caracteres deste exercício.");
  }
  if (!source.includes("function findUser") || !source.includes("function listOrders")) {
    problems.push(
      "Preserve as duas declarações reconhecidas pela inspeção: function findUser e function listOrders.",
    );
  }

  const listAt = source.indexOf("function listOrders");
  const functions = [
    {
      name: "findUser",
      body: listAt >= 0 ? source.slice(0, listAt) : source,
      expected: FIND_USER_QUERY,
      example: 'db.query("SELECT id, name FROM usuarios WHERE email = ?", [email])',
    },
    {
      name: "listOrders",
      body: listAt >= 0 ? source.slice(listAt) : "",
      expected: LIST_ORDERS_QUERY,
      example: 'db.query("SELECT id, item FROM pedidos WHERE email = ?", [email])',
    },
  ];

  for (const { name, body, expected, example } of functions) {
    if (!body) continue;
    if (mixesValue(body)) {
      problems.push(
        `${name}: a inspeção ainda encontrou email concatenado ou interpolado no texto da consulta.`,
      );
      break;
    }
    if (!expected.test(body)) {
      problems.push(
        `${name}: preserve a busca do exercício e passe email separadamente neste formato: ${example}.`,
      );
      break;
    }
  }

  const frontier: LabTest = {
    id: "fronteira",
    name: "Separação estrutural nas duas funções",
    state: problems.length === 0 ? "pass" : "fail",
    detail:
      problems[0] ??
      "A inspeção textual reconheceu instrução fixa e email separado em findUser e listOrders.",
  };

  const tests =
    problems.length === 0
      ? [frontier, ...STRUCTURAL_RESULTS]
      : [
          frontier,
          ...STRUCTURAL_RESULTS.map((test) => ({
            ...test,
            state: "skip" as const,
            detail:
              "Ainda não avaliado: corrija primeiro o problema indicado na separação estrutural.",
          })),
        ];

  return { ok: problems.length === 0, problems, tests };
}

function mixesValue(body: string) {
  return (
    /\+\s*email\b/.test(body) ||
    /\bemail\s*\+/.test(body) ||
    /\$\{\s*email\s*\}/.test(body)
  );
}
