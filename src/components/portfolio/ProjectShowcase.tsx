import { motion } from "framer-motion";

const projects = [
  // ── LLM / AI ──────────────────────────────────────────────────
  {
    slug: "domain-alpaca",
    title: "Domain-Alpaca",
    tag: "llm · fine-tuning",
    blurb:
      "PEFT (LoRA/QLoRA) pipelines that adapt large language models from general word understanding to narrow scientific domains. Ships domain-tuned adapters that swap at runtime with minimal memory overhead.",
    stack: ["PyTorch", "HuggingFace", "LoRA / QLoRA", "PEFT", "W&B"],
    link: "https://github.com/s-maverick/domain-alpaca-main",
    linkLabel: "GitHub",
    metrics: [
      { k: "BLEU", v: "24.38" },
      { k: "BERTScore F1", v: "0.887" },
      { k: "ROUGE-L", v: "0.334" },
    ],
  },
  {
    slug: "ai-onboarding",
    title: "AI-Powered Candidate Onboarding",
    tag: "ai workflows · full-stack",
    blurb:
      "6-phase AI hiring pipeline — career portal to Slack welcome — built on Next.js, FastAPI, Supabase, and Google Gemini Pro. Handles calendar booking with transactional locks to prevent double-booking across concurrent candidates.",
    stack: ["Next.js", "FastAPI", "Supabase", "Gemini Pro", "Google Calendar API"],
    link: "https://github.com/s-maverick/e2e-ai-onboarding",
    linkLabel: "GitHub",
    metrics: [
      { k: "pipeline phases", v: "6" },
      { k: "booking conflicts", v: "0" },
      { k: "LLM variance handled", v: "regex + isinstance" },
    ],
  },
  {
    slug: "rag-document-intelligence",
    title: "RAG-Powered Document Intelligence",
    tag: "nlp · retrieval",
    blurb:
      "Modular RAG pipeline for technical document Q&A using SentenceTransformers, ChromaDB, LangChain, and GPT-4. Supports hybrid retrieval, metadata filtering, and conversational memory across sessions.",
    stack: ["LangChain", "ChromaDB", "SentenceTransformers", "GPT-4", "Flask", "Streamlit"],
    metrics: [
      { k: "accuracy", v: "84%" },
      { k: "avg latency", v: "2s" },
      { k: "hallucinations", v: "↓ significantly" },
    ],
  },
  {
    slug: "multi-turn-agent",
    title: "Multi-Turn Conversational Agent",
    tag: "nlp · agents",
    blurb:
      "LangChain memory + GPT-3.5 agent maintaining context across 15+ turn conversations. Validated across a simulated 500-conversation evaluation pipeline.",
    stack: ["LangChain", "GPT-3.5", "Python"],
    metrics: [
      { k: "re-clarification rate", v: "−28%" },
      { k: "context retention", v: "91%" },
      { k: "eval conversations", v: "500" },
    ],
  },
  {
    slug: "promptos",
    title: "PromptOS",
    tag: "prompt engineering · n8n",
    blurb:
      "Production-grade prompt orchestration platform in n8n. Automates prompt classification, optimization, and structured assembly for enterprise LLM workflows across fintech and SaaS use cases.",
    stack: ["n8n", "OpenAI API", "Python", "JSON/XML templating", "vector retrieval"],
    metrics: [
      { k: "token consumption", v: "−24–35%" },
      { k: "output format", v: "deterministic" },
      { k: "use cases", v: "fintech · SaaS" },
    ],
  },

  // ── ML / DATA SCIENCE ─────────────────────────────────────────
  {
    slug: "superpredict",
    title: "SuperPredict",
    tag: "forecasting · ml",
    blurb:
      "Machine learning pipeline predicting superconducting critical temperatures across 21k+ materials. PCA reduces 81 physicochemical features while preserving 95% of variance. ExtraTrees ensemble wins.",
    stack: ["Python", "NumPy", "Pandas", "scikit-learn", "PCA", "ExtraTrees"],
    link: "https://github.com/s-maverick/superconduct-temperature",
    linkLabel: "GitHub",
    metrics: [
      { k: "R²", v: "0.929" },
      { k: "test RMSE", v: "9.03 K" },
      { k: "materials", v: "21k+" },
    ],
  },
  {
    slug: "tip-off",
    title: "The Tip-Off",
    tag: "statistics · behavioral",
    blurb:
      "2×2 factorial survey experiment (N=220) examining how gender influences tipping behavior in restaurants. Two-sample t-tests + ggplot2 visualizations reveal statistically significant differences.",
    stack: ["R", "ggplot2", "statistical modeling", "data preprocessing"],
    link: "https://github.com/s-maverick/the-tip-off",
    linkLabel: "GitHub",
    metrics: [
      { k: "participants", v: "220" },
      { k: "design", v: "2×2 factorial" },
      { k: "significance", v: "p < 0.05" },
    ],
  },
  {
    slug: "digital-detox",
    title: "Digital Detoxification & Well-Being",
    tag: "statistics · health",
    blurb:
      "Investigated the causal impact of digital detoxification on mental and physical well-being using statistical modeling and data preprocessing pipelines in R.",
    stack: ["R", "statistical modeling", "data preprocessing", "visualizations"],
    metrics: [
      { k: "methodology", v: "observational" },
      { k: "outcome vars", v: "mental + physical" },
      { k: "viz tool", v: "ggplot2" },
    ],
  },
  {
    slug: "fin-news-etl",
    title: "Real-Time Financial News Analytics Pipeline",
    tag: "etl · data engineering",
    blurb:
      "Automated ETL pipeline in Python, SQL, and Airflow extracting, cleaning, and transforming unstructured financial news data into structured sentiment features correlated with real-time stock price movements.",
    stack: ["Python", "SQL", "Airflow", "NLP / sentiment", "financial data"],
    link: "https://github.com/s-maverick/fin-news-etl",
    linkLabel: "GitHub",
    metrics: [
      { k: "data type", v: "unstructured news" },
      { k: "output", v: "sentiment features" },
      { k: "correlation target", v: "stock price" },
    ],
  },

  // ── COMPUTER VISION ───────────────────────────────────────────
  {
    slug: "wildfire-smoke-rcnn",
    title: "Wildfire Smoke Detection · Faster R-CNN",
    tag: "computer vision · published",
    blurb:
      "Real-time wildfire smoke detection via Faster R-CNN trained on ISRO Bhuvan-NRSC and IMD satellite datasets. Published in Springer.",
    stack: ["PyTorch", "Faster R-CNN", "GIS / satellite imagery"],
    link: "https://link.springer.com/chapter/10.1007/978-981-99-8398-8_10",
    linkLabel: "Springer",
    metrics: [
      { k: "architecture", v: "Faster R-CNN" },
      { k: "datasets", v: "ISRO + IMD" },
      { k: "published", v: "Springer" },
    ],
  },
  {
    slug: "face-emotion-opencv",
    title: "Face Emotion Detection · OpenCV",
    tag: "computer vision · published",
    blurb:
      "Real-time computer vision pipeline using OpenCV to detect and classify 6+ facial emotions from live video feeds. Evaluated across diverse datasets to minimize bias.",
    stack: ["OpenCV", "Python", "ETL pipeline", "deep learning"],
    link: "https://link.springer.com/chapter/10.1007/978-981-95-0148-9_18",
    linkLabel: "Springer",
    metrics: [
      { k: "emotions", v: "6+" },
      { k: "mode", v: "real-time" },
      { k: "published", v: "Springer" },
    ],
  },

  // ── NLP / SECURITY ────────────────────────────────────────────
  {
    slug: "smart-contract-nlp",
    title: "Smart Contract Vulnerability Detection",
    tag: "nlp · blockchain · published",
    blurb:
      "NLP + deep learning models that parse smart contract source code to proactively identify high-risk security vulnerabilities through semantic analysis. Published in IEEE.",
    stack: ["NLP", "deep learning", "embeddings", "tokenization", "Solidity"],
    link: "https://ieeexplore.ieee.org/abstract/document/10420108",
    linkLabel: "IEEE",
    metrics: [
      { k: "approach", v: "semantic analysis" },
      { k: "target", v: "smart contracts" },
      { k: "published", v: "IEEE" },
    ],
  },

  // ── GEOSPATIAL / DATA ENGINEERING ────────────────────────────
  {
    slug: "bufferzone-gis",
    title: "BufferZone: Gas Station Relocation Analysis",
    tag: "geospatial · sql",
    blurb:
      "Geospatial data pipeline with optimized SQL queries to extract, clean, and preprocess complex vector data for urban zoning compliance. Interactive Power BI dashboard for stakeholder reporting.",
    stack: ["SQL", "Python", "Power BI", "ETL pipeline", "vector data", "Tableau"],
    link: "https://github.com/Spatial-Data-Analytics-DACSS-690D/Gas-Station-Relocation-Analysis",
    linkLabel: "GitHub",
    metrics: [
      { k: "data type", v: "geospatial vector" },
      { k: "output", v: "Power BI dashboard" },
      { k: "use case", v: "zoning compliance" },
    ],
  },
  {
    slug: "hotel-mgmt-deccan",
    title: "E2E Hotel Management System · Deccan Pavilion",
    tag: "backend · data engineering",
    blurb:
      "Full-stack backend management system for a multi-location restaurant chain — zero to production. RESTful APIs for real-time inventory syncing, automated billing, and reservation routing.",
    stack: ["Python", "Flask", "REST APIs", "Databricks", "Spark SQL", "Delta Lake"],
    metrics: [
      { k: "locations", v: "multi-site" },
      { k: "features", v: "inventory · billing · reservations" },
      { k: "scale", v: "cross-location analytics" },
    ],
  },

  // ── BLOCKCHAIN / WEB3 ─────────────────────────────────────────
  {
    slug: "bappa-nft",
    title: "BappaNFT – NFT Marketplace",
    tag: "web3 · full-stack",
    blurb:
      "Full-cycle NFT marketplace with MetaMask wallet integration and IPFS decentralized storage for managing high-volume digital asset metadata. Real-time blockchain state updates via blockchain hooks.",
    stack: ["React.js", "Web3", "MetaMask", "IPFS", "blockchain hooks"],
    metrics: [
      { k: "storage", v: "IPFS decentralized" },
      { k: "wallet", v: "MetaMask" },
      { k: "frontend", v: "async React" },
    ],
  },
  {
    slug: "crypto-trace",
    title: "Crypto-Trace",
    tag: "blockchain · analytics",
    blurb:
      "Tracks cryptocurrency transactions with blockchain technology. Combines data analytics and machine learning to surface patterns and anomalies across on-chain transaction flows.",
    stack: ["blockchain", "data analytics", "machine learning", "tracking"],
    metrics: [
      { k: "domain", v: "crypto transactions" },
      { k: "technique", v: "ML + blockchain" },
      { k: "output", v: "transaction tracking" },
    ],
  },
  {
    slug: "blockchain-land-records",
    title: "Blockchain Based Land Record System",
    tag: "blockchain · web3",
    blurb:
      "Immutable land record management system leveraging blockchain for data integrity and Web3 interfaces for trustless verification of ownership and transfer history.",
    stack: ["blockchain", "Web3", "smart contracts"],
    metrics: [
      { k: "core property", v: "immutability" },
      { k: "use case", v: "land records" },
      { k: "access", v: "Web3 interface" },
    ],
  },

  // ── ENERGY / OTHER ────────────────────────────────────────────
  {
    slug: "hospital-renewable",
    title: "Powering Progress: Hospital Renewable Energy",
    tag: "case study · techno-economic",
    blurb:
      "Techno-economic analysis of a hospital's transition to renewable energy. Models time-of-day tariff scheduling and evaluates financial and operational feasibility of the energy shift.",
    stack: ["techno-economic modeling", "time-of-day tariff", "SQL", "case study"],
    metrics: [
      { k: "sector", v: "healthcare" },
      { k: "focus", v: "renewable transition" },
      { k: "method", v: "tariff scheduling model" },
    ],
  },
];

