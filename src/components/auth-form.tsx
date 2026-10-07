type AuthFormProps = {
  mode: "signup" | "login";
  error?: string | null;
};

export function AuthForm({ mode, error }: AuthFormProps) {
  const submitLabel = mode === "signup" ? "Criar conta" : "Entrar";
  const action = mode === "signup" ? "/api/auth/register" : "/api/auth/login";

  return (
    <form action={action} method="post" className="mt-8 space-y-4">
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
          className="mt-2 h-12 w-full rounded-[16px] border border-white/10 bg-ink px-4 text-sm text-text outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
        {mode === "signup" ? (
          <p className="mt-2 text-xs text-muted">Mínimo de 8 caracteres. Evite senhas óbvias.</p>
        ) : null}
      </div>
      <button
        type="submit"
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-ink transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        {submitLabel}
      </button>
      <a
        href="/api/auth/google"
        className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 text-sm font-medium text-text transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Entrar com Google
      </a>
      {error ? (
        <p role="alert" className="text-sm leading-relaxed text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
