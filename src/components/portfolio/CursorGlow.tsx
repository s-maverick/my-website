import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/hooks/use-fine-pointer";

/**
 * Three-layer cursor:
 *  - a large soft neon spotlight that follows the pointer with easing
 *  - a thin ring that trails behind and expands over interactive elements
 *  - a small precise dot that snaps to the real cursor
 * Clicking emits a shockwave. Hidden on touch / coarse pointers.
 */
export function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const enabled = useFinePointer();
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let gx = tx;
    let gy = ty;
    let rx = tx;
    let ry = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      }
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest(
        "a, button, [role='button'], input, textarea, [data-cursor='hot']",
      );
      setHot(interactive);
    };

    const onDown = (e: PointerEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const wave = document.createElement("div");
      wave.setAttribute("aria-hidden", "true");
      wave.className =
        "pointer-events-none fixed z-[61] size-10 rounded-full border border-accent";
      wave.style.left = `${e.clientX - 20}px`;
      wave.style.top = `${e.clientY - 20}px`;
      wave.style.boxShadow = "0 0 18px var(--color-accent)";
      document.body.appendChild(wave);
      wave
        .animate(
          [
            { transform: "scale(0.2)", opacity: 0.9 },
            { transform: "scale(2.6)", opacity: 0 },
          ],
          { duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
        )
        .finished.finally(() => wave.remove());
    };

    const tick = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      rx += (tx - rx) * 0.22;
      ry += (ty - ry) * 0.22;
      if (glow.current) {
        glow.current.style.transform = `translate3d(${gx - 200}px, ${gy - 200}px, 0)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] h-[400px] w-[400px] rounded-full opacity-70 mix-blend-screen blur-2xl transition-opacity"
        style={{
          background:
            "radial-gradient(circle, oklch(0.80 0.15 220 / 0.35) 0%, oklch(0.80 0.15 220 / 0.08) 40%, transparent 70%)",
        }}
      />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[61] rounded-full border transition-[width,height,border-color,background-color] duration-200"
        style={{
          width: hot ? 44 : 28,
          height: hot ? 44 : 28,
          borderColor: hot ? "oklch(0.72 0.21 28 / 0.8)" : "oklch(0.80 0.15 220 / 0.45)",
          backgroundColor: hot ? "oklch(0.72 0.21 28 / 0.08)" : "transparent",
        }}
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[61] rounded-full transition-[width,height,background-color,box-shadow] duration-150"
        style={{
          backgroundColor: hot ? "oklch(0.72 0.21 28)" : "oklch(0.96 0.005 250)",
          boxShadow: hot
            ? "0 0 16px oklch(0.72 0.21 28 / 0.9), 0 0 32px oklch(0.72 0.21 28 / 0.5)"
            : "0 0 8px oklch(0.80 0.005 250 / 0.6)",
          width: hot ? 10 : 8,
          height: hot ? 10 : 8,
        }}
      />
    </>
  );
}
