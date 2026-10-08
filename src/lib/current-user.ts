import { cookies } from "next/headers";
import { cache } from "react";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { findUserById } from "@/lib/users";

/** Uma leitura por requisição: layout, cabeçalho e página dividem o mesmo resultado. */
export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return await findUserById(payload.sub);
});
