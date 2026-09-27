import { useEffect, useMemo, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01λΣ∂∇$%&";

function scramble(text: string) {
  return text.replace(/\S/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
}

/**
 * Text that "decrypts" from random glyphs left-to-right when scrolled into view
 * (or on mount with `immediate` — remount with a new key to replay).
 * Screen readers get the plain text; the animated copy is aria-hidden.
 * Designed for monospace fonts, where glyph swaps don't reflow the line.
 */
export function ScrambleText({
  text,
  duration = 900,
  immediate = false,
  className,
}: {
  text: string;
  duration?: number;
  immediate?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const play = immediate || inView;
  const initial = useMemo(
    () => (reduce ? text : scramble(text)),
    [text, reduce],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !play || reduce) return;

    const chars = [...text];
    // each char resolves at a staggered time, with a little jitter
    const resolveAt = chars.map(
      (_, i) =>
        (i / chars.length) * duration * 0.75 + Math.random() * duration * 0.25,
    );
    const start = performance.now();
    let raf = 0;
    let lastSwap = 0;

    const frame = (now: number) => {
      const t = now - start;
      if (now - lastSwap > 45 || t >= duration) {
        lastSwap = now;
        el.textContent = chars
          .map((c, i) =>
            c === " " || t >= resolveAt[i]
              ? c
              : GLYPHS[(Math.random() * GLYPHS.length) | 0],
          )
          .join("");
      }
      if (t < duration) raf = requestAnimationFrame(frame);
      else el.textContent = text;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [play, reduce, text, duration]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {initial}
      </span>
    </span>
  );
}
