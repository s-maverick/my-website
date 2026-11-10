import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Menu, X } from "lucide-react";
import { site } from "@/lib/site";
import { Magnetic } from "./Magnetic";
import { SocialLinks } from "./SocialLinks";

const items = [
  { href: "#about", label: "about" },
  { href: "#experience", label: "experience" },
  { href: "#work", label: "work" },
  { href: "#research", label: "research" },
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
        // if two sections touch the band at once, the later one wins
        const current = [...items]
          .reverse()
          .find((i) => visible.has(i.href.slice(1)));
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
  const [open, setOpen] = useState(false);

  // phone menu: lock the page behind it, close on Escape or when resized to desktop
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 768px)");
    const onWide = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 font-mono text-sm">
          <a
            href="#top"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 text-foreground"
          >
            <span className="text-accent">$</span>
            <span>sangam.patil</span>
            <span className="caret" aria-hidden />
          </a>

          <nav
            aria-label="Sections"
            className="hidden items-center gap-6 text-xs uppercase tracking-wider text-muted-foreground md:flex"
          >
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

          <div className="flex items-center gap-2">
            {site.resumeUrl && (
              <a
                href={site.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-accent sm:inline-flex"
              >
                <FileText className="size-3.5" />
                résumé
              </a>
            )}
            <Magnetic strength={0.4}>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="block rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                hire_me()
              </a>
            </Magnetic>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-accent hover:text-accent md:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* phone menu: sits under the header (z-30 < z-40) so the close button stays put */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav
              aria-label="Sections"
              className="flex h-full flex-col justify-between px-6 pb-16 pt-24"
            >
              <ul>
                {items.map((it, i) => (
                  <motion.li
                    key={it.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.04 + i * 0.04,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <a
                      href={it.href}
                      onClick={() => setOpen(false)}
                      aria-current={active === it.href ? "location" : undefined}
                      className={`flex items-baseline gap-4 border-b border-border py-4 font-display text-3xl font-medium capitalize tracking-[-0.03em] ${
                        active === it.href ? "text-accent" : "text-foreground"
                      }`}
                    >
                      <span className="font-mono text-xs tracking-normal text-accent">
                        0{i + 1}
                      </span>
                      {it.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <SocialLinks className="-ml-2" />
                {site.resumeUrl && (
                  <a
                    href={site.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    <FileText className="size-4" />
                    résumé
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
