import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";
import { TagSphere, type SphereTag } from "./TagSphere";

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

const sphereTags: SphereTag[] = groups.flatMap((g, group) =>
  g.items.map((label) => ({ label, group })),
);

export function Stack() {
  // hovering a group card lights up its tags on the sphere
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="stack" className="mx-auto max-w-7xl px-4 py-24">
      <SectionHeading className="mb-10" eyebrow="// toolchain" title="what i reach for, by default." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface/40 backdrop-blur-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>
              <span className="text-accent">●</span> skill_sphere.gl
            </span>
            <span>{active === null ? "drag to spin" : `${groups[active].label}/`}</span>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 top-8"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, oklch(0.80 0.15 220 / 0.12), transparent 60%)",
            }}
          />
          <TagSphere tags={sphereTags} activeGroup={active} className="mx-auto max-w-[520px]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((g, i) => (
            <TiltCard
              key={g.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              max={6}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              className={`card-lift rounded-xl border bg-surface/40 p-5 backdrop-blur-sm ${
                active === i ? "border-accent" : "border-border"
              }`}
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
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
