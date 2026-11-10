import { motion } from "framer-motion";
import { site } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";
// 937×1250 JPEG (~200 KB), downscaled from the 3024×4032 original sangam.png
import sangamPhoto from "@/assets/sangam.jpg";

const facts = [
  { k: "Now", v: "Applied AI Engineer, CSAA" },
  { k: "Previously", v: "Forward Deployed Engineer, Phoenix Tech Hub" },
  { k: "Focus", v: "RAG, LLM evaluation, agents and MCP" },
  { k: "Education", v: "M.S. Data Science and Analytics, UMass Amherst" },
  { k: "Research", v: "6 peer-reviewed papers (IEEE, Springer, CRC Press)" },
  { k: "Based in", v: `${site.location} (ET)` },
];

const principles = [
  {
    n: "01",
    title: "Models don't matter. Decisions do.",
    body: "The moment a stakeholder changes their mind because of something I built, the work is real. Before that, it's a notebook.",
    proof:
      "CSAA · request-based model selection cut response time 40% and API cost 45% with no measurable quality loss",
  },
  {
    n: "02",
    title: "Ship ugly, iterate loud.",
    body: "v0 by Friday beats v1 by quarter-end. Every client PoC at Phoenix Tech Hub was built this way. So was the rest.",
    proof:
      "Phoenix Tech Hub · LLM proofs-of-concept turned into FastAPI services with phased delivery plans",
  },
  {
    n: "03",
    title: "The dataset is the moat.",
    body: "Anyone can prompt an LLM. Fewer people can clean, label, and structure the thing it learns from. That's the lane.",
    proof:
      "CSAA · a held-out eval set drove +25% retrieval accuracy · UMass Amherst · research with LLMs",
  },
];

export function About() {
  return (
    // xl keeps a gutter on the right for the 3D shape (see scene/shapes.ts → placementFor)
    <section id="about" className="mx-auto max-w-7xl px-4 py-28 xl:pr-[23rem]">
      <SectionHeading
        index="01"
        label="About"
        title="I work where models meet the people who use them."
      />

      <div className="grid gap-10 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <TiltCard
            max={9}
            className="group w-full max-w-[11rem] rounded-2xl md:max-w-[16rem]"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent via-accent/30 to-accent-hot opacity-40 blur-xl transition-opacity duration-500 group-hover:opacity-70" />
            {/* rotating conic border */}
            <div className="gradient-border relative overflow-hidden rounded-2xl [--gradient-border-fill:var(--color-surface)]">
              <img
                src={sangamPhoto}
                alt="Portrait of Sangam Patil"
                loading="lazy"
                className="aspect-square w-full object-cover object-[50%_22%] transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/0 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span className="text-accent">● online</span>
                <span>~/sangam.jpg</span>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-lg leading-relaxed text-foreground/90 sm:text-xl sm:leading-relaxed">
            I&apos;m an Applied AI Engineer at CSAA, a AAA insurer, where I
            build retrieval-augmented systems that answer from approved
            documents, and the evaluation workflows that decide whether a change
            is good enough to ship.
          </p>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Before that I was a Forward Deployed Engineer at Phoenix Tech Hub:
            working with client stakeholders to pin down what they actually
            needed, then turning it into FastAPI services and LLM proofs of
            concept. I like that seam between the model and the person using it.
            It&apos;s where most AI projects either work or quietly don&apos;t.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            I hold an M.S. in Data Science and Analytics from UMass Amherst and
            have published applied ML research with IEEE and Springer.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-8 sm:gap-x-10">
            {facts.map((f) => (
              <div key={f.k}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  {f.k}
                </dt>
                <dd className="mt-1.5 text-sm leading-snug text-foreground/90">
                  {f.v}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>

      <div id="principles" className="mt-24">
        <SectionHeading
          size="md"
          label="How I work"
          title="Three rules I actually follow."
          className="mb-8"
        />

        {/* phones: one swipeable row (the next card peeks in); md+: three columns */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {principles.map((p, i) => (
            <TiltCard
              as="article"
              key={p.n}
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              whileInView={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transitionEnd: { filter: "none" },
              }}
              viewport={{ once: true, margin: "-80px 0px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group card-lift flex w-[84%] shrink-0 snap-center flex-col overflow-hidden rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm md:w-auto md:shrink"
            >
              {/* oversized index number in the background */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-5 select-none font-mono text-[6.5rem] leading-none text-accent/[0.06] transition-all duration-500 group-hover:-translate-x-2 group-hover:text-accent/[0.12]"
              >
                {p.n}
              </span>
              <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>rule_{p.n}.md</span>
                <span className="text-accent">●</span>
              </div>
              <h4 className="mt-6 font-display text-xl font-medium leading-tight tracking-[-0.02em] text-foreground">
                {p.title}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
              <div className="mt-auto pt-6">
                <div className="border-t border-border pt-4 font-mono text-xs leading-relaxed text-muted-foreground">
                  <span className="text-accent">$ proof</span> — {p.proof}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
