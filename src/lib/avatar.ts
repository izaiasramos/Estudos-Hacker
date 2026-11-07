export const AVATAR_MAX_BYTES = 400 * 1024;

export type AvatarMime = "image/jpeg" | "image/png" | "image/webp";

/** Confere o conteúdo real do arquivo (magic bytes), sem confiar no tipo informado pelo navegador. */
export function sniffAvatarMime(bytes: Uint8Array): AvatarMime | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length > 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/** Devolve o arquivo validado como data URL, ou o motivo da recusa. */
export async function readAvatarFile(
  value: FormDataEntryValue | null,
): Promise<{ dataUrl: string } | { error: "foto" | "foto-tamanho" | "foto-tipo" }> {
  if (!(value instanceof File) || value.size === 0) return { error: "foto" };
  if (value.size > AVATAR_MAX_BYTES) return { error: "foto-tamanho" };
  const bytes = new Uint8Array(await value.arrayBuffer());
  const mime = sniffAvatarMime(bytes);
  if (!mime) return { error: "foto-tipo" };
  return { dataUrl: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}` };
}

export function avatarUrl(userId: string, version?: string | null) {
  return `/api/avatar/${encodeURIComponent(userId)}${version ? `?v=${encodeURIComponent(version)}` : ""}`;
}
