import { NextResponse } from "next/server";
import { DATABASE_UNAVAILABLE_MESSAGE } from "@/lib/auth-errors";
import { isDatabaseUnavailable, databaseErrorMetadata } from "@/lib/db-errors";
import { isEmail, redirectTo, sameOrigin } from "@/lib/http";
import { clearLoginFailures, clientIp, loginBlockedUntil, recordLoginFailure } from "@/lib/login-throttle";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookie } from "@/lib/session";
import { findUserByEmail } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return redirectTo(request, "/entrar?erro=origem");
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!isEmail(email) || !password) {
    return redirectTo(request, "/entrar?erro=credenciais");
  }

  try {
    // O bloqueio é checado antes do bcrypt: quem está travado nem chega a testar a senha.
    const ip = clientIp(request);
    if (await loginBlockedUntil(email, ip)) {
      console.warn("[auth] login bloqueado por excesso de tentativas");
      return redirectTo(request, "/entrar?erro=bloqueado");
    }

    const user = await findUserByEmail(email);
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      await recordLoginFailure(email, ip);
      return redirectTo(request, "/entrar?erro=credenciais");
    }
    await clearLoginFailures(email);

    const cookie = sessionCookie(createSessionToken(user.id));
    const response = redirectTo(
      request,
      user.ethicsAcceptedAt ? "/inicio" : "/regras",
    );
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    console.error("[auth] banco indisponível durante login", databaseErrorMetadata(error));
    return NextResponse.json(
      {
        ok: false,
        code: "temporarily_unavailable",
        message: DATABASE_UNAVAILABLE_MESSAGE,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Retry-After": "5",
        },
      },
    );
  }
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
