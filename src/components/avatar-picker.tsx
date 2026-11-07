"use client";

import { useRef, useState } from "react";

const SIZE = 256;
const ACCEPT = "image/jpeg,image/png,image/webp";

/** Reduz a foto para um quadrado de 256 px no navegador. O servidor valida de novo. */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("blob");
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

export function AvatarPicker({ required = true, currentSrc }: { required?: boolean; currentSrc?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentSrc ?? null);
  const [problem, setProblem] = useState<string | null>(null);

  async function onChange(file: File | undefined) {
    setProblem(null);
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setProblem("Use uma imagem JPG, PNG ou WebP.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    try {
      const small = await shrink(file);
      const transfer = new DataTransfer();
      transfer.items.add(small);
      if (inputRef.current) inputRef.current.files = transfer.files;
      setPreview(URL.createObjectURL(small));
    } catch {
      setProblem("Não foi possível ler esta imagem. Tente outra.");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label htmlFor="avatar" className="text-sm text-muted">
        Foto de perfil{required ? "" : " (opcional)"}
      </label>
      <div className="mt-2 flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-ink text-xs text-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pré-visualização da foto" className="size-full object-cover" />
          ) : (
            "Sem foto"
          )}
        </span>
        <input
          ref={inputRef}
          id="avatar"
          name="avatar"
          type="file"
          accept={ACCEPT}
          required={required}
          onChange={(event) => void onChange(event.target.files?.[0])}
          className="min-w-0 flex-1 text-xs text-muted file:mr-3 file:h-10 file:rounded-full file:border file:border-white/15 file:bg-transparent file:px-4 file:text-sm file:text-text"
        />
      </div>
      <p className="mt-2 text-xs text-muted">JPG, PNG ou WebP. A imagem é recortada em quadrado.</p>
      {problem ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {problem}
        </p>
      ) : null}
    </div>
  );
}
