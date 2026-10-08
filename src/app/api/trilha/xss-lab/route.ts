import { missingXssLabDefenses } from "@/lib/xss-lab-check";
import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";

const FIELDS = ["escape", "csp", "safedom", "sanitize"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "xss-lab", (form) => missingXssLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
