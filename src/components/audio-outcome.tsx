"use client";

import { useEffect } from "react";
import { emitAudioOutcome, type AudioOutcome as Outcome } from "@/lib/audio-events";

export function AudioOutcome({ outcome, id }: { outcome: Outcome; id: string }) {
  useEffect(() => {
    const key = `shieldpath-audio:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    emitAudioOutcome({ outcome, id });
  }, [id, outcome]);

  return null;
}
