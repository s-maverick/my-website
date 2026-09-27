import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const loadScene = () => import("./scene/Scene3D");
const Scene3D = lazy(loadScene);

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The background is decoration — if it fails, drop it instead of the page. */
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D background disabled:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Fixed full-viewport WebGL layer behind the page. three.js is code-split and
 * only fetched when WebGL exists and the visitor hasn't asked for reduced motion.
 * `active` gates mounting so the big-bang intro plays after the boot sequence.
 */
export function Background3D({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [supported, setSupported] = useState(false);
  const [lite, setLite] = useState(false);
  // flips when the scene renders its first frame (the explosion)
  const [detonated, setDetonated] = useState(false);

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

  // never leave the singularity hanging if the scene can't start
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setDetonated(true), 5000);
    return () => clearTimeout(id);
  }, [active]);

  if (reduce || !supported || !active) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-0",
        detonated && "animate-rgb-split",
      )}
    >
      {/* bridges the gap between the boot screen's collapse and the first WebGL frame */}
      {!detonated && (
        <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-white shadow-[0_0_24px_8px_var(--color-accent)]" />
      )}
      <SceneBoundary>
        <Suspense fallback={null}>
          <Scene3D lite={lite} onStart={() => setDetonated(true)} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
