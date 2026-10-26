"use client";

import { useState } from "react";
import { LabCheck, LabDone, LabGaps, LabOutcomes, LabSubmit } from "@/components/lab-controls";
import { SSRF_LAB_GAPS } from "@/lib/ssrf-lab-check";

export function SsrfDefenseLab({ done, missing }: { done: boolean; missing: string[] }) {
  const [scheme, setScheme] = useState(false);
  const [resolve, setResolve] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [response, setResponse] = useState(false);
  const [textblock, setTextblock] = useState(false);

  if (done) {
    return (
      <LabDone
        items={[
          "Só HTTPS entra.",
          "O IP resolvido não pode ser interno, loopback ou link-local, e a conexão usa exatamente o destino conferido.",
          "Redirect não é seguido sem nova checagem.",
          "Volta só o resumo da página, com limite de tamanho e tempo.",
        ]}
      />
    );
  }

  // O que o servidor faria com cada URL colada no chat, com a configuração atual.
  const blocked = "recusado";
  const rows = [
    {
      input: "https://exemplo.com/cardapio",
      result: response ? "200 · título, descrição e imagem" : "200 · HTML inteiro da página",
      bad: false,
    },
    {
      input: "http://localhost:5432/",
      result: resolve || textblock || scheme ? blocked : "conectou no Postgres interno",
      bad: !(resolve || textblock || scheme),
    },
    {
      input: "https://pizzaria-interna.exemplo.com/ → resolve para 10.0.0.12",
      result: resolve ? blocked : response ? "200 · resumo do painel interno" : "200 · painel administrativo interno inteiro",
      bad: !resolve,
    },
    {
      input: "https://link-curto.exemplo/abc → redireciona para http://169.254.169.254/",
      result: redirect ? blocked : "seguiu sem revalidar até o serviço de metadados",
      bad: !redirect,
    },
    {
      input: "file:///etc/passwd",
      result: scheme ? blocked : "leu um arquivo do disco do servidor",
      bad: !scheme,
    },
  ];

  return (
    <form action="/api/trilha/ssrf-lab" method="post" className="mt-8 space-y-4">
      <LabOutcomes title="Prévia de link · POST /api/previa" rows={rows} />
      {textblock && !resolve ? (
        <p className="text-xs text-muted">
          A regra de texto barrou o localhost, mas o domínio que resolve para 10.0.0.12 passou direto.
        </p>
      ) : null}
      <LabGaps missing={missing} gaps={SSRF_LAB_GAPS} />

      <LabCheck name="scheme" checked={scheme} onChange={setScheme}>
        Lista permitida de esquema — só <code className="font-mono text-[13px]">https:</code>
      </LabCheck>
      <LabCheck name="resolve" checked={resolve} onChange={setResolve}>
        Resolver o nome pelo sistema de nomes de domínio (DNS), recusar IP interno, loopback e link-local — e conectar exatamente ao IP conferido
      </LabCheck>
      <LabCheck name="redirect" checked={redirect} onChange={setRedirect}>
        Não seguir redirect sem conferir o novo destino
      </LabCheck>
      <LabCheck name="response" checked={response} onChange={setResponse}>
        Devolver só o resumo (título, descrição, imagem), com limite de tamanho e tempo
      </LabCheck>
      <LabCheck name="textblock" checked={textblock} onChange={setTextblock}>
        Recusar URLs que contenham <code className="font-mono text-[13px]">localhost</code> ou{" "}
        <code className="font-mono text-[13px]">127.0.0.1</code> no texto
      </LabCheck>
      <LabSubmit />
    </form>
  );
}
