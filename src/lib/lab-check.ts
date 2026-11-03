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
    name: "findUser: formato com ? reconhecido",
    state: "pass",
    detail: "O formato com ? está certo em findUser. O login não foi executado (é só uma leitura do texto).",
  },
  {
    id: "senha",
    name: "Recusa de senha incorreta",
    state: "skip",
    detail: "Não executado neste exercício. Isso exigiria um teste de verdade da aplicação.",
  },
  {
    id: "lista",
    name: "listOrders: formato com ? reconhecido",
    state: "pass",
    detail: "O formato com ? está certo em listOrders. A consulta não foi executada no banco (é só uma leitura do texto).",
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
        `${name}: o email ainda está colado dentro do texto da consulta (com + ou interpolação). Troque por ? e passe o email à parte.`,
      );
      break;
    }
    if (!expected.test(body)) {
      problems.push(
        `${name}: mantenha a mesma busca e passe o email separado, neste formato: ${example}.`,
      );
      break;
    }
  }

  const frontier: LabTest = {
    id: "fronteira",
    name: "Valor separado da instrução nas duas funções",
    state: problems.length === 0 ? "pass" : "fail",
    detail:
      problems[0] ??
      "Tudo certo: as duas funções usam instrução fixa e enviam o email separado.",
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
              "Ainda não avaliado: corrija primeiro o erro indicado acima.",
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
