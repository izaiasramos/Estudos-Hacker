import type { ReactNode } from "react";
import { AuthHardeningLab } from "@/components/auth-hardening-lab";
import { CsrfDefenseLab } from "@/components/csrf-defense-lab";
import { DefenseEditor } from "@/components/defense-editor";
import { LabDesk } from "@/components/lab-desk";
import { OrdersPreview } from "@/components/orders-preview";
import { PhishingInboxLab } from "@/components/phishing-inbox-lab";
import { SessionFlagLab } from "@/components/session-flag-lab";
import { XssDefenseLab } from "@/components/xss-defense-lab";

export type LabContext = {
  userId: string;
  done: boolean;
  /** Lacunas que o checker devolveu em `?falta=a,b`. */
  missing: string[];
};

/**
 * Onde o lab entra no player:
 * - `before`: antes do texto (o ambiente precisa estar à vista enquanto o aluno lê);
 * - `afterBlocks`: entre o texto e o quiz;
 * - `end`: depois de tudo (editor grande, que não cabe antes da leitura).
 */
type LabSlots = {
  before?: ReactNode;
  afterBlocks?: ReactNode;
  end?: ReactNode;
  /** Coluna mais larga que os 68ch de leitura, para caber editor e testes. */
  wide?: boolean;
};

const LABS: Record<string, (ctx: LabContext) => LabSlots> = {
  "lab-ofensivo": (ctx) => ({
    before: (
      <>
        <OrdersPreview />
        <LabDesk userId={ctx.userId} />
      </>
    ),
  }),
  "lab-defensivo": (ctx) => ({ end: <DefenseEditor done={ctx.done} />, wide: true }),
  "sessao-lab": (ctx) => ({ afterBlocks: <SessionFlagLab done={ctx.done} missing={ctx.missing} /> }),
  "auth-lab": (ctx) => ({ afterBlocks: <AuthHardeningLab done={ctx.done} missing={ctx.missing} /> }),
  "xss-lab": (ctx) => ({ afterBlocks: <XssDefenseLab done={ctx.done} missing={ctx.missing} /> }),
  "csrf-lab": (ctx) => ({ afterBlocks: <CsrfDefenseLab done={ctx.done} missing={ctx.missing} /> }),
  "phishing-lab": (ctx) => ({
    afterBlocks: <PhishingInboxLab done={ctx.done} missing={ctx.missing} />,
  }),
};

export function labSlots(unitId: string, ctx: LabContext): LabSlots {
  return LABS[unitId]?.(ctx) ?? {};
}
