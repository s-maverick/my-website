import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

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
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("3D background disabled:", error);
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Fixed full-viewport WebGL layer behind the page. three.js is code-split and
 * only fetched when WebGL exists and the visitor hasn't asked for reduced motion.
 * The scene is created straight away so all of its setup cost (context,
 * geometry, shader compilation) is paid while the boot screen still covers the
 * page; `active` only tells it when to start the big-bang intro.
 */
export function Background3D({
  active,
  onReady,
}: {
  active: boolean;
  /** called once the scene has drawn its first frame, or can't/won't run at all */
  onReady: () => void;
}) {
  const reduce = useReducedMotion();
  const [supported, setSupported] = useState(false);
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const ok = !reduce && hasWebGL();
    setSupported(ok);
    if (!ok) {
      onReady(); // nothing to wait for
      return;
    }
    // warm the chunk while the boot sequence is still on screen
    void loadScene();
    setLite(
      window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4,
    );
  }, [reduce, onReady]);

  if (reduce || !supported) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <SceneBoundary onFail={onReady}>
        <Suspense fallback={null}>
          <Scene3D lite={lite} active={active} onReady={onReady} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
