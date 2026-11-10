import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, FileText } from "lucide-react";
import { site } from "@/lib/site";
import { CodeRain } from "./CodeRain";
import { CountUp } from "./CountUp";
import { Magnetic } from "./Magnetic";
import { SocialLinks } from "./SocialLinks";

// "I build ___ that actually ship."
const BUILDS = [
  "RAG systems",
  "LLM agents",
  "evaluation pipelines",
  "AI products",
];

const METRICS = [
  {
    value: "+25%",
    label: "retrieval accuracy",
    note: "on a held-out eval set",
  },
  {
    value: "55%",
    label: "faster retrieval",
    note: "Qdrant migration + chunking",
  },
  {
    value: "45%",
    label: "lower LLM cost",
    note: "request-based model routing",
  },
  {
    value: "3+",
    label: "years shipping AI",
    note: "insurance, finance, client work",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
// the name slides up from behind a mask
const unmask: Variants = {
  hidden: { y: "108%" },
  show: { y: 0, transition: { duration: 0.95, ease: EASE } },
};

/** The rotating noun in the tagline. */
function BuildRotator({ play }: { play: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setI((v) => (v + 1) % BUILDS.length), 2600);
    return () => clearInterval(id);
  }, [play]);

  return (
    // padding keeps descenders inside the mask
    <span className="-my-[0.14em] inline-flex overflow-hidden py-[0.14em] align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={BUILDS[i]}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block whitespace-nowrap bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent"
        >
          {BUILDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * `ready` flips once the boot screen is gone. The hero is mounted (and laid
 * out) underneath it the whole time and only plays its entrance on that cue,
 * so nothing has to be rebuilt at the moment the page is revealed.
 */
export function Hero({ ready }: { ready: boolean }) {
  const section = useRef<HTMLElement>(null);
  // as the hero scrolls away, the copy drifts up and fades — the 3D network stays behind
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);
  // the name's one-shot glitch; the class comes off afterwards so hover can reuse it
  const [glitchIntro, setGlitchIntro] = useState(true);

  return (
    <section
      ref={section}
      id="top"
      className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-24 pt-28"
    >
      <motion.div
        variants={stagger}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 max-w-[44rem]"
      >
        {/* soft scrim so the copy stays readable over anything behind it */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 65% 60% at 35% 50%, oklch(0.16 0.012 250 / 0.8), transparent 75%)",
          }}
        />

        <motion.p
          variants={rise}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.18em] text-foreground"
        >
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-2 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-accent-2" />
          </span>
          {site.roles[0]}
          <span aria-hidden className="text-accent">
            /
          </span>
          {site.roles[1]}
        </motion.p>

        <h1 className="mt-5 font-display text-[clamp(3.25rem,9.5vw,7rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
            <motion.span variants={unmask} className="block">
              <span
                data-text={site.name}
                className={`name-glitch ${ready && glitchIntro ? "is-intro" : ""}`}
                onAnimationEnd={(e) =>
                  e.animationName === "glitch-b" && setGlitchIntro(false)
                }
              >
                <span className={`name-sheen ${ready ? "is-live" : ""}`}>
                  {site.name}
                </span>
              </span>
            </motion.span>
          </span>
        </h1>

        <motion.p
          variants={rise}
          className="mt-6 font-display text-[clamp(1.6rem,3.7vw,2.75rem)] font-medium leading-[1.14] tracking-[-0.025em] text-foreground/70"
        >
          <span className="sr-only">
            I build AI systems that actually ship.
          </span>
          <span aria-hidden>
            I build <BuildRotator play={ready} />
            <br />
            that actually ship.
          </span>
        </motion.p>

        <motion.p
          variants={rise}
          className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Applied AI engineer at <span className="text-foreground">CSAA</span>,
          building retrieval systems that answer from the right documents, and
          the evaluation workflows that prove it. Previously a forward deployed
          engineer, turning client problems into shipped Python services.
        </motion.p>

        <motion.div
          variants={rise}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic>
            <a
              href="#work"
              className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground shadow-[0_0_24px_-6px_var(--color-accent)] transition-shadow hover:shadow-[0_0_36px_-4px_var(--color-accent)]"
            >
              {/* light sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/40 opacity-0 blur-sm transition-all duration-700 group-hover:left-full group-hover:opacity-100"
              />
              View work
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </Magnetic>
          {site.resumeUrl && (
            <Magnetic>
              <a
                href={site.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface/60 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
              >
                Résumé
                <FileText className="size-4" />
              </a>
            </Magnetic>
          )}
          <Magnetic>
            <a
              href="#contact"
              className="group inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface/60 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
            >
              Get in touch
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
          <span
            aria-hidden
            className="mx-1 hidden h-6 w-px bg-border sm:block"
          />
          <SocialLinks />
        </motion.div>

        {/* headline results, straight from the work */}
        <motion.div
          variants={rise}
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border pt-8 sm:grid-cols-4"
        >
          {METRICS.map((m) => (
            <div key={m.label}>
              <p className="font-display text-4xl font-medium tabular-nums tracking-[-0.03em] text-foreground">
                {ready ? <CountUp value={m.value} /> : m.value}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase leading-snug tracking-[0.14em] text-accent">
                {m.label}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {m.note}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* caption under the live 3D network on wide screens (see scene/shapes.ts → placementFor) */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        aria-hidden
        className="pointer-events-none absolute bottom-24 left-[calc(50%+400px)] hidden -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tracking-wide text-muted-foreground xl:block"
      >
        <span className="text-accent">fig. 01</span> · forward pass, 5-layer
        network · live
      </motion.p>

      {/* ambient code rain behind the 3D network, feathered out with a mask */}
      <div
        className="pointer-events-none absolute inset-0 -z-0 overflow-hidden opacity-40"
        style={{
          maskImage:
            "radial-gradient(ellipse 42% 60% at 78% 45%, #000 0%, rgb(0 0 0 / 0.25) 55%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 42% 60% at 78% 45%, #000 0%, rgb(0 0 0 / 0.25) 55%, transparent 80%)",
        }}
      >
        <CodeRain />
      </div>
    </section>
  );
}
