import { useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { SectionHeading } from "./SectionHeading";


const work = [
  {
    hash: "5c1a7e2",
    branch: "HEAD → csaa",
    title: "Applied AI Engineer",
    where: "CSAA – AAA Insurer Company, Boston, MA",
    date: "May 2025 — Present",
    diff: [
      "+ built a RAG chatbot (Python, LangChain, LLM APIs) answering from approved docs + internal knowledge",
      "+ hybrid-search retrieval pipeline → +25% retrieval accuracy on a held-out eval set",
      "+ migrated retrieval to Qdrant + refined chunking → 55% faster retrieval",
      "+ request-based model selection → 40% faster responses, 45% lower API cost, no measurable quality loss",
      "+ evaluation workflows: test sets, retrieval metrics & answer-quality checks to gate every release",
      "+ integrated Model Context Protocol (MCP) tools for retrieval + external tool use",
      "+ retrieval checks and API access controls to curb unsupported answers & protect sensitive data",
    ],
  },
  {
    hash: "a3f9c21",
    branch: "umass amherst",
    title: "Graduate Research & Teaching Assistant",
    where: "University of Massachusetts, Amherst, MA",
    date: "Feb. 2025 — May 2026",
    diff: [
      "+ led teaching sessions on LLMs, stats & research design for 200+ students",
      "+ technical support in ML pipelines, quant methods, data science ethics",
      "+ regression & hypothesis testing on social media / political engagement data",
      "+ designed + analyzed survey experiments (N=500+) for causal inference",
      "+ EDA, preprocessing, and stakeholder visualizations across multiple datasets",
    ],
  },
  {
    hash: "9e4d0b8",
    branch: "phoenix tech hub",
    title: "Forward Deployed Engineer",
    where: "Phoenix Tech Hub, Pune, MH",
    date: "Jan. 2023 — Aug. 2024",
    diff: [
      "+ turned client requirements into Python services + FastAPI REST endpoints, automating manual workflows",
      "+ Python/SQL data-processing workflows consolidating multiple sources (target: 30% faster data prep)",
      "+ LLM proof-of-concepts for enterprise document analysis + question answering",
      "+ retrieval-based QA prototypes with embeddings, vector search & document context",
      "+ reusable utility + config modules shared across 5+ service components",
      "+ presented solution designs & trade-offs; scoped acceptance criteria and phased delivery plans",
    ],
  },
  {
    hash: "e9d5f30",
    branch: "racksonsit developers pvt. ltd.",
    title: "Machine Learning Engineer",
    where: "RacksonsIT Developers Pvt. Ltd., Pune, MH",
    date: "Oct. 2022 — March 2023",
    diff: [
      "+ operationalized Modern Portfolio Theory for automated, risk-optimized asset recommendations",
      "+ built real-time investment recommendation system in Node.js + AWS",
      "+ processed 250M+ financial records with NumPy/Pandas; built stakeholder visualizations",
    ],
  },
  {
    hash: "b2c1190",
    branch: "racksonsit developers pvt. ltd. → NULL",
    title: "Data Scientist",
    where: "RacksonsIT Developers Pvt. Ltd., Pune, MH",
    date: "June 2020 — Aug. 2020",
    diff: [
      "+ end-to-end NLP sentiment analysis: TF-IDF, word embeddings, classification models",
      "+ built interactive Tableau dashboards for external stakeholders",
      "+ fraud detection with logistic regression + ensemble methods on imbalanced datasets",
    ],
  },
];


const education = [
  {
    hash: "e91d4ac",
    branch: "HEAD → UMASS · GRAD",
    title: "Master of Science in Data Science and Analytics",
    where: "University of Massachusetts Amherst, MA",
    date: "Sep. 2024 — May 2026",
    diff: [
      "+ CGPA: 3.9 / 4.0",
      "+ Coursework: Advanced DL, Advanced NLP, Advanced ML, Systems for DS, Data Engineering, Data Science, Spatial Data Analysis, Quantitative Analysis",
      "+ Research Focus: Agentic Workflows, LLM Reasoning + RAG, NLP Applications, Analytical Pipelines",
    ],
  },
  
  {
    hash: "1f09a2a",
    branch: "VIT · UG",
    title: "Bachelor of Science in Artificial Intelligence & Data Science",
    where: "Vishwakarma Institute of Technology, Pune, MH",
    date: "Sep. 2020 — May 2024",
    diff: [
      "+ CGPA: 9.2 / 10.0",
      "+ Coursework: DL, NLP, ML, AI, Statistical Inference, Algorithm Complexity, Business Analytics, Operating Systems, Database Management, Computer Networks",
      "+ Research Focus: ML Applications, ML Pipeline Development, Deep Learning Applications",
    ],
  },
  
  {
    hash: "a3c0019",
    branch: "SIT · Diploma → NULL",
    title: "Diploma in Computer Science and Engineering",
    where: "Sharad Institute of Technology, Ichalkaranji, MH",
    date: "Sep. 2018 — May 2020",
    diff: [
      "+ CGPA: 95.77 / 100.0",
      "+ Coursework: Programming in C, Data Structures, Object oriented Programming, DBMS, Java Programming, Software Engineering, Software Testing, Operating Systems",
      "+ Research Focus: Programming Basics, Development Frameworks, Software Engineering, Software Testing",
    ],
  },
];

// function CommitList({ items, prompt }: { items: typeof work; prompt: string }) {
//   return (
//     <div className="overflow-hidden rounded-xl border border-border bg-surface/40">
//       <div className="border-b border-border bg-surface px-4 py-2 font-mono text-xs text-muted-foreground">
//         {prompt}
//       </div>
//       <div className="divide-y divide-border font-mono text-sm">
//         {items.map((c, i) => (
//           <motion.div
//             key={c.hash}
//             initial={{ opacity: 0, x: -10 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true, margin: "-60px" }}
//             transition={{ duration: 0.4, delay: i * 0.08 }}
//             className="group grid gap-3 px-4 py-5 transition-colors hover:bg-surface md:grid-cols-[auto_1fr_auto] md:items-start md:gap-6"
//           >
//             <div className="flex items-center gap-3 text-accent">
//               <span>*</span>
//               <span className="text-foreground">{c.hash}</span>
//               <span className="rounded border border-accent/30 bg-accent/10 px-1.5 text-[10px] uppercase tracking-wider text-accent">
//                 {c.branch}
//               </span>
//             </div>
//             <div>
//               <div className="text-foreground">{c.title}</div>
//               <div className="mt-0.5 text-xs text-muted-foreground">
//                 {c.where}
//               </div>
//               <ul className="mt-3 space-y-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:opacity-70">
//                 {c.diff.map((d) => (
//                   <li key={d} className="text-accent/90">
//                     {d}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div className="text-xs text-muted-foreground md:text-right">
//               {c.date}
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export function Timeline() {
//   return (
//     <section id="experience" className="mx-auto max-w-7xl px-4 py-24">
//       <div className="mb-10">
//         <p className="font-mono text-sm text-accent">// work experience</p>
//         <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
//           git log --oneline --work
//         </h2>
//       </div>
//       <CommitList items={work} prompt="~/work $ git log --graph --decorate" />

//       <div id="education" className="mb-10 mt-24">
//         <p className="font-mono text-sm text-accent">// education</p>
//         <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
//           git log --oneline --education
//         </h2>
//       </div>
//       <CommitList
//         items={education}
//         prompt="~/education $ git log --graph --decorate"
//       />
//     </section>
//   );
// }

function CommitList({
  items,
  prompt,
  mobileLines,
}: {
  items: typeof work;
  prompt: string;
  /** bullets shown per entry on phones before a "+ N more" toggle (desktop shows all) */
  mobileLines: number;
}) {
  const list = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const toggle = (hash: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(hash)) next.add(hash);
      return next;
    });
  // the git-graph rail fills in as the list scrolls through the viewport
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.75", "end 0.6"] });
  const railFill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/40 backdrop-blur-sm xl:mr-[22rem]">
      <div className="border-b border-border bg-surface px-4 py-2 font-mono text-xs text-muted-foreground">
        {prompt}
      </div>
      <div ref={list} className="relative divide-y divide-border font-mono text-sm">
        {items.map((c, i) => {
          const open = !isMobile || expanded.has(c.hash);
          const lines = open ? c.diff : c.diff.slice(0, mobileLines);
          const more = c.diff.length - mobileLines;
          return (
          <motion.div
            key={c.hash}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative flex flex-col gap-2 py-5 pl-12 pr-4 transition-colors hover:bg-surface"
          >
            {/* commit node on the rail */}
            <motion.span
              aria-hidden
              initial={{ scale: 0.3, opacity: 0.3 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ margin: "0px 0px -40% 0px" }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="absolute left-[17px] top-[25px] size-[11px] rounded-full border-2 border-accent bg-background shadow-[0_0_12px_var(--color-accent)] transition-colors group-hover:bg-accent"
            />
            {/* Top row: hash/badge on left, date on right */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex items-center gap-3 text-accent">
                <span className="text-foreground">{c.hash}</span>
                <span className="rounded border border-accent/30 bg-accent/10 px-1.5 text-[11px] uppercase tracking-wider text-accent">
                  {c.branch}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{c.date}</div>
            </div>
 
            {/* Second row: title + company. Content is set in the sans; the
                hash, branch and date keep the terminal's mono. */}
            <div className="font-sans">
              <div className="text-base font-medium text-foreground">{c.title}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {c.where}
              </div>
            </div>
 
            {/* Diff lines — always flush left, consistent across all entries */}
            {/* <ul className="mt-1 space-y-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 md:opacity-70"> */}
            <ul className="mt-1 space-y-1.5 text-sm opacity-100 transition-opacity md:opacity-100 md:group-hover:opacity-100">
              {lines.map((d) => (
                // `git diff` style: green "+" gutter, readable near-white text
                <li key={d} className="flex gap-2.5 leading-relaxed text-foreground/80">
                  <span aria-hidden className="shrink-0 text-accent-2">+</span>
                  <span className="font-sans">{d.replace(/^\+\s*/, "")}</span>
                </li>
              ))}
            </ul>
            {isMobile && more > 0 && (
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(c.hash)}
                className="mt-1 w-fit rounded border border-border px-2 py-0.5 text-xs text-accent transition-colors hover:border-accent"
              >
                {open ? "− show less" : `+ ${more} more`}
              </button>
            )}
          </motion.div>
          );
        })}
        {/* git-graph rail — last child so divide-y leaves it alone */}
        <div aria-hidden className="absolute bottom-8 left-[22px] top-8 w-px bg-border">
          <motion.div
            className="h-full w-full origin-top bg-gradient-to-b from-accent via-accent to-accent-2 shadow-[0_0_10px_var(--color-accent)]"
            style={{ scaleY: railFill }}
          />
        </div>
      </div>
    </div>
  );
}
 
export function Timeline() {
  return (
    <section id="experience" className="mx-auto max-w-7xl px-4 py-24">
      <SectionHeading className="mb-10" index="02" label="Experience" title="Where I've shipped.">
        Applied AI in insurance today. Client-facing engineering, machine learning
        and data science before that.
      </SectionHeading>
      <CommitList items={work} prompt="~/work $ git log --graph --decorate" mobileLines={3} />
 
      <div id="education" className="mt-24">
        <SectionHeading size="md" className="mb-8" label="Education" title="Where I studied." />
      </div>
      <CommitList
        items={education}
        prompt="~/education $ git log --graph --decorate"
        mobileLines={1}
      />
    </section>
  );
}
