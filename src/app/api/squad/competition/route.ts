import { cookies } from "next/headers";
import { closeCompetition, createCompetition } from "@/lib/competition";
import { redirectTo, sameOrigin } from "@/lib/http";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";
import { findUserById } from "@/lib/users";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return redirectTo(request, "/inicio");
  const payload = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  const user = payload ? await findUserById(payload.sub) : null;
  if (!user) return redirectTo(request, "/entrar");
  if (!user.ethicsAcceptedAt) return redirectTo(request, "/regras");
  const form = await request.formData(); const intent = String(form.get("intent") ?? "");
  const result = intent === "close" ? await closeCompetition(user.id) : intent === "create" ? await createCompetition(user.id, {
    name:String(form.get("name") ?? ""), startsAt:String(form.get("startsAt") ?? ""), endsAt:String(form.get("endsAt") ?? ""),
    minimumCoverage:Number(form.get("minimumCoverage")), prizeMode:String(form.get("prizeMode") ?? ""), prizeDescription:String(form.get("prizeDescription") ?? ""),
  }) : { error:"acao" as const };
  if ("error" in result && result.error) {
    return redirectTo(request, `/squad?erro=${encodeURIComponent(result.error)}`);
  }
  return redirectTo(request, "/squad?ok=competicao");
}

export function GET() { return Response.json({ ok:false }, { status:405 }); }
