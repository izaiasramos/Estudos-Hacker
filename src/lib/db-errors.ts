const TRANSIENT_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "57P01",
  "57P02",
  "57P03",
  "53300",
]);

const TRANSIENT_MESSAGE =
  /database_url ausente|tenant\/user .* not found|database system is shutting down|cannot connect now|connection terminated unexpectedly|connection timeout|enotfound|econnrefused|econnreset|etimedout|eai_again/i;

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  cause?: unknown;
};

function errorLike(value: unknown): ErrorLike | null {
  return typeof value === "object" && value !== null ? (value as ErrorLike) : null;
}

/** Classifica somente falhas de infraestrutura que podem melhorar numa nova tentativa. */
export function isDatabaseUnavailable(error: unknown): boolean {
  let current: unknown = error;
  const visited = new Set<unknown>();

  while (current && !visited.has(current)) {
    visited.add(current);
    const candidate = errorLike(current);
    if (!candidate) break;

    const code = typeof candidate.code === "string" ? candidate.code.toUpperCase() : "";
    if (TRANSIENT_CODES.has(code) || code.startsWith("08")) return true;

    const message = typeof candidate.message === "string" ? candidate.message : "";
    if (TRANSIENT_MESSAGE.test(message)) return true;
    current = candidate.cause;
  }

  return false;
}

/** Metadados seguros para logs: nunca inclui URL, credenciais, SQL ou stack. */
export function databaseErrorMetadata(error: unknown) {
  const candidate = errorLike(error);
  return {
    code: typeof candidate?.code === "string" ? candidate.code : "unknown",
    category: isDatabaseUnavailable(error) ? "unavailable" : "unexpected",
  };
}
