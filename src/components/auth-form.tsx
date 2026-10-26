"use client";

import { useState, type FormEvent } from "react";
import { DATABASE_UNAVAILABLE_MESSAGE } from "@/lib/auth-errors";

type AuthFormProps = {
  mode: "signup" | "login";
  error?: string | null;
};

export function AuthForm({ mode, error }: AuthFormProps) {
  const submitLabel = mode === "signup" ? "Criar conta" : "Entrar";
  const action = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    if (mode !== "login") return;
    event.preventDefault();
    setPending(true);
    setLocalError(null);

    try {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(event.currentTarget),
        redirect: "follow",
      });

      if (response.status === 503) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setLocalError(payload?.message ?? DATABASE_UNAVAILABLE_MESSAGE);
        return;
      }

      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      setLocalError("Não foi possível concluir o login. Tente novamente.");
    } catch {
      setLocalError(DATABASE_UNAVAILABLE_MESSAGE);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      action={action}
      method="post"
      className="mt-8 space-y-4"
      onSubmit={mode === "login" ? handleLogin : undefined}
    >
      <div>
        <label htmlFor="email" className="text-sm text-muted">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 w-full rounded-[16px] border border-white/10 bg-ink px-4 text-sm text-text outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm text-muted">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-[16px] border border-white/10 bg-ink px-4 text-sm text-text outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        {mode === "signup" ? (
          <p className="mt-2 text-xs text-muted">Mínimo de 8 caracteres. Evite senhas óbvias.</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-ink transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        {pending ? "Tentando novamente…" : submitLabel}
      </button>
      <a
        href="/api/auth/google"
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 text-sm font-medium text-text transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Entrar com Google
      </a>
      {localError ?? error ? (
        <p role="alert" aria-live="polite" className="text-sm leading-relaxed text-danger">
          {localError ?? error}
        </p>
      ) : null}
    </form>
  );
}
