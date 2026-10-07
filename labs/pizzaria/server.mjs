import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const fixture = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "fixture.json"), "utf8"),
);
const sessions = new Map();
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "127.0.0.1";

function sameSecret(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function cookie(request) {
  const header = request.headers.cookie ?? "";
  const pair = header.split(";").find((part) => part.trim().startsWith("lab="));
  return pair ? pair.split("=").slice(1).join("=").trim() : "";
}

function send(response, status, body, extra = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  response.writeHead(status, {
    "content-type": typeof body === "string" ? "text/html; charset=utf-8" : "application/json",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extra,
  });
  response.end(payload);
}

const page = `<!doctype html>
<meta charset="utf-8">
<title>Pizzaria do Lab</title>
<style>
  body { font-family: sans-serif; background: #07080d; color: #f4f1ea; margin: 40px auto; max-width: 420px; }
  input, button { font: inherit; }
  input { display: block; width: 100%; margin: 8px 0 16px; padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,.15); background: #12141c; color: inherit; }
  button { background: #d6ff4a; color: #07080d; border: 0; border-radius: 999px; padding: 10px 16px; font-weight: 700; }
  li { list-style: none; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 10px 12px; margin-top: 8px; }
</style>
<h1>Pizzaria do Lab</h1>
<p>Contas fictícias. Este app não sai da sua máquina.</p>
<form id="login">
  <label>E-mail <input name="email" type="email" value="alice@lab.local" required></label>
  <label>Senha do lab <input name="password" type="password" required></label>
  <button>Entrar</button>
</form>
<p id="msg"></p>
<ul id="orders"></ul>
<script>
  const msg = document.querySelector("#msg");
  const orders = document.querySelector("#orders");
  document.querySelector("#login").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const response = await fetch("/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    if (!response.ok) { msg.textContent = "E-mail ou senha do lab não conferem."; orders.innerHTML = ""; return; }
    const user = await response.json();
    msg.textContent = user.name + " entrou.";
    const list = await fetch("/pedidos");
    const items = await list.json();
    orders.innerHTML = items.orders.map((item) => "<li>" + item + "</li>").join("");
  });
</script>`;

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}`);
  if (request.method === "GET" && url.pathname === "/health") {
    return send(response, 200, { ok: true });
  }
  if (request.method === "GET" && url.pathname === "/") {
    return send(response, 200, page);
  }
  if (request.method === "POST" && url.pathname === "/login") {
    let body = {};
    try {
      body = await readBody(request);
    } catch {
      return send(response, 400, { error: "json" });
    }
    const user = fixture.users.find((item) => item.email === body.email);
    if (!user || typeof body.password !== "string" || !sameSecret(body.password, user.password)) {
      return send(response, 401, { error: "credenciais" });
    }
    const token = randomBytes(24).toString("base64url");
    sessions.set(token, user.email);
    return send(response, 200, { name: user.name }, {
      "set-cookie": `lab=${token}; HttpOnly; SameSite=Lax; Path=/`,
    });
  }
  if (request.method === "GET" && url.pathname === "/pedidos") {
    const email = sessions.get(cookie(request));
    const user = fixture.users.find((item) => item.email === email);
    if (!user) return send(response, 401, { error: "sessao" });
    return send(response, 200, { orders: user.orders });
  }
  send(response, 404, { error: "nao-encontrado" });
});

server.listen(port, host);