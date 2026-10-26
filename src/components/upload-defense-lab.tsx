"use client";

import { useState } from "react";
import { LabCheck, LabDone, LabGaps, LabOutcomes, LabRadio, LabSubmit } from "@/components/lab-controls";
import { UPLOAD_LAB_GAPS } from "@/lib/upload-lab-check";

const SVG_OPTIONS = [
  ["accept", "Aceitar SVG como está"],
  ["convert", "Converter SVG para PNG no servidor"],
  ["reject", "Recusar SVG"],
] as const;

export function UploadDefenseLab({ done, missing }: { done: boolean; missing: string[] }) {
  const [content, setContent] = useState(false);
  const [rename, setRename] = useState(false);
  const [size, setSize] = useState(false);
  const [isolate, setIsolate] = useState(false);
  const [contenttype, setContenttype] = useState(false);
  const [svg, setSvg] = useState("accept");

  if (done) {
    return (
      <LabDone
        items={[
          "O conteúdo é conferido e a imagem é reprocessada.",
          "O nome salvo é gerado no servidor.",
          "Há limite de tamanho antes de ler o arquivo.",
          "Os arquivos saem por uma origem separada, sem cookies ou outras credenciais da aplicação, com X-Content-Type-Options: nosniff.",
          "SVG não entra como está.",
        ]}
      />
    );
  }

  const where = isolate ? "arquivos.exemplo.com" : "pizzaria.lab/uploads";
  const rows = [
    {
      input: "foto.png (PNG de verdade, 300 KB)",
      result: `salvo em ${where}/${rename ? "7f3a….png" : "foto.png"}`,
      bad: false,
    },
    {
      input: "pagina.html enviada com Content-Type: image/png",
      result: content
        ? "recusado: o conteúdo não é imagem"
        : contenttype
          ? `aceito pelo rótulo enviado pelo cliente; ${isolate ? "abre em outro domínio, fora da origem do site" : "abre como página do site"}`
          : isolate
            ? "aceito; abre em outro domínio, fora da origem do site"
            : "aceito; abre como página do site e roda script",
      bad: !content && !isolate,
    },
    {
      input: "avatar.svg com <script> dentro",
      result:
        svg === "reject"
          ? "recusado"
          : svg === "convert"
            ? "convertido para PNG, sem script"
            : isolate
              ? "aceito; abre em outro domínio"
              : "aceito; o script roda na origem do site",
      bad: svg === "accept",
    },
    {
      input: "nome do arquivo: ../../.env",
      result: rename ? "nome ignorado; salvo com id gerado" : "gravou fora da pasta de uploads",
      bad: !rename,
    },
    {
      input: "video.png com 4 GB",
      result: size ? "recusado no limite de 2 MB" : "encheu o disco do servidor",
      bad: !size,
    },
  ];

  return (
    <form action="/api/trilha/upload-lab" method="post" className="mt-8 space-y-4">
      <LabOutcomes title="Avatar da Alice · POST /api/avatar" rows={rows} />
      <LabGaps missing={missing} gaps={UPLOAD_LAB_GAPS} />

      <LabCheck name="content" checked={content} onChange={setContent}>
        Conferir a assinatura do conteúdo e reprocessar a imagem
      </LabCheck>
      <LabCheck name="rename" checked={rename} onChange={setRename}>
        Gerar o nome no servidor — o nome original vira só texto no banco
      </LabCheck>
      <LabCheck name="size" checked={size} onChange={setSize}>
        Limite de tamanho no servidor (2 MB)
      </LabCheck>
      <LabCheck name="isolate" checked={isolate} onChange={setIsolate}>
        Servir por uma origem separada, sem cookies ou credenciais da aplicação, com <code className="font-mono text-[13px]">X-Content-Type-Options: nosniff</code>
      </LabCheck>
      <LabCheck name="contenttype" checked={contenttype} onChange={setContenttype}>
        Aceitar só se o <code className="font-mono text-[13px]">Content-Type</code> do pedido for{" "}
        <code className="font-mono text-[13px]">image/*</code>
      </LabCheck>
      <LabRadio legend="Avatar em SVG" name="svg" value={svg} onChange={setSvg} options={SVG_OPTIONS} />
      <LabSubmit />
    </form>
  );
}
