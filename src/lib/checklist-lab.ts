import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { locateUnit } from "@/content/trails";
import { canSeeTrail } from "@/lib/access";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { completeLab } from "@/lib/trail-progress";
import { findUserById } from "@/lib/users";

/**
 * Fluxo comum dos labs defensivos por formulário (sessão, autenticação, XSS, CSRF, phishing):
 * confere origem e sessão, roda o checker da trilha e volta para a unidade.
 * - Lacunas: `?falta=a,b` na unidade.
 * - Tudo certo: marca o lab e, se o checkpoint já foi, manda para o selo.
 */
export async function handleChecklistLab(
  request: Request,
  unitId: string,
  missingDefenses: (form: FormData) => string[],
) {
  if (!sameOrigin(request)) return redirectTo(request, "/inicio");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");
  if (!user.ethicsAcceptedAt) return redirectTo(request, "/regras");

  const located = locateUnit(unitId);
  if (!located || !canSeeTrail(user, located.trail)) return redirectTo(request, "/inicio");
  const basePath = `/trilha/${located.trail.slug}`;

  const missing = missingDefenses(await request.formData());
  const destination = new URL(`${basePath}/${unitId}`, request.url);
  if (missing.length > 0) {
    destination.searchParams.set("falta", missing.join(","));
    return NextResponse.redirect(destination, 303);
  }

  const result = await completeLab(user.id, unitId, true);
  if ("error" in result) return redirectTo(request, basePath);
  if (result.sealed) return redirectTo(request, `${basePath}/selo`);
  destination.searchParams.set("ok", "1");
  return NextResponse.redirect(destination, 303);
}

export function methodNotAllowed() {
  return NextResponse.json({ ok: false }, { status: 405 });
}

/** Lê os campos do formulário como texto, para os checkers puros. */
export function fields<K extends string>(form: FormData, keys: readonly K[]) {
  return Object.fromEntries(keys.map((key) => [key, String(form.get(key) ?? "")])) as Record<K, string>;
}
