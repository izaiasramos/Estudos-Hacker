import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { findUserById } from "@/lib/users";

export async function getCurrentUser() {
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  return await findUserById(payload.sub);
}
