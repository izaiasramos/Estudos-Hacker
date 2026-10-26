"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Dispara a animação uma única vez quando a cena entra na área visível.
 * Sem JavaScript, `data-scene-ready` não existe e o CSS mantém todo o conteúdo visível.
 */
export function SceneReveal({
  children,
  sceneId,
  tone,
  labelledBy,
}: {
  children: ReactNode;
  sceneId: string;
  tone: string;
  labelledBy: string;
}) {
  const figureRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;

    setReady(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12%", threshold: 0.15 },
    );

    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={figureRef}
      className="unit-scene"
      data-scene-id={sceneId}
      data-scene-tone={tone}
      data-scene-ready={ready || undefined}
      data-scene-visible={visible || undefined}
      aria-labelledby={labelledBy}
    >
      {children}
    </figure>
  );
}
