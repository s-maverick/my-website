import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

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
      <SectionHeading eyebrow="// the operating system" title="three rules I actually follow" />

      <div className="grid gap-5 md:grid-cols-3">
        {principles.map((p, i) => (
          <TiltCard
            as="article"
            key={p.n}
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="group card-lift flex flex-col overflow-hidden rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm"
          >
            {/* oversized index number in the background */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[7rem] leading-none text-accent/[0.06] transition-all duration-500 group-hover:-translate-x-2 group-hover:text-accent/[0.12]"
            >
              {p.n}
            </span>
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
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
