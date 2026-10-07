import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { stopLab } from "@/lib/lab-runtime";
import { clearPizzariaCookie } from "@/lib/pizzaria-lab";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/inicio");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (user) await stopLab(user.id);
  const cleared = clearPizzariaCookie();
  jar.set(cleared.name, cleared.value, cleared.options);
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const target = new URL(referer);
      if (target.host === new URL(request.url).host) return redirectTo(request, `${target.pathname}${target.search}`);
    } catch {
      /* ignore bad referer */
    }
  }
  return redirectTo(request, "/inicio");
}
