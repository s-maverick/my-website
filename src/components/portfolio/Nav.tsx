import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Magnetic } from "./Magnetic";

const items = [
  { href: "#philosophy", label: "philosophy" },
  { href: "#experience", label: "experience" },
  { href: "#education", label: "education" },
  { href: "#work", label: "projects" },
  { href: "#stack", label: "stack" },
  { href: "#contact", label: "contact" },
];

/** Tracks which section crosses the middle of the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const visible = new Set<string>();
    const targets = items
      .map((i) => document.getElementById(i.href.slice(1)))
      .filter((el): el is HTMLElement => !!el);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // #education is nested in #experience — prefer the later (more specific) match
        const current = [...items].reverse().find((i) => visible.has(i.href.slice(1)));
        setActive(current?.href ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return active;
}

export function Nav() {
  const active = useActiveSection();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 font-mono text-sm">
        <a href="#top" className="flex items-center gap-2 text-foreground">
          <span className="text-accent">$</span>
          <span className="font-display">sangam.patil</span>
          <span className="caret" aria-hidden />
        </a>
        <nav className="hidden items-center gap-6 text-xs uppercase tracking-wider text-muted-foreground md:flex">
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              aria-current={active === i.href ? "location" : undefined}
              className={`relative py-1 transition-colors hover:text-accent ${
                active === i.href ? "text-accent" : ""
              }`}
            >
              {i.label}
              {active === i.href && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent shadow-[0_0_8px_var(--color-accent)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </a>
          ))}
        </nav>
        <Magnetic strength={0.4}>
          <a
            href="#contact"
            className="block rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            hire_me()
          </a>
        </Magnetic>
      </div>
    </header>
  );
}
