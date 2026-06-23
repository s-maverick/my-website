import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/portfolio/Nav";
import { StatusBar } from "@/components/portfolio/StatusBar";
import { Hero } from "@/components/portfolio/Hero";
import { Philosophy } from "@/components/portfolio/Philosophy";
import { ProjectShowcase } from "@/components/portfolio/ProjectShowcase";
import { Timeline } from "@/components/portfolio/Timeline";
import { Stack } from "@/components/portfolio/Stack";
import { Contact } from "@/components/portfolio/Contact";
import { CursorGlow } from "@/components/portfolio/CursorGlow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sangam Patil" },
      {
        name: "description",
        content:
          "data scientist + ai/ml builder. ms data science @ umass amherst. cofounder, xresilient. shipping rag pipelines and llm orchestration.",
      },
      { property: "og:title", content: "sangam patil — data scientist & ai builder" },
      {
        property: "og:description",
        content:
          "ships ai things that get used. rag pipelines, llm orchestration, data-driven products.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <CursorGlow />
      <Nav />
      <main>
        <Hero />
        <Philosophy />
        <Timeline />
        <ProjectShowcase />
        {/* <Timeline /> */}
        <Stack />
        <Contact />
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-16 pt-8 font-mono text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6">
          <span>© {new Date().getFullYear()} Sangam Patil · WORK HARD DREAM BIG. · Built with ♥️</span>
          <span className="text-accent">eof</span>
        </div>
      </footer>
      <StatusBar />
    </div>
  );
}
