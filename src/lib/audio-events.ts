export const AUDIO_OUTCOME_EVENT = "shieldpath:audio-outcome";

export type AudioOutcome = "success" | "error";
export type AudioOutcomeDetail = { outcome: AudioOutcome; id: string };

export function emitAudioOutcome(detail: AudioOutcomeDetail) {
  window.dispatchEvent(new CustomEvent<AudioOutcomeDetail>(AUDIO_OUTCOME_EVENT, { detail }));
}
