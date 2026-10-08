"use client";

import { PHISHING_LAB_GAPS } from "@/lib/phishing-lab-check";

const EMAILS = [
  {
    id: "msg1",
    from: "noreply@shieldpath.app",
    subject: "Novo login no seu time — ShieldPath",
    preview:
      "Alguém entrou com sucesso. Se foi você, ignore. Se não, troque a senha no app (não responda este e-mail).",
  },
  {
    id: "msg2",
    from: "alerta@shieldpath-secure-login.com",
    subject: "URGENTE: confirme sua senha em 10 minutos",
    preview:
      "Clique aqui e digite a senha atual para não perder o acesso. Link: http://shieldpath-secure-login.com/verify",
  },
  {
    id: "msg3",
    from: "rh@empresa-ficticia.local",
    subject: "Contracheque — abrir anexo",
    preview: "Segue folha em anexo. Arquivo: contracheque.exe (você não esperava executável).",
  },
] as const;

export function PhishingInboxLab({
  done,
  missing,
}: {
  done: boolean;
  missing: string[];
}) {
  if (done) {
    return (
      <section className="mt-8 rounded-[16px] border border-defense/40 bg-defense/10 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Checker</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Classificação correta dos três e-mails fictícios.</li>
          <li>Produto não pede senha por e-mail.</li>
          <li>Aviso de login novo, 2FA disponível e treino interno documentados.</li>
        </ul>
      </section>
    );
  }

  return (
    <form action="/api/trilha/phishing-lab" method="post" className="mt-8 space-y-6">
      <div className="space-y-4">
        {EMAILS.map((mail) => (
          <article
            key={mail.id}
            className="rounded-[16px] border border-white/10 bg-ink/50 p-4"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Caixa do lab</p>
            <p className="mt-2 text-sm">
              <span className="text-muted">De:</span> {mail.from}
            </p>
            <p className="text-sm font-medium">{mail.subject}</p>
            <p className="mt-2 text-sm text-muted">{mail.preview}</p>
            <fieldset className="mt-4 space-y-2">
              <legend className="text-sm">Classificação</legend>
              {[
                ["legitimo", "Legítimo"],
                ["suspeito", "Suspeito"],
                ["phishing", "Phishing"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name={mail.id}
                    value={value}
                    required
                    className="accent-[#d6ff4a]"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          </article>
        ))}
      </div>

      {missing.length > 0 ? (
        <ul className="space-y-2 text-sm text-danger" role="alert">
          {missing.map((key) => (
            <li key={key}>{PHISHING_LAB_GAPS[key] ?? "Revise classificação ou defesa."}</li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-3 rounded-[16px] border border-white/10 bg-surface/60 p-4">
        <p className="text-sm font-medium">Defesas de produto (marque todas)</p>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="nosenha" value="on" className="mt-1 accent-[#d6ff4a]" />
          Política: nunca pedir senha ou token por e-mail
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="alerta" value="on" className="mt-1 accent-[#d6ff4a]" />
          Aviso automático de login ou dispositivo novo
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="mfa" value="on" className="mt-1 accent-[#d6ff4a]" />
          Segundo fator disponível para contas sensíveis
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="treino" value="on" className="mt-1 accent-[#d6ff4a]" />
          Simulação interna de phishing para treinar o time
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        Conferir caixa e políticas
      </button>
    </form>
  );
}
