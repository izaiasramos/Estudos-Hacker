import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { activeLab } from "@/lib/lab-runtime";
import {
  findPizzariaUser,
  issuePizzariaToken,
  pizzariaCookie,
  verifyPizzariaPassword,
} from "@/lib/pizzaria-lab";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.ethicsAcceptedAt) {
    return NextResponse.json({ error: "conta" }, { status: 401 });
  }
  const session = await activeLab(user.id);
  if (!session) {
    return NextResponse.json({ error: "ambiente" }, { status: 403 });
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "json" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const account = findPizzariaUser(email);
  if (!account || !verifyPizzariaPassword(account, password)) {
    return NextResponse.json({ error: "credenciais" }, { status: 401 });
  }

  const token = issuePizzariaToken(account.email, session.id);
  const cookie = pizzariaCookie(token);
  const response = NextResponse.json({ name: account.name });
  const jar = await cookies();
  jar.set(cookie.name, cookie.value, cookie.options);
  return response;
}
