import { motion } from "framer-motion";
import { SkillGraph } from "./SkillGraph";
import { RoleRotator } from "./RoleRotator";
import { CodeRain } from "./CodeRain";
import sangamPhoto from "@/assets/sangam.png";

const headline = "I build things that actually ship.";

export function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-4 pb-20 pt-32 md:grid-cols-5 md:gap-12"
    >
      <div className="relative z-10 md:col-span-3">
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
        >
          {headline.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
              className="inline-block"
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
          <a
            href="#work"
            className="group inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 font-medium text-accent-foreground transition-all hover:gap-3"
          >
            [ see the work
            <span className="transition-transform group-hover:translate-y-0.5">
              ↓
            </span>
            ]
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            ./say_hi
          </a>
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
            <div
              key={s.k}
              className="rounded-md border border-border bg-surface/50 p-3"
            >
              <div className="text-xl text-accent">{s.v}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.k}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="relative z-10 md:col-span-2 space-y-6"
      >
        <div className="group relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent via-accent/40 to-accent-hot opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-90" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
            <img
              src={sangamPhoto}
              alt="Sangam Patil"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span className="text-accent">● online</span>
              <span>~/sangam.jpg</span>
            </div>
          </div>
        </div>
        <SkillGraph />
      </motion.div>

      {/* ambient code rain behind everything */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-3xl">
        <CodeRain />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, transparent 0%, oklch(0.16 0.012 250 / 0.85) 60%, oklch(0.16 0.012 250) 100%)",
          }}
        />
      </div>
    </section>
  );
}
