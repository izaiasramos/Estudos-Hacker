import { createHash } from "node:crypto";
import { many, run } from "@/lib/db";

/**
 * Limite de tentativas de login (seção 11.1 e 21 da spec: a plataforma aplica a defesa que ensina).
 *
 * - As falhas ficam no Postgres, porque na Vercel cada instância tem a própria memória.
 * - Duas chaves por tentativa: o e-mail digitado e o IP. O e-mail segura o ataque a uma conta;
 *   o IP segura quem testa muitas contas a partir da mesma origem.
 * - O bloqueio vale mesmo para e-mail que não existe, para a resposta não revelar contas.
 * - E-mail e IP são gravados como hash: a tabela não guarda dado pessoal legível.
 */
export const WINDOW_MS = 15 * 60 * 1000;
export const MAX_PER_EMAIL = 5;
export const MAX_PER_IP = 30;

export type LockState = { locked: false } | { locked: true; retryAt: number };

/**
 * Lógica pura: dado o horário das falhas, diz se a chave está bloqueada e até quando.
 * Fica bloqueada enquanto houver `max` falhas ou mais dentro da janela. O desbloqueio acontece
 * quando falhas suficientes saem da janela para a contagem ficar abaixo de `max`.
 */
export function lockState(failures: number[], now: number, max: number, windowMs = WINDOW_MS): LockState {
  const recent = failures.filter((time) => time > now - windowMs).sort((a, b) => a - b);
  if (recent.length < max) return { locked: false };
  const pivot = recent[recent.length - max];
  return { locked: true, retryAt: pivot + windowMs };
}

export function clientIp(request: Request) {
  // Na Vercel o primeiro valor de x-forwarded-for é o IP do cliente, definido pela própria borda.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "desconhecido";
}

function keyHash(scope: "email" | "ip", value: string) {
  return createHash("sha256").update(`${scope}:${value.toLowerCase()}`).digest("hex");
}

function keysFor(email: string, ip: string) {
  return [
    { hash: keyHash("email", email), max: MAX_PER_EMAIL },
    { hash: keyHash("ip", ip), max: MAX_PER_IP },
  ];
}

async function failureTimes(hash: string, since: number) {
  const rows = await many<{ created_at: string }>(
    "SELECT created_at FROM login_failures WHERE key_hash = ? AND created_at > ?",
    [hash, new Date(since).toISOString()],
  );
  return rows.map((row) => Date.parse(row.created_at));
}

/** Retorna o maior `retryAt` entre as chaves bloqueadas, ou null se o login pode seguir. */
export async function loginBlockedUntil(email: string, ip: string, now = Date.now()) {
  let until: number | null = null;
  for (const key of keysFor(email, ip)) {
    const state = lockState(await failureTimes(key.hash, now - WINDOW_MS), now, key.max);
    if (state.locked && (until === null || state.retryAt > until)) until = state.retryAt;
  }
  return until;
}

export async function recordLoginFailure(email: string, ip: string, now = Date.now()) {
  const createdAt = new Date(now).toISOString();
  for (const key of keysFor(email, ip)) {
    await run("INSERT INTO login_failures (key_hash, created_at) VALUES (?, ?)", [key.hash, createdAt]);
  }
  // Limpeza oportunista: falha fora da janela não conta mais para nada.
  await run("DELETE FROM login_failures WHERE created_at <= ?", [new Date(now - WINDOW_MS).toISOString()]);
}

/** Login certo zera as falhas do e-mail. As do IP continuam, para não virar atalho de quem testa contas. */
export async function clearLoginFailures(email: string) {
  await run("DELETE FROM login_failures WHERE key_hash = ?", [keyHash("email", email)]);
}
