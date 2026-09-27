import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { Nav } from "@/components/portfolio/Nav";
import { StatusBar } from "@/components/portfolio/StatusBar";
import { Hero } from "@/components/portfolio/Hero";
import { Philosophy } from "@/components/portfolio/Philosophy";
import { ProjectShowcase } from "@/components/portfolio/ProjectShowcase";
import { Timeline } from "@/components/portfolio/Timeline";
import { Stack } from "@/components/portfolio/Stack";
import { Contact } from "@/components/portfolio/Contact";
import { CursorGlow } from "@/components/portfolio/CursorGlow";
import { Background3D } from "@/components/portfolio/Background3D";
import { BootSequence, shouldShowBoot } from "@/components/portfolio/BootSequence";
import { ScrollProgress } from "@/components/portfolio/ScrollProgress";

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
  const [booted, setBooted] = useState(() => !shouldShowBoot());

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        {!booted && <BootSequence onDone={() => setBooted(true)} />}
        <Background3D active={booted} />
        <ScrollProgress />
        <CursorGlow />
        <Nav />
        {/* z-10 keeps content above the fixed WebGL layer */}
        <main className="relative z-10">
          {/* remount after the intro so the hero's entrance plays in view */}
          <Hero key={booted ? "live" : "boot"} />
          <Philosophy />
          <Timeline />
          <ProjectShowcase />
          {/* <Timeline /> */}
          <Stack />
          <Contact />
        </main>
        <footer className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 font-mono text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6">
            <span>© {new Date().getFullYear()} Sangam Patil · WORK HARD DREAM BIG. · Built with ♥️</span>
            <span className="text-accent">eof</span>
          </div>
        </footer>
        <StatusBar />
      </div>
    </MotionConfig>
  );
}
