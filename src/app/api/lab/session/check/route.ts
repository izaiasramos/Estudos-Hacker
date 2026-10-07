import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { checkLab } from "@/lib/lab-runtime";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/inicio");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user?.ethicsAcceptedAt) return redirectTo(request, "/entrar");
  await checkLab(user.id);
  return redirectTo(request, "/trilha/sql-injection/lab-ofensivo");
}
