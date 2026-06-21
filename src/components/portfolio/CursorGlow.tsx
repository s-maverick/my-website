import { useEffect, useRef, useState } from "react";

/**
 * Two-layer cursor:
 *  - a large soft neon spotlight that follows the pointer with easing
 *  - a small precise dot that snaps to the real cursor
 * Hidden on touch / coarse pointers.
 */
export function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    setEnabled(mq.matches);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let gx = tx;
    let gy = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${tx - 4}px, ${ty - 4}px, 0)`;
      }
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest(
        "a, button, [role='button'], input, textarea, [data-cursor='hot']",
      );
      setHot(interactive);
    };

    const tick = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      if (glow.current) {
        glow.current.style.transform = `translate3d(${gx - 200}px, ${gy - 200}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
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
            "radial-gradient(circle, oklch(0.78 0.19 145 / 0.35) 0%, oklch(0.78 0.19 145 / 0.08) 40%, transparent 70%)",
        }}
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[61] h-2 w-2 rounded-full transition-[width,height,background-color,box-shadow] duration-150"
        style={{
          backgroundColor: hot ? "oklch(0.78 0.19 145)" : "oklch(0.96 0.005 250)",
          boxShadow: hot
            ? "0 0 16px oklch(0.78 0.19 145 / 0.9), 0 0 32px oklch(0.78 0.19 145 / 0.5)"
            : "0 0 8px oklch(0.96 0.005 250 / 0.6)",
          width: hot ? 14 : 8,
          height: hot ? 14 : 8,
        }}
      />
    </>
  );
}
