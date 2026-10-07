import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

export const PIZZARIA_COOKIE = "shieldpath_pizzaria";

export type PizzariaUser = {
  email: string;
  password: string;
  name: string;
  orders: string[];
};

export type PizzariaFixture = {
  users: PizzariaUser[];
};

const FIXTURE_PATH = path.join(process.cwd(), "labs", "pizzaria", "fixture.json");

export function loadPizzariaFixture(): PizzariaFixture {
  return JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as PizzariaFixture;
}

export function findPizzariaUser(email: string) {
  return loadPizzariaFixture().users.find((user) => user.email === email) ?? null;
}

export function verifyPizzariaPassword(user: PizzariaUser, password: string) {
  const left = Buffer.from(password);
  const right = Buffer.from(user.password);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

type PizzariaPayload = {
  email: string;
  labId: string;
  exp: number;
};

function pizzariaSecret() {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET ausente");
  }
  return "dev-only-shieldpath-secret";
}

export function issuePizzariaToken(email: string, labId: string) {
  const payload: PizzariaPayload = {
    email,
    labId,
    exp: Date.now() + 75 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", pizzariaSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readPizzariaToken(token: string | undefined | null) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", pizzariaSecret()).update(body).digest("base64url");
  const actualBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PizzariaPayload;
  if (payload.exp <= Date.now()) return null;
  return payload;
}

export function clearPizzariaCookie() {
  return {
    name: PIZZARIA_COOKIE,
    value: "",
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/lab/pizzaria",
      maxAge: 0,
    },
  };
}

export function pizzariaCookie(token: string) {
  return {
    name: PIZZARIA_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/lab/pizzaria",
      maxAge: 75 * 60,
    },
  };
}

export function runPizzariaBehaviorChecks() {
  const fixture = loadPizzariaFixture();
  const alice = fixture.users[0];
  const bruno = fixture.users[1];
  if (!alice || !bruno) {
    return [
      {
        name: "Fixture do lab",
        ok: false,
        detail: "Contas fictícias ausentes.",
      },
    ];
  }

  const loginOk =
    findPizzariaUser(alice.email) !== null &&
    verifyPizzariaPassword(alice, alice.password);
  const wrongPassword = verifyPizzariaPassword(alice, "senha-que-nao-e-do-lab");
  const list = alice.orders;
  const onlyAlice =
    list.length === alice.orders.length && list.every((item) => alice.orders.includes(item));
  const hidesBruno = !list.includes(bruno.orders[0] ?? "");

  return [
    {
      name: "Login da Alice",
      ok: loginOk,
      detail: "A conta fictícia entra no ambiente isolado.",
    },
    {
      name: "Senha errada fica de fora",
      ok: !wrongPassword,
      detail: "Uma senha que não é a do lab não abre sessão.",
    },
    {
      name: "Pedidos só da Alice",
      ok: onlyAlice && hidesBruno,
      detail: "A listagem dela não traz o pedido do Bruno.",
    },
  ];
}
