import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrambleText } from "./ScrambleText";

/** `// eyebrow` + decrypting h2 used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("mb-12", className)}>
      <motion.p
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 font-mono text-sm text-accent"
      >
        {eyebrow}
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-px w-16 origin-left bg-gradient-to-r from-accent to-transparent"
        />
      </motion.p>
      <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
        <ScrambleText text={title} />
      </h2>
      {children}
    </div>
  );
}
