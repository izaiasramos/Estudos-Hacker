import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";
import { missingIdorLabDefenses } from "@/lib/idor-lab-check";

const FIELDS = ["owner", "server", "deny", "allowlist", "response", "uuid"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "idor-lab", (form) => missingIdorLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
