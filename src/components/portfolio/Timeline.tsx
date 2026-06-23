import { motion } from "framer-motion";


const work = [
  {
    hash: "a3f9c21",
    branch: "HEAD → UMass Amherst",
    title: "Graduate Research & Teaching Assistant",
    where: "University of Massachusetts, Amherst, MA",
    date: "Feb. 2025 — Present",
    diff: [
      "+ led teaching sessions on LLMs, stats & research design for 200+ students",
      "+ technical support in ML pipelines, quant methods, data science ethics",
      "+ regression & hypothesis testing on social media / political engagement data",
      "+ designed + analyzed survey experiments (N=500+) for causal inference",
      "+ EDA, preprocessing, and stakeholder visualizations across multiple datasets",
    ],
  },
  {
    hash: "d4c8801",
    branch: "cartell",
    title: "Data Analyst · Deployment Team",
    where: "Cartell, Shippensburg, PA",
    date: "Jan. 2025 — Dec. 2025",
    diff: [
      "+ architected end-to-end AI orchestration pipeline in n8n (PostgreSQL, AWS, K8s)",
      "+ engineered GPT-4o powered theft detection, anomaly flagging & risk assessment",
      "+ integrated Twilio, SendGrid & Slack APIs for real-time alerting pipelines",
      "+ built Python ingestion + quality validation pipelines for large-scale image dataset",
      "+ surfaced labeling gaps via class distribution analysis → informed resampling strategy",
    ],
  },
  {
    hash: "7b2e110",
    branch: "xresilient",
    title: "Co-Founder",
    where: "XResilient, A Venture by SXT IT Solution, Pune, MH",
    date: "Nov. 2023 — Present",
    diff: [
      "+ co-founded B2B services firm; scaled to 10+ enterprise clients in 8 months",
      "+ drove 150% revenue increase through AI-driven product lines",
      "+ translated business requirements into analytical reports & dashboards",
      "+ EDA + feature engineering on client datasets to surface trends & improve models",
      "+ shipped full-stack hotel management platform (Flask APIs, MATLAB UI) for restaurant chain",
    ],
  },
  {
    hash: "f1a0293",
    branch: "ybi foundation",
    title: "Data Scientist",
    where: "YBI Foundation, Pune, MH",
    date: "July 2023 — Sep. 2023",
    diff: [
      "+ automated preprocessing pipelines → reduced anomalies by 20%",
      "+ managed end-to-end model lifecycle for XGBoost & Random Forest architectures",
      "+ hyperparameter tuning for production deployment; built KPI dashboards",
    ],
  },
  {
    hash: "c3b7742",
    branch: "exposys data labs",
    title: "Data Scientist",
    where: "Exposys Data Labs, Pune, MH",
    date: "April 2023 — June 2023",
    diff: [
      "+ analyzed 2B+ record dataset in Python/SQL for seasonal, pricing & inventory trends",
      "+ built ARIMA + ensemble time-series models → 14% improvement in demand prediction",
      "+ delivered Matplotlib visualizations as customer-facing stakeholder reports",
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

function CommitList({ items, prompt }: { items: typeof work; prompt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/40">
      <div className="border-b border-border bg-surface px-4 py-2 font-mono text-xs text-muted-foreground">
        {prompt}
      </div>
      <div className="divide-y divide-border font-mono text-sm">
        {items.map((c, i) => (
          <motion.div
            key={c.hash}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group flex flex-col gap-2 px-4 py-5 transition-colors hover:bg-surface"
          >
            {/* Top row: hash/badge on left, date on right */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex items-center gap-3 text-accent">
                <span>*</span>
                <span className="text-foreground">{c.hash}</span>
                <span className="rounded border border-accent/30 bg-accent/10 px-1.5 text-[10px] uppercase tracking-wider text-accent">
                  {c.branch}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{c.date}</div>
            </div>
 
            {/* Second row: title + company */}
            <div>
              <div className="text-foreground">{c.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {c.where}
              </div>
            </div>
 
            {/* Diff lines — always flush left, consistent across all entries */}
            {/* <ul className="mt-1 space-y-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 md:opacity-70"> */}
            <ul className="mt-1 space-y-1 text-xs opacity-100 transition-opacity md:opacity-100 md:group-hover:opacity-100">
              {c.diff.map((d) => (
                <li key={d} className="text-accent/90">
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
 
export function Timeline() {
  return (
    <section id="experience" className="mx-auto max-w-7xl px-4 py-24">
      <div className="mb-10">
        <p className="font-mono text-sm text-accent">// work experience</p>
        <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
          git log --oneline --work
        </h2>
      </div>
      <CommitList items={work} prompt="~/work $ git log --graph --decorate" />
 
      <div id="education" className="mb-10 mt-24">
        <p className="font-mono text-sm text-accent">// education</p>
        <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
          git log --oneline --education
        </h2>
      </div>
      <CommitList
        items={education}
        prompt="~/education $ git log --graph --decorate"
      />
    </section>
  );
}
