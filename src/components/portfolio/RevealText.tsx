import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Heading text that rises into place word by word from behind a mask when it
 * scrolls into view. Works with any font (unlike ScrambleText, which needs
 * monospace). Screen readers get the plain sentence.
 */
export function RevealText({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i}>
            {/* the padding keeps descenders (g, y, p) inside the mask */}
            <span className="-my-[0.14em] inline-block overflow-hidden py-[0.14em] align-bottom">
              <motion.span
                className="inline-block"
                initial={{ y: "115%" }}
                animate={inView ? { y: 0 } : undefined}
                transition={{
                  duration: 0.75,
                  delay: delay + i * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}
