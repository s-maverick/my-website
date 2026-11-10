import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RevealText } from "./RevealText";

/**
 * Section header: a numbered mono label ("02 ── EXPERIENCE"), a large title
 * that reveals word by word, and an optional lede passed as children.
 * `size="md"` is for sub-sections inside a section.
 */
export function SectionHeading({
  index,
  label,
  title,
  size = "lg",
  className,
  children,
}: {
  index?: string;
  label?: string;
  title: string;
  size?: "lg" | "md";
  className?: string;
  children?: ReactNode;
}) {
  const Title = size === "lg" ? "h2" : "h3";

  return (
    <div className={cn("mb-12 max-w-3xl", className)}>
      {label && (
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          {index && <span className="text-accent">{index}</span>}
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px 0px" }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="h-px w-10 origin-left bg-gradient-to-r from-accent to-accent/0"
          />
          {label}
        </motion.p>
      )}
      <Title
        className={cn(
          "font-display font-medium tracking-[-0.03em] text-foreground",
          size === "lg"
            ? "text-4xl leading-[1.05] sm:text-5xl"
            : "text-2xl leading-tight sm:text-3xl",
        )}
      >
        <RevealText text={title} />
      </Title>
      {children && (
        <div className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {children}
        </div>
      )}
    </div>
  );
}
