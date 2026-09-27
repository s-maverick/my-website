import { motion, useScroll, useSpring } from "framer-motion";

/** Thin accent → green bar across the top edge that fills with page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-accent via-accent to-accent-2 shadow-[0_0_12px_var(--color-accent)]"
      style={{ scaleX }}
    />
  );
}
