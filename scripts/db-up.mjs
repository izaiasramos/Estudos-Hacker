// Roda antes de `npm run dev` e `npm run test:e2e` (scripts `predev` e `pretest:e2e`).
// Se o DATABASE_URL aponta para o Postgres do Compose (localhost), sobe o container e espera ele ficar pronto.
// Se aponta para outro lugar (Supabase, CI), não faz nada: o banco já existe fora desta máquina.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (!existsSync(".env")) return null;
  const line = readFileSync(".env", "utf8")
    .split("\n")
    .find((item) => item.trim().startsWith("DATABASE_URL="));
  return line ? line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "") : null;
}

const url = databaseUrl();
if (!url) {
  console.error("[db] DATABASE_URL ausente. Rode `cp .env.example .env` na raiz do repo.");
  process.exit(1);
}

let host;
try {
  host = new URL(url).hostname;
} catch {
  console.error("[db] DATABASE_URL inválida no .env.");
  process.exit(1);
}

if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
  console.log(`[db] Banco em ${host}. Nada para subir aqui.`);
  process.exit(0);
}

if (process.env.CI) {
  console.log("[db] CI: o Postgres vem do service do workflow.");
  process.exit(0);
}

const docker = spawnSync("docker", ["compose", "version"], { stdio: "ignore" });
if (docker.status !== 0) {
  console.error("[db] Docker Compose não respondeu. Abra o Docker e rode de novo (ver README: O que instalar).");
  process.exit(1);
}

console.log("[db] Subindo o Postgres do Compose e esperando ficar pronto…");
const up = spawnSync("docker", ["compose", "up", "-d", "--wait", "postgres"], { stdio: "inherit" });
if (up.status !== 0) {
  console.error("[db] O Postgres não subiu. Veja `docker compose logs postgres`. Porta 5432 ocupada é a causa mais comum.");
  process.exit(up.status ?? 1);
}
console.log("[db] Postgres pronto em localhost:5432.");
