import { lazy, Suspense, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const loadScene = () => import("./Scene3D");
const Scene3D = lazy(loadScene);

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Fixed full-viewport WebGL layer behind the page. three.js is code-split and
 * only fetched when WebGL exists and the visitor hasn't asked for reduced motion.
 * `active` gates mounting so the core's fly-in plays after the boot sequence.
 */
export function Background3D({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [supported, setSupported] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const ok = hasWebGL();
    setSupported(ok);
    if (!ok) return;
    // warm the chunk while the boot sequence is still on screen
    void loadScene();
    setLite(
      window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4,
    );
  }, [reduce]);

  if (reduce || !supported || !active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 animate-in fade-in duration-1000"
    >
      <Suspense fallback={null}>
        <Scene3D lite={lite} />
      </Suspense>
    </div>
  );
}
