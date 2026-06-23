import { motion } from "framer-motion";

// const groups = [
//   {
//     label: "languages",
//     items: ["python", "sql", "r", "typescript", "javascript"],
//   },
//   {
//     label: "ml / ai",
//     items: ["pytorch", "scikit-learn", "huggingface", "spacy", "langchain", "openai"],
//   },
//   {
//     label: "data",
//     items: ["pandas", "numpy", "tidyverse", "duckdb", "postgres", "supabase"],
//   },
//   {
//     label: "web / api",
//     items: ["fastapi", "react", "next.js", "tanstack", "tailwind", "d3"],
//   },
//   {
//     label: "ops / orchestration",
//     items: ["n8n", "docker", "vercel", "github actions", "linux"],
//   },
// ];

const groups = [
  {
    label: "languages",
    items: ["Python", "R", "SQL", "TypeScript", "JavaScript", "C", "C++"],
  },
  {
    label: "ml / ai",
    items: ["PyTorch", "scikit-learn", "HuggingFace", "LangChain", "LangGraph", "OpenAI API", "spaCy", "OpenCV"],
  },
  {
    label: "llm & rag",
    items: ["RAG Pipelines", "ChromaDB", "Vector Databases", "Prompt Engineering", "PEFT / QLoRA", "n8n"],
  },
  {
    label: "data",
    items: ["Pandas", "NumPy", "Tidyverse", "DuckDB", "PostgreSQL", "Supabase", "Apache Spark", "DBT"],
  },
  {
    label: "web / api",
    items: ["FastAPI", "React", "Next.js", "TanStack", "Tailwind CSS", "D3.js", "Flask", "REST / GraphQL"],
  },
  {
    label: "ops / orchestration",
    items: ["Docker", "Kubernetes", "Apache Airflow", "GitHub Actions", "AWS (S3, EC2)", "GCP", "Vercel", "Linux"],
  },
];

export function Stack() {
  return (
    <section id="stack" className="mx-auto max-w-7xl px-4 py-24">
      <div className="mb-10">
        <p className="font-mono text-sm text-accent">// toolchain</p>
        <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
          what i reach for, by default.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => (
          <motion.div
            key={g.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-xl border border-border bg-surface/40 p-5"
          >
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {g.label}/
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {g.items.map((it) => (
                <span
                  key={it}
                  className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {it}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
