import { fields, handleChecklistLab, methodNotAllowed } from "@/lib/checklist-lab";
import { missingSsrfLabDefenses } from "@/lib/ssrf-lab-check";

const FIELDS = ["scheme", "resolve", "redirect", "response", "textblock"] as const;

export function POST(request: Request) {
  return handleChecklistLab(request, "ssrf-lab", (form) => missingSsrfLabDefenses(fields(form, FIELDS)));
}

export const GET = methodNotAllowed;
