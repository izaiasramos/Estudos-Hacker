"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Animações do `motion` seguem a preferência do perfil quando ela pede menos movimento.
 * Sem preferência, "user" respeita o prefers-reduced-motion do sistema.
 */
export function MotionPreference({ reduce, children }: { reduce: boolean; children: ReactNode }) {
  return <MotionConfig reducedMotion={reduce ? "always" : "user"}>{children}</MotionConfig>;
}
