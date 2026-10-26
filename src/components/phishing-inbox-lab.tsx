"use client";

import { PHISHING_LAB_GAPS } from "@/lib/phishing-lab-check";

const EMAILS = [
  {
    id: "msg1",
    from: "noreply@shieldpath.app",
    subject: "Novo login no seu time — ShieldPath",
    preview:
      "Você esperava este aviso e confirmou o mesmo evento abrindo diretamente o app. A mensagem não pede senha.",
  },
  {
    id: "msg2",
    from: "alerta@shieldpath-secure-login.com",
    subject: "URGENTE: confirme sua senha em 10 minutos",
    preview:
      "Pede para usar um endereço diferente do domínio oficial e digitar a senha para não perder o acesso.",
  },
  {
    id: "msg3",
    from: "rh@empresa-ficticia.local",
    subject: "Contracheque — abrir anexo",
    preview:
      "Arquivo contracheque.exe inesperado. Não há confirmação independente de que o RH enviou a mensagem.",
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
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-defense">Simulação concluída</p>
        <ul className="mt-3 space-y-2 text-sm text-text">
          <li>Classificações consideram contexto e confirmação independente.</li>
          <li>Produto nunca pede senha ou código por e-mail.</li>
          <li>Avisos de login, 2FA, canal de alerta e treino reduzem impacto.</li>
          <li>Mensagens reais são confirmadas no app ou canal oficial, sem usar o link recebido.</li>
        </ul>
      </section>
    );
  }

  return (
    <form action="/api/trilha/phishing-lab" method="post" className="mt-8 space-y-6">
      <p className="text-sm text-muted">
        Simulação de triagem: avalie apenas os cenários fictícios abaixo. Em uma caixa real, confirme no app ou canal oficial sem clicar no link recebido.
      </p>
      <div className="space-y-4">
        {EMAILS.map((mail) => (
          <article key={mail.id} className="rounded-[16px] border border-white/10 bg-ink/50 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Mensagem fictícia</p>
            <p className="mt-2 text-sm"><span className="text-muted">De:</span> {mail.from}</p>
            <p className="text-sm font-medium">{mail.subject}</p>
            <p className="mt-2 text-sm text-muted">{mail.preview}</p>
            <fieldset className="mt-4 space-y-2">
              <legend className="text-sm">Classificação neste cenário</legend>
              {[["legitimo", "Legítimo"], ["suspeito", "Suspeito"], ["phishing", "Phishing"]].map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 text-sm">
                  <input type="radio" name={mail.id} value={value} required className="accent-[#d6ff4a]" />
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
            <li key={key}>{PHISHING_LAB_GAPS[key] ?? "Revise a evidência e a próxima ação segura."}</li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-3 rounded-[16px] border border-white/10 bg-surface/60 p-4">
        <p className="text-sm font-medium">Defesas simuladas de produto e processo (marque todas)</p>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="nosenha" value="on" className="mt-1 accent-[#d6ff4a]" />
          Política: nunca pedir senha ou código por e-mail
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="alerta" value="on" className="mt-1 accent-[#d6ff4a]" />
          Aviso de login ou dispositivo novo, verificável dentro do app
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="mfa" value="on" className="mt-1 accent-[#d6ff4a]" />
          Autenticação de dois fatores (2FA) para contas sensíveis
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="treino" value="on" className="mt-1 accent-[#d6ff4a]" />
          Simulação interna autorizada, segura e voltada à aprendizagem
        </label>
      </div>

      <button type="submit" className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
        Conferir decisões
      </button>
    </form>
  );
}
