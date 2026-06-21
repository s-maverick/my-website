import { useEffect, useRef } from "react";

/**
 * Subtle background canvas: drifting characters in the accent color.
 * Sits behind content, low opacity. Pauses when off-screen.
 */
const GLYPHS = "01{}<>[]()=>;:#$%&*+-/\\|λπΣ∂∇".split("");

export function CodeRain({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let cols = 0;
    let drops: number[] = [];
    const FONT_SIZE = 14;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / FONT_SIZE);
      drops = Array.from({ length: cols }, () =>
        Math.random() * (height / FONT_SIZE),
      );
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const draw = (t: number) => {
      if (!running) return;
      if (t - last < 70) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = t;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.fillStyle = "oklch(0.16 0.012 250 / 0.18)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${FONT_SIZE}px JetBrains Mono, monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
        const head = Math.random() > 0.975;
        ctx.fillStyle = head
          ? "oklch(0.95 0.05 145 / 0.9)"
          : "oklch(0.78 0.19 145 / 0.55)";
        ctx.fillText(ch, x, y);
        if (y > height && Math.random() > 0.96) drops[i] = 0;
        drops[i] += 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting;
        if (running) raf = requestAnimationFrame(draw);
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-[0.7] ${className}`}
    />
  );
}