// ── SVG icons ──────────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function linkIcon(label: string) {
  if (label === "GitHub") return <GitHubIcon />;
  if (label === "Springer" || label === "IEEE") return <BookIcon />;
  return <ExternalLinkIcon />;
}

// ── Link badge ─────────────────────────────────────────────────────────────

function ProjectLinkBadge({ link, linkLabel }: { link: string; linkLabel: string }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex shrink-0 items-center gap-1.5
        rounded-full border border-white/10 bg-white/5
        px-2.5 py-1
        font-mono text-[10px] font-medium text-muted-foreground
        transition-colors duration-150
        hover:border-accent/40 hover:bg-accent/10 hover:text-accent
      "
      aria-label={`View on ${linkLabel}`}
    >
      {linkIcon(linkLabel)}
      {linkLabel}
    </a>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export function ProjectShowcase() {
  return (
    <section id="work" className="relative py-24">
      <div className="mx-auto mb-12 max-w-7xl px-4">
        <p className="font-mono text-sm text-accent">// selected work</p>
        <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
          things i shipped that someone used.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          academic, founder, and contract work. each one solved a real problem
          for a real person — usually with a deadline.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 md:grid-cols-2">
        {projects.map((p, i) => (
          <motion.article
            key={p.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
            className="group card-lift relative overflow-hidden rounded-xl border border-border bg-surface/40"
          >
            {/* terminal header */}
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 font-mono text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2 rounded-full bg-accent-hot/70" />
                <span className="size-2 rounded-full bg-yellow-500/70" />
                <span className="size-2 rounded-full bg-accent/70" />
                <span className="ml-2 text-muted-foreground">
                  ~/projects/{p.slug}
                </span>
              </div>
              {/* ── link badge lives here, right side of terminal bar ── */}
              {p.link && p.linkLabel && (
                <ProjectLinkBadge link={p.link} linkLabel={p.linkLabel} />
              )}
            </div>

            <div className="p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl text-foreground">
                  {p.title}
                </h3>
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.tag}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.blurb}
              </p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors group-hover:border-accent/30 group-hover:text-accent"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5 font-mono">
                {p.metrics.map((m) => (
                  <div key={m.k}>
                    <div className="text-lg text-foreground">{m.v}</div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {m.k}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}