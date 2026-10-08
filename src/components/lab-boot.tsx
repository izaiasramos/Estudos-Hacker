"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

/**
 * Boot do lab em três etapas nomeadas (seção 15.4). Cada etapa avança com um marco real:
 * 1. isolando rede: o servidor está criando a sessão do lab (POST /api/lab/session). No modo
 *    local, é aqui que o container sobe e o /health responde, antes de a rota voltar;
 * 2. subindo app: a página recarregou com o ambiente no ar e o iframe está carregando;
 * 3. pronto: o iframe terminou de carregar.
 * Sem JavaScript, o formulário faz o POST normal e a página volta com o ambiente no ar.
 */
const STEPS = ["isolando rede", "subindo app", "pronto"] as const;
const BOOT_FLAG = "shieldpath-lab-boot";

export function LabBootButton() {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "starting" | "error">("idle");

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhase("starting");
    try {
      const response = await fetch("/api/lab/session", { method: "POST", redirect: "manual" });
      // A rota responde 303 de volta para a unidade; com redirect manual isso chega como opaqueredirect.
      if (response.type !== "opaqueredirect" && !response.ok) throw new Error(String(response.status));
      sessionStorage.setItem(BOOT_FLAG, String(Date.now()));
      router.refresh();
    } catch {
      setPhase("error");
    }
  }

  return (
    <form action="/api/lab/session" method="post" onSubmit={start} className="mt-4 space-y-4">
      {phase === "starting" ? <BootSteps reached={0} /> : null}
      {phase === "error" ? (
        <p role="alert" className="text-sm text-danger">
          O ambiente não subiu. Nada ficou ligado. Tente de novo.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={phase === "starting"}
        className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-ink disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      >
        {phase === "starting" ? "Subindo…" : "Iniciar ambiente"}
      </button>
    </form>
  );
}

export function LabFrame({ src }: { src: string }) {
  // Servidor e primeira renderização no cliente começam iguais (sem cerimônia).
  // Depois de montar, a cerimônia só aparece se o boot acabou de acontecer nesta aba.
  const [reached, setReached] = useState(2);
  const [visible, setVisible] = useState(false);
  const loaded = useRef(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const flag = sessionStorage.getItem(BOOT_FLAG);
    sessionStorage.removeItem(BOOT_FLAG);
    if (flag === null || Date.now() - Number(flag) > 60_000) return;
    // Etapa 1 (rede) já passou: o servidor respondeu. Agora o app carrega no iframe.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leitura única de sessionStorage após montar
    setVisible(true);
    setReached(loaded.current || frameReady(frame.current) ? 2 : 1);
  }, []);

  useEffect(() => {
    if (!visible || reached < 2) return;
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, [visible, reached]);

  return (
    <>
      {visible ? <BootSteps reached={reached} /> : null}
      <iframe
        ref={frame}
        title="Pizzaria do Lab"
        src={src}
        onLoad={() => {
          loaded.current = true;
          setReached(2);
        }}
        className="h-80 w-full rounded-[16px] border border-white/10 bg-ink"
      />
    </>
  );
}

/** Iframe do mesmo domínio que já terminou de carregar. Em outra origem não dá para ler: espera o onLoad. */
function frameReady(element: HTMLIFrameElement | null) {
  try {
    const doc = element?.contentDocument;
    return doc?.readyState === "complete" && doc.URL !== "about:blank";
  } catch {
    return false;
  }
}

/** `reached` é o índice da etapa em andamento; etapas antes dele estão concluídas. 2 = pronto. */
function BootSteps({ reached }: { reached: number }) {
  const ready = reached >= 2;
  const percent = ready ? 100 : Math.round(((reached + 0.5) / STEPS.length) * 100);
  return (
    <div className="rounded-[16px] border border-white/10 bg-surface/60 p-4" role="status" aria-live="polite">
      <div
        className="h-1 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Subindo o ambiente"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={`boot-bar h-full rounded-full ${ready ? "bg-defense" : "bg-accent"}`} style={{ width: `${percent}%` }} />
      </div>
      <ol className="mt-3 grid gap-2 font-mono text-[12px] sm:grid-cols-3">
        {STEPS.map((label, index) => {
          const done = index < reached || ready;
          const active = index === reached && !ready;
          return (
            <li
              key={label}
              className={`flex items-center gap-2 ${done ? "text-defense" : active ? "boot-step-active text-accent" : "text-muted"}`}
            >
              <span aria-hidden>{done ? "✓" : active ? "●" : "○"}</span>
              {label}
              <span className="sr-only">{done ? " concluída" : active ? " em andamento" : " aguardando"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
