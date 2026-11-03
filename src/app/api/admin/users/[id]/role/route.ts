import { isAdmin } from "@/lib/access";
import { changeAdminUserRole, type AdminRole } from "@/lib/admin-users";
import { getCurrentUser } from "@/lib/current-user";
import { redirectTo, sameOrigin } from "@/lib/http";

const ROLES = new Set<AdminRole>(["learner", "admin"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destination = `/admin/usuarios/${encodeURIComponent(id)}`;
  if (!sameOrigin(request)) return redirectTo(request, `${destination}?erro=origem`);
  const actor = await getCurrentUser();
  if (!isAdmin(actor)) return new Response("Not Found", { status: 404 });
  const form = await request.formData();
  const rawRole = String(form.get("role") ?? "");
  if (!ROLES.has(rawRole as AdminRole)) return redirectTo(request, `${destination}?erro=papel`);
  const result = await changeAdminUserRole(actor!.id, id, rawRole as AdminRole);
  if ("error" in result) return redirectTo(request, `${destination}?erro=${result.error}`);
  console.info("[admin] papel alterado", { actorId: actor!.id, targetId: id, role: rawRole });
  return redirectTo(request, `${destination}?ok=papel`);
}

export function GET() { return Response.json({ ok: false }, { status: 405 }); }
