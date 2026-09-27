import {
  useCallback,
  useRef,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/hooks/use-fine-pointer";

type TiltCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  as?: "div" | "article";
  /** max rotation in degrees */
  max?: number;
  glare?: boolean;
};

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Card that tilts toward the cursor in 3D with a light glare that tracks the
 * pointer. Composes with framer entrance props (initial / whileInView), since
 * framer merges the transforms. Flat on touch and for reduced motion.
 */
export function TiltCard({
  as = "div",
  max = 7,
  glare = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  style,
  ref: externalRef,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // React 19 passes ref as a prop (e.g. from AnimatePresence popLayout) — keep ours too
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      assignRef(externalRef as Ref<HTMLDivElement> | undefined, node);
    },
    [externalRef],
  );
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const enabled = fine && !reduce;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const lift = useSpring(1, SPRING);

  const gx = useTransform(px, (v) => v * 100);
  const gy = useTransform(py, (v) => v * 100);
  const glareBg = useMotionTemplate`radial-gradient(480px circle at ${gx}% ${gy}%, oklch(0.80 0.15 220 / 0.13), transparent 45%)`;
  const glareOpacity = useSpring(0, SPRING);

  const Comp = as === "article" ? motion.article : motion.div;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    lift.set(1.015);
    glareOpacity.set(1);
  };

  const handleLeave = (e: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    px.set(0.5);
    py.set(0.5);
    lift.set(1);
    glareOpacity.set(0);
  };

  return (
    <Comp
      ref={setRef}
      className={cn("relative", className)}
      style={
        enabled
          ? {
              ...style,
              rotateX,
              rotateY,
              scale: lift,
              transformPerspective: 1000,
            }
          : style
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...rest}
    >
      {children}
      {enabled && glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBg, opacity: glareOpacity }}
        />
      )}
    </Comp>
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}
