"use client";

import { useEffect, useRef } from "react";

const FONT_SIZE = 16;
const FRAME_INTERVAL = 50;
const TRAIL_ALPHA = 0.1;

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let previousFrame = 0;
    let columns: number[] = [];
    let active = false;

    const profileRequestsReducedMotion = () =>
      document.documentElement.dataset.motion === "reduce";

    const shouldAnimate = () =>
      !reducedMotion.matches &&
      !profileRequestsReducedMotion() &&
      document.visibilityState === "visible";

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.font = `${FONT_SIZE}px var(--font-geist-mono), monospace`;
      context.textAlign = "center";
      context.textBaseline = "top";

      const columnCount = Math.ceil(width / FONT_SIZE);
      columns = Array.from(
        { length: columnCount },
        (_, index) => columns[index] ?? -Math.random() * (height / FONT_SIZE),
      );
      context.clearRect(0, 0, width, height);
    };

    const draw = (timestamp: number) => {
      if (!active) return;

      if (timestamp - previousFrame >= FRAME_INTERVAL) {
        previousFrame = timestamp;
        const styles = getComputedStyle(document.documentElement);
        const ink = styles.getPropertyValue("--ink").trim() || "#080a10";
        const defense = styles.getPropertyValue("--defense").trim() || "#4ae8b8";
        const accent = styles.getPropertyValue("--accent").trim() || "#d6ff4a";

        context.globalAlpha = TRAIL_ALPHA;
        context.fillStyle = ink;
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        context.globalAlpha = 1;

        columns.forEach((row, column) => {
          const x = column * FONT_SIZE + FONT_SIZE / 2;
          const y = row * FONT_SIZE;
          const value = Math.random() > 0.5 ? "1" : "0";

          context.globalAlpha = 0.25 + Math.random() * 0.45;
          context.fillStyle = Math.random() > 0.94 ? accent : defense;
          context.fillText(value, x, y);

          if (y > window.innerHeight && Math.random() > 0.975) {
            columns[column] = -Math.random() * 16;
          } else {
            columns[column] = row + 1;
          }
        });

        context.globalAlpha = 1;
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const syncAnimation = () => {
      const nextActive = shouldAnimate();
      if (nextActive === active) return;

      active = nextActive;
      window.cancelAnimationFrame(animationFrame);
      if (active) {
        previousFrame = 0;
        animationFrame = window.requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    resize();
    syncAnimation();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", syncAnimation);
    reducedMotion.addEventListener("change", syncAnimation);

    const motionPreferenceObserver = new MutationObserver(syncAnimation);
    motionPreferenceObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", syncAnimation);
      reducedMotion.removeEventListener("change", syncAnimation);
      motionPreferenceObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-background" aria-hidden="true" />;
}
