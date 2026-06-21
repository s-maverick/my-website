import { motion } from "framer-motion";

const principles = [
  {
    n: "01",
    title: "Models don't Matter, Decisions Do.",
    body: "the moment a stakeholder changes their mind because of something I built, the work is real. before that, it's a notebook.",
    proof: "Xresilient · drove 150% revenue lift across 10+ b2b clients with dashboards & KPIs",
  },
  {
    n: "02",
    title: "Ship Ugly, Iterate Loud.",
    body: "v0 by friday beats v1 by quarter-end. every n8n flow at cartell was built this way. so was the rest.",
    proof: "Cartell · AI orchestration flows live in production within sprint cycles",
  },
  {
    n: "03",
    title: "The Dataset is the Moat.",
    body: "anyone can prompt an LLM. fewer people can clean, label, and structure the thing it learns from. that's the lane.",
    proof: "UMass Amherst · research work with LLMs at the intersection of AI and data science",
  },
];

export function Philosophy() {
  return (
    <section id="philosophy" className="mx-auto max-w-7xl px-4 py-24">
      <div className="mb-12">
        <p className="font-mono text-sm text-accent">// the operating system</p>
        <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
          three rules I actually follow
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {principles.map((p, i) => (
          <motion.article
            key={p.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group card-lift relative flex flex-col rounded-xl border border-border bg-surface/40 p-6"
          >
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>rule_{p.n}.md</span>
              <span className="text-accent">●</span>
            </div>
            <h3 className="mt-6 font-display text-xl leading-tight text-foreground">
              {p.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
            <div className="mt-6 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
              <span className="text-accent">$ proof</span> — {p.proof}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
