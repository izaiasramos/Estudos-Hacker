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

const BEHAVIOR: LabTest[] = [
  {
    id: "login",
    name: "Login da Alice com a senha do lab",
    state: "pass",
    detail: "A conta fictícia da Alice entra. A busca por email continua de pé.",
  },
  {
    id: "senha",
    name: "Senha errada não entra",
    state: "pass",
    detail: "Senha que não é a do lab continua recusada.",
  },
  {
    id: "lista",
    name: "Listagem da Alice sem o pedido do Bruno",
    state: "pass",
    detail: "A Alice vê as pizzas dela. O pedido do Bruno fica de fora.",
  },
];

export function reviewQueries(source: string) {
  const problems: string[] = [];
  if (source.length > 4000) {
    problems.push("O arquivo passou do tamanho deste lab.");
  }
  if (!source.includes("function findUser") || !source.includes("function listOrders")) {
    problems.push("As duas funções precisam continuar no arquivo: findUser e listOrders.");
  }

  const listAt = source.indexOf("function listOrders");
  const findBody = listAt >= 0 ? source.slice(0, listAt) : source;
  const listBody = listAt >= 0 ? source.slice(listAt) : "";
  for (const body of [findBody, listBody]) {
    if (!body) continue;
    if (mixesValue(body)) {
      problems.push("O email ainda entra no texto da consulta.");
      break;
    }
    if (!bindsValue(body)) {
      problems.push("O email precisa ir num argumento separado, com a instrução fixa.");
      break;
    }
  }

  const frontier: LabTest = {
    id: "fronteira",
    name: "Valor fora da frase",
    state: problems.length === 0 ? "pass" : "fail",
    detail:
      problems[0] ??
      "A instrução ficou fixa. O email viaja separado nas duas funções.",
  };

  const tests =
    problems.length === 0
      ? [frontier, ...BEHAVIOR]
      : [
          frontier,
          ...BEHAVIOR.map((test) => ({
            ...test,
            state: "skip" as const,
            detail: "Ainda não rodou. A consulta precisa deixar o valor fora da frase.",
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

function bindsValue(body: string) {
  const calls = body.match(/db\.query\([\s\S]*?\)/g) ?? [];
  return calls.some((call) => call.includes("?") && /\[\s*email\s*\]|,\s*email\s*\)/.test(call));
}
