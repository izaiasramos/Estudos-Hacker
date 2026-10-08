import { missingAuthLabDefenses } from "@/lib/auth-lab-check";
import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";

const FIELDS = ["hash", "generic", "policy", "limit"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "auth-lab", (form) => missingAuthLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
