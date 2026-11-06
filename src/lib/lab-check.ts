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

const BEHAVIOR_RESULTS: LabTest[] = [
  {
    id: "login",
    name: "Login válido continua funcionando",
    state: "pass",
    detail: "Alice ainda é localizada quando o email correto é enviado como valor separado.",
  },
  {
    id: "senha",
    name: "Senha incorreta continua recusada",
    state: "pass",
    detail: "A correção da consulta não alterou a verificação de senha do cenário.",
  },
  {
    id: "lista",
    name: "Pedidos continuam filtrados por email",
    state: "pass",
    detail: "A consulta parametrizada mantém a listagem normal de Alice funcionando.",
  },
  {
    id: "reteste",
    name: "O mesmo payload não vaza o pedido de Bruno",
    state: "pass",
    detail: "O texto extra agora ocupa somente a vaga de email e não muda a instrução SQL.",
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
      ? [frontier, ...BEHAVIOR_RESULTS]
      : [
          frontier,
          ...BEHAVIOR_RESULTS.map((test) => ({
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
