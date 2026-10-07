import { NextResponse } from "next/server";
import { isEmail, redirectTo, sameOrigin } from "@/lib/http";
import { hashPassword, passwordProblem } from "@/lib/password";
import { createSessionToken, sessionCookie } from "@/lib/session";
import { createLocalUser, findUserByEmail, nameFromEmail } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return redirectTo(request, "/criar-conta?erro=origem");
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!isEmail(email)) {
    return redirectTo(request, "/criar-conta?erro=email");
  }
  if (passwordProblem(password, email)) {
    return redirectTo(request, "/criar-conta?erro=senha");
  }
  if (await findUserByEmail(email)) {
    return redirectTo(request, "/criar-conta?erro=existe");
  }

  const user = await createLocalUser({
    email,
    name: nameFromEmail(email),
    passwordHash: await hashPassword(password),
  });
  const cookie = sessionCookie(createSessionToken(user.id));
  const response = redirectTo(request, "/regras");
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
