import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SphereTag = { label: string; group: number };

const AUTO_SPIN = 0.0035; // rad / frame around Y when idle
const PERSPECTIVE = 2.4; // lower = stronger depth

/**
 * DOM tag cloud laid out on a sphere. Idles in a slow spin, steers toward the
 * cursor while hovered, and can be flung by drag (mouse or touch) with inertia.
 * Tags in `activeGroup` light up; the rest dim.
 */
export function TagSphere({
  tags,
  activeGroup,
  className,
}: {
  tags: SphereTag[];
  activeGroup: number | null;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const reduce = useReducedMotion();

  // fibonacci points on the unit sphere — mutated in place as it rotates
  const points = useMemo(() => {
    const n = tags.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return tags.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      return { x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r };
    });
  }, [tags]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    let radius = el.clientWidth * 0.38;
    const ro = new ResizeObserver(() => (radius = el.clientWidth * 0.38));
    ro.observe(el);

    // angular velocity around X and Y axes
    let vx = 0;
    let vy = AUTO_SPIN;
    let hover: { x: number; y: number } | null = null;
    let drag: { x: number; y: number } | null = null;
    let visible = true;
    let raf = 0;

    const rotate = (ax: number, ay: number) => {
      const cx = Math.cos(ax),
        sx = Math.sin(ax);
      const cy = Math.cos(ay),
        sy = Math.sin(ay);
      for (const p of points) {
        // around X
        const y1 = p.y * cx - p.z * sx;
        const z1 = p.y * sx + p.z * cx;
        // around Y
        const x2 = p.x * cy + z1 * sy;
        const z2 = -p.x * sy + z1 * cy;
        p.x = x2;
        p.y = y1;
        p.z = z2;
      }
    };

    const paint = () => {
      points.forEach((p, i) => {
        const node = items.current[i];
        if (!node) return;
        const s = PERSPECTIVE / (PERSPECTIVE - p.z);
        const depth = (p.z + 1) / 2; // 0 back … 1 front
        node.style.transform = `translate(-50%, -50%) translate3d(${p.x * radius * s}px, ${p.y * radius * s}px, 0) scale(${s})`;
        node.style.opacity = String(0.2 + depth * 0.8);
        node.style.zIndex = String(Math.round(depth * 100));
        node.style.filter = depth < 0.35 ? `blur(${(0.35 - depth) * 3}px)` : "";
      });
    };

    const tick = () => {
      if (!drag) {
        const tx = hover ? -hover.y * 0.02 : 0;
        const ty = hover ? hover.x * 0.02 : AUTO_SPIN;
        vx += (tx - vx) * 0.04;
        vy += (ty - vy) * 0.04;
      }
      rotate(vx, vy);
      paint();
      if (visible) raf = requestAnimationFrame(tick);
    };

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: ((e.clientY - r.top) / r.height) * 2 - 1,
      };
    };
    const onMove = (e: PointerEvent) => {
      if (drag) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        vy = dx * 0.006;
        vx = -dy * 0.006;
        drag = { x: e.clientX, y: e.clientY };
      } else if (e.pointerType === "mouse") {
        hover = local(e);
      }
    };
    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY };
      vx = 0;
      vy = 0;
      el.setPointerCapture(e.pointerId);
    };
    const onUp = () => (drag = null);
    const onLeave = () => (hover = null);

    paint();
    if (!reduce) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
      el.addEventListener("pointerleave", onLeave);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !reduce;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [points, reduce]);

  return (
    <div
      ref={box}
      className={cn(
        "relative aspect-square w-full touch-pan-y select-none",
        !reduce && "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {tags.map((t, i) => (
        <span
          key={t.label}
          ref={(n) => {
            items.current[i] = n;
          }}
          className={cn(
            "absolute left-1/2 top-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[11px] transition-colors duration-300 will-change-transform sm:text-xs",
            activeGroup === null
              ? "text-foreground"
              : activeGroup === t.group
                ? "border border-accent/50 bg-accent/15 text-accent shadow-[0_0_14px_oklch(0.80_0.15_220/0.45)]"
                : "text-muted-foreground/50",
          )}
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}
