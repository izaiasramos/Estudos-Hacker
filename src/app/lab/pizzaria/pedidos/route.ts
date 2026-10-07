import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { activeLab } from "@/lib/lab-runtime";
import {
  findPizzariaUser,
  PIZZARIA_COOKIE,
  readPizzariaToken,
} from "@/lib/pizzaria-lab";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.ethicsAcceptedAt) {
    return NextResponse.json({ error: "conta" }, { status: 401 });
  }
  const session = await activeLab(user.id);
  if (!session) {
    return NextResponse.json({ error: "ambiente" }, { status: 403 });
  }

  const jar = await cookies();
  const payload = readPizzariaToken(jar.get(PIZZARIA_COOKIE)?.value);
  if (!payload || payload.labId !== session.id) {
    return NextResponse.json({ error: "sessao" }, { status: 401 });
  }

  const account = findPizzariaUser(payload.email);
  if (!account) {
    return NextResponse.json({ error: "sessao" }, { status: 401 });
  }

  return NextResponse.json({ orders: account.orders });
}
