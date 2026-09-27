import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINES = [
  "> booting sangam.os v2.6",
  "[ ok ] mounting /experience /education /projects",
  "[ ok ] compiling neural_core.glsl",
  "[ ok ] loading 16 shipped projects",
  "[ ok ] calibrating vibes",
  "> ready.",
];

const STEP_MS = 150;
const HOLD_MS = 280;
const STORAGE_KEY = "sangam.booted";

/** Show the intro once per browser session, and never to reduced-motion users. */
export function shouldShowBoot() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
}

/**
 * Terminal boot overlay that types a few lines, then collapses like a CRT
 * powering on. Click / any key skips it. Locks scroll while visible.
 */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode — intro just replays next visit */
    }
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const timers = LINES.map((_, i) =>
      window.setTimeout(() => setShown(i + 1), i * STEP_MS),
    );
    timers.push(
      window.setTimeout(() => setOpen(false), LINES.length * STEP_MS + HOLD_MS),
    );

    const skip = () => setOpen(false);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      html.style.overflow = prevOverflow;
    };
  }, []);

  const progress = Math.round((shown / LINES.length) * 100);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {open && (
        <motion.div
          key="boot"
          role="status"
          aria-label="loading"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background px-6"
          exit={{
            scaleY: [1, 0.004, 0.004],
            scaleX: [1, 1, 0],
            // flash only once collapsed to a line, like a CRT
            filter: ["brightness(1)", "brightness(1)", "brightness(5)"],
            transition: { duration: 0.55, times: [0, 0.55, 1], ease: "easeIn" },
          }}
        >
          <div className="w-full max-w-lg font-mono text-xs sm:text-sm">
            {LINES.slice(0, shown).map((l, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={
                  l.startsWith("[ ok ]")
                    ? "text-muted-foreground"
                    : i === LINES.length - 1
                      ? "text-accent"
                      : "text-foreground"
                }
              >
                {l.startsWith("[ ok ]") ? (
                  <>
                    <span className="text-accent">[ ok ]</span>
                    {l.slice(6)}
                  </>
                ) : (
                  l
                )}
              </motion.div>
            ))}
            <div className="mt-5 h-px w-full overflow-hidden bg-border">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-2"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{progress}%</span>
              <span>click to skip</span>
            </div>
          </div>
          {/* CRT scanlines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent 0 2px, oklch(0 0 0 / 0.35) 2px 3px)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
