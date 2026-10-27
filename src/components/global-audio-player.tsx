"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_OUTCOME_EVENT, type AudioOutcomeDetail } from "@/lib/audio-events";

type ThemeId = "terror" | "sombrio" | "cyber" | "divertido" | "custom";
type BuiltInTheme = Exclude<ThemeId, "custom">;
type PlayerStatus = "starting" | "playing" | "paused" | "blocked" | "error";

const themes: { id: BuiltInTheme; name: string; icon: string; description: string; src: string }[] = [
  { id: "terror", name: "Horror ambiental", icon: "☾", description: "Atmosfera de terror para entrada e início", src: "/audio/horror-loop.mp3" },
  { id: "sombrio", name: "Hora mais sombria", icon: "◉", description: "Suspense cinematográfico e dramático", src: "/audio/darkest-hour.mp3" },
  { id: "cyber", name: "Infiltração cyber", icon: "⌁", description: "Loop eletrônico para as trilhas", src: "/audio/wye.mp3" },
  { id: "divertido", name: "Aventura divertida", icon: "✦", description: "Música alegre e leve", src: "/audio/happy-clappy.mp3" },
];

const successSounds = ["/audio/ui/ui_ogg/Ding.ogg", "/audio/ui/ui_ogg/chimes.ogg", "/audio/ui/ui_ogg/ding_deep.ogg"];
const errorSounds = ["/audio/ui/ui_ogg/negative_sound.ogg", "/audio/ui/ui_ogg/negative_sound2.ogg", "/audio/ui/ui_ogg/alarm2.ogg"];
const STORAGE_KEY = "shieldpath-audio-v2";

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function themeForPath(pathname: string): BuiltInTheme {
  if (pathname.startsWith("/lab/")) return "sombrio";
  if (pathname.startsWith("/trilha/")) return "cyber";
  if (pathname === "/perfil" || pathname === "/squad") return "divertido";
  return "terror";
}

