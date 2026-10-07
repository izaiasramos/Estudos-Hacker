import { execFile, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:net";
import path from "node:path";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { one, many, run } from "@/lib/db";

const exec = promisify(execFile);
const TTL_MS = 75 * 60 * 1000;
const IMAGE = "shieldpath-pizzaria";
const NETWORK = "shieldpath-labs";
const LAB_DIR = path.join(process.cwd(), "labs", "pizzaria");

export type LabSession = {
  id: string;
  userId: string;
  runtime: "docker" | "process";
  containerId: string | null;
  pid: number | null;
  port: number | null;
  status: string;
  startedAt: string;
  expiresAt: string;
};

type Row = {
  id: string;
  user_id: string;
  runtime: string;
  container_id: string | null;
  pid: number | null;
  port: number | null;
  status: string;
  started_at: string;
  expires_at: string;
  last_check: string | null;
};

function mapSession(row: Row): LabSession {
  return {
    id: row.id,
    userId: row.user_id,
    runtime: row.runtime === "docker" ? "docker" : "process",
    containerId: row.container_id,
    pid: row.pid,
    port: row.port,
    status: row.status,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
  };
}

export async function activeLab(userId: string) {
  await sweepExpired();
  const row = await one<Row>(
    "SELECT * FROM lab_sessions WHERE user_id = ? AND status = 'running' ORDER BY started_at DESC LIMIT 1",
    [userId],
  );
  if (!row) return null;
  if (Date.parse(row.expires_at) <= Date.now()) {
    await stopSession(mapSession(row));
    return null;
  }
  return mapSession(row);
}

export function minutesLeft(session: LabSession) {
  return Math.max(1, Math.ceil((Date.parse(session.expiresAt) - Date.now()) / 60000));
}

export async function startLab(userId: string) {
  const current = await activeLab(userId);
  if (current) return current;
  const id = randomUUID();
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + TTL_MS);
  const docker = await startDocker(id).catch(() => null);
  const runtime = docker ?? (await startProcess());
  try {
    await waitForHealth(runtime.port);
  } catch (error) {
    await discardRuntime(runtime);
    throw error;
  }
  await run(
    `INSERT INTO lab_sessions (
      id, user_id, runtime, container_id, pid, port, status, started_at, expires_at, last_check
    ) VALUES (?, ?, ?, ?, ?, ?, 'running', ?, ?, NULL)`,
    [
      id,
      userId,
      runtime.kind,
      runtime.containerId,
      runtime.pid,
      runtime.port,
      startedAt.toISOString(),
      expiresAt.toISOString(),
    ],
  );
  await waitForHealth(runtime.port);
  return activeLab(userId);
}

export async function stopLab(userId: string) {
  const session = await activeLab(userId);
  if (!session) return;
  await stopSession(session);
}

export async function lastCheck(userId: string) {
  const row = await one<{ last_check: string | null }>(
    "SELECT last_check FROM lab_sessions WHERE user_id = ? AND status = 'running' ORDER BY started_at DESC LIMIT 1",
    [userId],
  );
  if (!row?.last_check) return null;
  return JSON.parse(row.last_check) as { name: string; ok: boolean; detail: string }[];
}

export async function checkLab(userId: string) {
  const session = await activeLab(userId);
  if (!session?.port) return null;
  const tests = await runHttpChecks(session.port);
  await run("UPDATE lab_sessions SET last_check = ? WHERE id = ?", [JSON.stringify(tests), session.id]);
  return tests;
}

async function sweepExpired() {
  const rows = await many<Row>(
    "SELECT * FROM lab_sessions WHERE status = 'running' AND expires_at <= ?",
    [new Date().toISOString()],
  );
  for (const row of rows) {
    await stopSession(mapSession(row));
  }
}

async function stopSession(session: LabSession) {
  await run("UPDATE lab_sessions SET status = 'stopped' WHERE id = ?", [session.id]);
  if (session.runtime === "docker" && session.containerId) {
    await exec("docker", ["rm", "-f", session.containerId]).catch(() => undefined);
    return;
  }
  if (session.pid) {
    try {
      process.kill(session.pid);
    } catch {
      /* already gone */
    }
  }
}

