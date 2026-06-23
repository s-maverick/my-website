import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Node = d3.SimulationNodeDatum & {
  id: string;
  group: number;
  r: number;
};
type Link = d3.SimulationLinkDatum<Node>;


// const NODES: Node[] = [
//   { id: "sangam", group: 0, r: 22 },
//   { id: "python", group: 1, r: 14 },
//   { id: "fastapi", group: 1, r: 12 },
//   { id: "supabase", group: 1, r: 12 },
//   { id: "react", group: 1, r: 12 },
//   { id: "rag", group: 2, r: 13 },
//   { id: "llms", group: 2, r: 13 },
//   { id: "n8n", group: 2, r: 10 },
//   { id: "pytorch", group: 3, r: 11 },
//   { id: "pandas", group: 3, r: 11 },
//   { id: "sql", group: 3, r: 11 },
//   { id: "d3", group: 1, r: 10 },
//   { id: "nlp", group: 2, r: 11 },
//   { id: "geospatial", group: 3, r: 10 },
// ];

// const LINKS: Link[] = [
//   ["sangam", "python"],
//   ["sangam", "rag"],
//   ["sangam", "react"],
//   ["sangam", "pytorch"],
//   ["sangam", "supabase"],
//   ["sangam", "sql"],
//   ["python", "pandas"],
//   ["python", "pytorch"],
//   ["python", "fastapi"],
//   ["fastapi", "supabase"],
//   ["react", "d3"],
//   ["rag", "llms"],
//   ["rag", "nlp"],
//   ["llms", "n8n"],
//   ["n8n", "sangam"],
//   ["pytorch", "nlp"],
//   ["pandas", "sql"],
//   ["sangam", "geospatial"],
//   ["geospatial", "d3"],
// ].map(([source, target]) => ({ source, target }));


const NODES: Node[] = [
  { id: "sangam",     group: 0, r: 22 },

  // cluster anchors
  { id: "python",     group: 1, r: 14 },
  { id: "rag",        group: 2, r: 14 },
  { id: "data eng",   group: 3, r: 14 },
  { id: "backend",    group: 4, r: 14 },
  { id: "react",      group: 5, r: 14 },

  // python leaves
  { id: "pandas",     group: 1, r: 10 },
  { id: "sklearn",    group: 1, r: 10 },
  { id: "opencv",     group: 1, r: 10 },
  { id: "pytorch",    group: 1, r: 11 },

  // rag / llm leaves
  { id: "langchain",  group: 2, r: 11 },
  { id: "chromadb",   group: 2, r: 10 },
  { id: "n8n",        group: 2, r: 10 },
  { id: "llms",       group: 2, r: 11 },

  // data eng leaves
  { id: "spark",      group: 3, r: 10 },
  { id: "airflow",    group: 3, r: 10 },
  { id: "sql",        group: 3, r: 11 },
  { id: "geospatial", group: 3, r: 10 },

  // backend leaves
  { id: "fastapi",    group: 4, r: 11 },
  { id: "docker",     group: 4, r: 10 },
  { id: "aws",        group: 4, r: 10 },

  // react leaves
  { id: "d3",         group: 5, r: 10 },
  { id: "typescript", group: 5, r: 10 },
];

const LINKS: Link[] = [
  // center → cluster anchors
  ["sangam",   "python"],
  ["sangam",   "rag"],
  ["sangam",   "data eng"],
  ["sangam",   "backend"],
  ["sangam",   "react"],

  // python cluster
  ["python",   "pandas"],
  ["python",   "sklearn"],
  ["python",   "opencv"],
  ["python",   "pytorch"],

  // rag / llm cluster
  ["rag",      "langchain"],
  ["rag",      "chromadb"],
  ["rag",      "n8n"],
  ["rag",      "llms"],

  // data eng cluster
  ["data eng", "spark"],
  ["data eng", "airflow"],
  ["data eng", "sql"],
  ["data eng", "geospatial"],

  // backend cluster
  ["backend",  "fastapi"],
  ["backend",  "docker"],
  ["backend",  "aws"],

  // react cluster
  ["react",    "d3"],
  ["react",    "typescript"],

  // cross-cluster edges
  ["pytorch",   "sql"],
  ["langchain", "n8n"],
  ["sql",       "pandas"],
].map(([source, target]) => ({ source, target }));


export function SkillGraph() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    if (!ref.current) return;
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const sim = d3
      .forceSimulation<Node>(NODES.map((n) => ({ ...n })))
      .force(
        "link",
        d3
          .forceLink<Node, Link>(LINKS.map((l) => ({ ...l })))
          .id((d) => d.id)
          .distance(70)
          .strength(0.6),
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<Node>().radius((d) => d.r + 6),
      );

    const link = g
      .append("g")
      .attr("stroke", "oklch(0.80 0.15 220 / 0.55 )")
      // .attr("stroke", "oklch(0.78 0.19 145 / 0.25)")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(sim.force<d3.ForceLink<Node, Link>>("link")!.links())
      .join("line");

    const node = g
      .append("g")
      .selectAll<SVGGElement, Node>("g")
      .data(sim.nodes())
      .join("g")
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    node
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) =>
        d.group === 0
          ? "oklch(0.80 0.15 220)"
          : "oklch(0.20 0.15 250)",
          // ? "oklch(0.78 0.19 145)"
          // : "oklch(0.20 0.015 250)",
      )
      .attr("stroke", (d) =>
        d.group === 0
          ? "oklch(0.80 0.15 220 / 0.9)"
          : "oklch(0.80 0.15 220 / 0.55 )",
          // ? "oklch(0.78 0.19 145)"
          // : "oklch(0.78 0.19 145 / 0.5)",
      )
      .attr("stroke-width", 1.25);

    node
      .append("text")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.r + 14)
      .attr("fill", "oklch(0.85 0.01 250)")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("font-size", 10);

    // pointer repulsion
    const handlePointer = (event: PointerEvent) => {
      const rect = ref.current!.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      sim.force(
        "pointer",
        d3
          .forceRadial<Node>(0, mx, my)
          .strength((d) => {
            const dx = (d.x ?? 0) - mx;
            const dy = (d.y ?? 0) - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist < 110 ? -0.06 : 0;
          }),
      );
      sim.alphaTarget(0.05).restart();
    };
    const handleLeave = () => {
      sim.force("pointer", null);
      sim.alphaTarget(0);
    };
    ref.current.addEventListener("pointermove", handlePointer);
    ref.current.addEventListener("pointerleave", handleLeave);

    sim.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      sim.stop();
      ref.current?.removeEventListener("pointermove", handlePointer);
      ref.current?.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface/40">
      <div className="absolute left-3 top-3 z-10 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="text-accent">●</span> skill_graph.json · drag nodes
      </div>
      <svg ref={ref} className="h-full w-full" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
}
