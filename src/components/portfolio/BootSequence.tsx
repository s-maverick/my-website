import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// typed on a timer…
const LINES = [
  "> booting sangam.os v2.6",
  "[ ok ] mounting /experience /education /projects",
  "[ ok ] indexing shipped projects",
  "[ ok ] calibrating vibes",
];
// …while this one is real: it stays pending until the 3D layer has drawn a frame
const WORK = "compiling shaders: mlp · soc · git_graph";
const READY = "> ready.";

const STEP_MS = 150;
const HOLD_MS = 280;
// never hold the page hostage if the 3D layer is slow or can't start
const MAX_WAIT_MS = 6000;
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
 * Terminal boot overlay. It doubles as the real loading screen: the page
 * underneath (including the WebGL scene) sets itself up while this covers it,
 * and the last step only completes once `ready` says that work is finished.
 * Then it collapses like a CRT. Click / any key skips it. Locks scroll while visible.
 */
export function BootSequence({
  ready,
  onDone,
}: {
  ready: boolean;
  onDone: () => void;
}) {
  const [typed, setTyped] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
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

    // +1: the pending "compiling shaders" line appears after the scripted ones
    const timers = Array.from({ length: LINES.length + 1 }, (_, i) =>
      window.setTimeout(() => setTyped(i + 1), i * STEP_MS),
    );
    timers.push(window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS));

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

  const workShown = typed > LINES.length;
  const done = workShown && (ready || timedOut);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setOpen(false), HOLD_MS);
    return () => clearTimeout(id);
  }, [done]);

  const steps = LINES.length + 2;
  const progress = Math.round(
    ((Math.min(typed, LINES.length + 1) + (done ? 1 : 0)) / steps) * 100,
  );

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
            {LINES.slice(0, typed).map((l) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={
                  l.startsWith("[ ok ]")
                    ? "text-muted-foreground"
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
            {workShown && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="text-muted-foreground"
              >
                {done ? (
                  <span className="text-accent">[ ok ]</span>
                ) : (
                  // CSS animation: keeps pulsing even while the main thread is busy
                  <span className="animate-pulse text-accent-2">[ .. ]</span>
                )}{" "}
                {WORK}
              </motion.div>
            )}
            {done && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="text-accent"
              >
                {READY}
              </motion.div>
            )}
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