async function discardRuntime(runtime: {
  kind: "docker" | "process";
  containerId: string | null;
  pid: number | null;
}) {
  if (runtime.kind === "docker" && runtime.containerId) {
    await exec("docker", ["rm", "-f", runtime.containerId]).catch(() => undefined);
    return;
  }
  if (runtime.pid) {
    try {
      process.kill(runtime.pid);
    } catch {
      /* already gone */
    }
  }
}

async function ensureLabNetwork() {
  const inspected = await exec("docker", ["network", "inspect", NETWORK, "--format", "{{.Internal}}"]).catch(
    () => null,
  );
  if (inspected?.stdout.trim() === "false") return;
  if (inspected) {
    await exec("docker", ["network", "rm", NETWORK]).catch(() => undefined);
  }
  await exec("docker", [
    "network",
    "create",
    "-o",
    "com.docker.network.bridge.enable_ip_masquerade=false",
    NETWORK,
  ]);
}

async function startDocker(id: string) {
  const imageReady = await exec("docker", ["image", "inspect", IMAGE])
    .then(() => true)
    .catch(() => false);
  if (!imageReady) {
    await exec("docker", ["build", "-t", IMAGE, LAB_DIR], { timeout: 180000 });
  }
  await ensureLabNetwork();
  const name = `shieldpath-${id.slice(0, 8)}`;
  const { stdout } = await exec("docker", [
    "run",
    "-d",
    "--name",
    name,
    "--cap-drop=ALL",
    "--security-opt=no-new-privileges",
    "--memory=128m",
    "--pids-limit=64",
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=16m",
    "--network",
    NETWORK,
    "-p",
    "127.0.0.1::8080",
    IMAGE,
  ]);
  const containerId = stdout.trim();
  try {
    const { stdout: mapped } = await exec("docker", ["port", containerId, "8080"]);
    const port = Number(mapped.trim().split(":").pop());
    if (!port) throw new Error("sem porta");
    return { kind: "docker" as const, containerId, pid: null, port };
  } catch (error) {
    await exec("docker", ["rm", "-f", containerId]).catch(() => undefined);
    throw error;
  }
}

async function startProcess() {
  const port = await freePort();
  const child = spawn(process.execPath, [path.join(LAB_DIR, "server.mjs")], {
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
    stdio: "ignore",
    detached: true,
  });
  child.unref();
  return { kind: "process" as const, containerId: null, pid: child.pid ?? null, port };
}

function freePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => (error || !port ? reject(error) : resolve(port)));
    });
  });
}

async function waitForHealth(port: number) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {
      /* still booting */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("ambiente nao ficou pronto");
}

async function runHttpChecks(port: number) {
  const fixture = JSON.parse(readFileSync(path.join(LAB_DIR, "fixture.json"), "utf8")) as {
    users: { email: string; password: string; name: string; orders: string[] }[];
  };
  const alice = fixture.users[0];
  const bruno = fixture.users[1];
  const base = `http://127.0.0.1:${port}`;

  const login = await fetch(`${base}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: alice.email, password: alice.password }),
  });
  const cookie = login.headers.get("set-cookie")?.split(";")[0] ?? "";
  const orders = cookie
    ? ((await fetch(`${base}/pedidos`, { headers: { cookie } }).then((response) => response.json())) as {
        orders?: string[];
      })
    : { orders: [] as string[] };
  const wrong = await fetch(`${base}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: alice.email, password: "senha-que-nao-e-do-lab" }),
  });
  const list: string[] = Array.isArray(orders.orders) ? orders.orders : [];
  const onlyAlice = list.length === alice.orders.length && list.every((item: string) => alice.orders.includes(item));
  const hidesBruno = !list.includes(bruno.orders[0]);

  return [
    {
      name: "Login da Alice",
      ok: login.ok && cookie.length > 0,
      detail: "A conta fictícia entra no ambiente isolado.",
    },
    {
      name: "Senha errada fica de fora",
      ok: wrong.status === 401,
      detail: "Uma senha que não é a do lab não abre sessão.",
    },
    {
      name: "Pedidos só da Alice",
      ok: onlyAlice && hidesBruno,
      detail: "A listagem dela não traz o pedido do Bruno.",
    },
  ];
}