export function GlobalAudioPlayer() {
  const pathname = usePathname();
  const [manualTheme, setManualTheme] = useState<ThemeId>("terror");
  const [autoMode, setAutoMode] = useState(true);
  const [volume, setVolume] = useState(0.55);
  const [status, setStatus] = useState<PlayerStatus>("starting");
  const [expanded, setExpanded] = useState(false);
  const [customName, setCustomName] = useState("");
  const backgroundAudio = useRef<HTMLAudioElement | null>(null);
  const customUrl = useRef<string | null>(null);
  const desiredPlaying = useRef(true);
  const volumeRef = useRef(volume);
  const effectiveTheme: ThemeId = autoMode ? themeForPath(pathname) : manualTheme;
  const selected = effectiveTheme === "custom" ? null : themes.find((item) => item.id === effectiveTheme)!;

  const playBackground = useCallback(async () => {
    desiredPlaying.current = true;
    const audio = backgroundAudio.current;
    if (!audio?.src) return;
    try {
      audio.volume = volumeRef.current;
      await audio.play();
      setStatus("playing");
    } catch {
      setStatus("blocked");
    }
  }, []);

  const pause = useCallback(() => {
    desiredPlaying.current = false;
    backgroundAudio.current?.pause();
    setStatus("paused");
  }, []);

  useEffect(() => {
    let restoreTimer: number | undefined;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { theme?: BuiltInTheme; volume?: number; autoMode?: boolean } | null;
      const savedTheme = themes.some((item) => item.id === saved?.theme) ? saved!.theme! : "terror";
      const savedVolume = clampVolume(typeof saved?.volume === "number" ? saved.volume : 0.55);
      volumeRef.current = savedVolume;
      restoreTimer = window.setTimeout(() => {
        setManualTheme(savedTheme);
        setAutoMode(saved?.autoMode ?? true);
        setVolume(savedVolume);
        setExpanded(false);
      }, 0);
    } catch {}

    const audioAtMount = backgroundAudio.current;
    const unlock = () => { if (desiredPlaying.current) void playBackground(); };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      if (restoreTimer !== undefined) window.clearTimeout(restoreTimer);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audioAtMount?.pause();
      if (customUrl.current) URL.revokeObjectURL(customUrl.current);
    };
  }, [playBackground]);

  useEffect(() => {
    const audio = backgroundAudio.current;
    if (!audio) return;
    const nextSource = effectiveTheme === "custom" ? customUrl.current : selected?.src;
    if (!nextSource) return;
    audio.src = nextSource;
    audio.loop = true;
    audio.volume = volumeRef.current;
    audio.load();
    if (desiredPlaying.current) {
      void audio.play().then(() => setStatus("playing")).catch(() => setStatus("blocked"));
    }
  }, [effectiveTheme, selected?.src]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        theme: manualTheme === "custom" ? "terror" : manualTheme,
        volume,
        autoMode,
      }));
    } catch {}
  }, [autoMode, manualTheme, volume]);

  useEffect(() => {
    const onOutcome = (event: Event) => {
      if (!desiredPlaying.current) return;
      const { outcome } = (event as CustomEvent<AudioOutcomeDetail>).detail;
      const choices = outcome === "success" ? successSounds : errorSounds;
      const effect = new Audio(choices[Math.floor(Math.random() * choices.length)]);
      effect.volume = Math.min(1, volumeRef.current * 1.25);
      void effect.play().catch(() => undefined);
    };
    window.addEventListener(AUDIO_OUTCOME_EVENT, onOutcome);
    return () => window.removeEventListener(AUDIO_OUTCOME_EVENT, onOutcome);
  }, []);

  const chooseTheme = (next: BuiltInTheme) => {
    setAutoMode(false);
    setManualTheme(next);
    desiredPlaying.current = true;
  };

  const selectCustomFile = (file: File | undefined) => {
    if (!file) return;
    if (customUrl.current) URL.revokeObjectURL(customUrl.current);
    customUrl.current = URL.createObjectURL(file);
    setCustomName(file.name);
    setAutoMode(false);
    setManualTheme("custom");
    desiredPlaying.current = true;
  };

  const updateVolume = (next: number) => {
    const safe = clampVolume(next);
    volumeRef.current = safe;
    setVolume(safe);
    if (backgroundAudio.current) backgroundAudio.current.volume = safe;
  };

  const testSound = () => {
    const effect = new Audio(successSounds[0]);
    effect.volume = Math.min(1, volumeRef.current * 1.25);
    void effect.play().then(() => setStatus(backgroundAudio.current?.paused ? "paused" : "playing")).catch(() => setStatus("blocked"));
  };

  const currentTheme = effectiveTheme === "custom" ? { name: customName || "Sua música", icon: "♫" } : selected!;
  const statusText = status === "playing" ? "Tocando" : status === "blocked" ? "Clique em reproduzir para liberar" : status === "starting" ? "Preparando áudio" : status === "error" ? "Áudio indisponível" : "Pausado";

  return (
    <aside className="global-audio-player" aria-label="Player de música ambiente" data-playing={status === "playing"} data-expanded={expanded}>
      <audio ref={backgroundAudio} loop onEnded={() => setStatus("paused")} onError={() => setStatus("error")} />
      {!expanded ? (
        <button type="button" onClick={() => setExpanded(true)} aria-label="Abrir player de música" className="audio-launcher grid size-12 place-items-center rounded-full bg-accent text-xl font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink">♫</button>
      ) : <>
        <div className="flex min-w-0 items-center gap-3">
          <span className="audio-disc grid size-11 shrink-0 place-items-center rounded-full border border-info/35 bg-info/10 text-lg text-info" aria-hidden>{currentTheme.icon}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-text">{currentTheme.name}</p><p className="truncate text-xs text-muted">{statusText}</p></div>
          <button type="button" onClick={status === "playing" ? pause : playBackground} aria-label={status === "playing" ? "Pausar música" : "Reproduzir música"} className="grid size-11 shrink-0 place-items-center rounded-full bg-accent font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink">{status === "playing" ? "Ⅱ" : "▶"}</button>
          <button type="button" onClick={() => setExpanded(false)} aria-expanded="true" aria-label="Ocultar player" className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info">×</button>
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <label className="flex items-center gap-3 text-xs font-semibold text-muted"><span className="w-16">Volume</span><span aria-hidden>🔉</span><input type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={(event) => updateVolume(Number(event.target.value) / 100)} aria-label="Volume da música" className="audio-volume min-w-0 flex-1" /><output className="w-9 text-right font-mono text-text">{Math.round(volume * 100)}%</output></label>
          <button type="button" onClick={testSound} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-info/40 bg-info/10 px-3 text-xs font-bold text-info transition hover:border-info focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info">🔊 Testar efeito real</button>
          <fieldset className="mt-4"><legend className="text-xs font-bold uppercase tracking-wide text-muted">Escolher clima real</legend>
            <button type="button" aria-pressed={autoMode} onClick={() => { setAutoMode(true); desiredPlaying.current = true; }} className="mt-2 min-h-11 w-full rounded-xl border border-accent/40 bg-accent/10 px-3 text-left text-xs font-bold text-accent transition hover:border-accent aria-pressed:bg-accent aria-pressed:text-ink">↻ Automático conforme a tela</button>
            <div className="mt-2 grid grid-cols-2 gap-2">{themes.map((item) => <button key={item.id} type="button" aria-pressed={!autoMode && manualTheme === item.id} onClick={() => chooseTheme(item.id)} title={item.description} className="min-h-11 rounded-xl border border-line bg-ink/55 px-3 text-left text-xs font-semibold text-text transition hover:border-info/60 aria-pressed:border-info aria-pressed:bg-info/10 aria-pressed:text-info"><span aria-hidden className="mr-2">{item.icon}</span>{item.name}</button>)}</div>
          </fieldset>
          <label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-line-strong px-3 text-xs font-bold text-muted transition hover:border-accent hover:text-text focus-within:ring-2 focus-within:ring-accent"><input type="file" accept="audio/*" className="sr-only" onChange={(event) => selectCustomFile(event.target.files?.[0])} />♫ Usar uma música do dispositivo</label>
          {effectiveTheme === "custom" ? <p className="mt-2 truncate text-xs text-info" title={customName}>{customName}</p> : null}
          <p className="mt-3 text-[11px] leading-4 text-muted">Músicas e efeitos CC0 do OpenGameArt. Fontes registradas em public/audio/LICENSES.txt.</p>
        </div>
      </>}
    </aside>
  );
}
