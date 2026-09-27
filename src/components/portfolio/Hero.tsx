import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SkillGraph } from "./SkillGraph";
import { RoleRotator } from "./RoleRotator";
import { CodeRain } from "./CodeRain";
import { TiltCard } from "./TiltCard";
import { Magnetic } from "./Magnetic";
import { CountUp } from "./CountUp";
import sangamPhoto from "@/assets/sangam.png";

const headline = "I build things that actually ship.";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  // as the hero scrolls away, the copy drifts up and fades — the 3D core stays behind
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);
  const sideY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={section}
      id="top"
      className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-4 pb-20 pt-32 md:grid-cols-5 md:gap-12"
    >
      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-10 md:col-span-3">
        {/* soft scrim so the copy stays readable over the particles behind it */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-16 -inset-y-10 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 35% 50%, oklch(0.16 0.012 250 / 0.75), transparent 75%)",
          }}
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-sm text-accent"
        >
          &gt; whoami --verbose
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-1 text-sm"
        >
          <RoleRotator />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12, filter: "blur(12px)" }}
          // drop the filter afterwards — even blur(0) clips the glitch glow to the box
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-4 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
        >
          <span data-text="Sangam Patil" className="glitch-name inline-block">
            Sangam Patil
          </span>
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-4 font-display text-xl text-muted-foreground sm:text-2xl md:text-3xl"
          style={{ perspective: 600 }}
        >
          {headline.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, rotateX: -80 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block origin-bottom"
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Data Scientist by Training, Shipper by Habit. <br/>
          Currently at{" "}
          <span className="text-foreground">UMass Amherst</span> turning messy
          data into decisions and occasionally into revenue (
          <span className="text-foreground">Xresilient</span> did a 150% lift,
          not bad huh?).
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Right now I&apos;m deep in{" "}
          <span className="text-accent">Agentic Workflows </span>,{" "}
          <span className="text-accent">LLM Orchestration</span>, and the kind of
          vibe-coded prototypes that go from idea to deploy before the coffee
          gets cold.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 flex flex-wrap items-center gap-3 font-mono text-sm"
        >
          <Magnetic>
            <a
              href="#work"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-accent px-4 py-2.5 font-medium text-accent-foreground shadow-[0_0_24px_-6px_var(--color-accent)] transition-all hover:gap-3 hover:shadow-[0_0_36px_-4px_var(--color-accent)]"
            >
              {/* light sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/40 opacity-0 blur-sm transition-all duration-700 group-hover:left-full group-hover:opacity-100"
              />
              [ see the work
              <span className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
              ]
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              ./say_hi
            </a>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-10 grid max-w-lg grid-cols-3 gap-4 font-mono"
        >
          {[
            // { k: "gpa", v: "3.9" },
            { k: "budget managed", v: "$5 Million" },
            { k: "revenue lift", v: "150%" },
            { k: "clients shipped", v: "10+" },
          ].map((s) => (
            <TiltCard
              key={s.k}
              max={14}
              className="card-lift rounded-md border border-border bg-surface/50 p-3 backdrop-blur-sm"
            >
              <div className="text-xl text-accent">
                <CountUp value={s.v} />
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.k}
              </div>
            </TiltCard>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        style={{ y: sideY }}
        className="relative z-10 md:col-span-2 space-y-6"
      >
        <TiltCard max={10} className="group mx-auto w-full max-w-sm rounded-2xl">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent via-accent/40 to-accent-hot opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-90" />
          {/* rotating conic border + scanline/sheen overlay */}
          <div className="gradient-border holo relative overflow-hidden rounded-2xl [--gradient-border-fill:var(--color-surface)]">
            <img
              src={sangamPhoto}
              alt="Sangam Patil"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-background/80 via-background/0 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 z-[3] flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span className="text-accent">● online</span>
              <span>~/sangam.jpg</span>
            </div>
          </div>
        </TiltCard>
        <SkillGraph />
      </motion.div>

      {/* ambient code rain, feathered out with a mask so the 3D layer shows through */}
      <div
        className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-3xl opacity-60"
        style={{
          maskImage:
            "radial-gradient(ellipse at 30% 40%, #000 0%, rgb(0 0 0 / 0.2) 55%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 30% 40%, #000 0%, rgb(0 0 0 / 0.2) 55%, transparent 80%)",
        }}
      >
        <CodeRain />
      </div>
    </section>
  );
}
