import { cookies } from "next/headers";
import { redirectTo, sameOrigin } from "@/lib/http";
import { stopLab } from "@/lib/lab-runtime";
import { verifyPassword } from "@/lib/password";
import { clearPizzariaCookie } from "@/lib/pizzaria-lab";
import { SESSION_COOKIE, clearSessionCookie, readSessionToken } from "@/lib/session";
import { deleteUserAccount, findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/perfil?erro=origem");
  const jar = await cookies();
  const payload = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  // Confirmação explícita: o e-mail digitado tem de ser o da conta.
  if (email !== user.email) return redirectTo(request, "/perfil?erro=confirmar#excluir");

  // Conta com senha pede a senha de novo. Conta só do Google não tem senha para conferir.
  if (user.passwordHash) {
    if (!password || !(await verifyPassword(password, user.passwordHash))) {
      return redirectTo(request, "/perfil?erro=senha#excluir");
    }
  }

  await stopLab(user.id);
  await deleteUserAccount(user.id);
  console.info("[auth] conta excluída", { userId: user.id });

  const session = clearSessionCookie();
  const pizzaria = clearPizzariaCookie();
  const response = redirectTo(request, "/?conta=excluida");
  response.cookies.set(session.name, session.value, session.options);
  response.cookies.set(pizzaria.name, pizzaria.value, pizzaria.options);
  return response;
}

export function GET() {
  return Response.json({ ok: false }, { status: 405 });
}
