import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

// "$5 Million" → ["$", "5", " Million"], "−28%" → ["−", "28", "%"]
const NUMERIC = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/;

/**
 * Counts the leading number in a stat string up from zero when it scrolls into
 * view, keeping any prefix/suffix and the original decimal places. Strings
 * without a number render as-is.
 */
export function CountUp({
  value,
  duration = 1.4,
}: {
  value: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const match = value.match(NUMERIC);

  useEffect(() => {
    if (!match || !inView || reduce || !ref.current) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num);
    const decimals = num.split(".")[1]?.length ?? 0;
    const el = ref.current;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
    // match is derived from value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, duration]);

  if (!match) return <>{value}</>;

  const [, prefix, num, suffix] = match;
  const zero = (0).toFixed(num.split(".")[1]?.length ?? 0);
  return (
    <span ref={ref} className="tabular-nums">
      {reduce ? value : `${prefix}${zero}${suffix}`}
    </span>
  );
}
