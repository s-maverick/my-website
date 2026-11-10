import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { Nav } from "@/components/portfolio/Nav";
import { StatusBar } from "@/components/portfolio/StatusBar";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { ProjectShowcase } from "@/components/portfolio/ProjectShowcase";
import { Publications } from "@/components/portfolio/Publications";
import { Timeline } from "@/components/portfolio/Timeline";
import { Stack } from "@/components/portfolio/Stack";
import { Contact } from "@/components/portfolio/Contact";
import { SocialLinks } from "@/components/portfolio/SocialLinks";
import { site } from "@/lib/site";
import { CursorGlow } from "@/components/portfolio/CursorGlow";
import { Background3D } from "@/components/portfolio/Background3D";
import { BootSequence, shouldShowBoot } from "@/components/portfolio/BootSequence";
import { ScrollProgress } from "@/components/portfolio/ScrollProgress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      // the rest of the meta tags (description, share previews) live in src/index.html
      { title: site.title },
    ],
  }),
  component: Index,
});

function Index() {
  const [booted, setBooted] = useState(() => !shouldShowBoot());
  // the boot screen holds its last line until the 3D layer has drawn a frame,
  // so that setup never competes with the page's entrance animations
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
        {!booted && <BootSequence ready={sceneReady} onDone={() => setBooted(true)} />}
        <Background3D active={booted} onReady={onSceneReady} />
        <ScrollProgress />
        <CursorGlow />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <Nav />
        {/* z-10 keeps content above the fixed WebGL layer */}
        <main id="main" className="relative z-10">
          {/* mounted under the boot screen; `ready` cues its entrance */}
          <Hero ready={booted} />
          <About />
          <Timeline />
          <ProjectShowcase />
          <Publications />
          <Stack />
          <Contact />
        </main>
        <footer className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 font-mono text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-6">
            <span>
              © {new Date().getFullYear()} {site.name} · Work hard. Dream big. · Built with{" "}
              <span className="text-accent-hot">♥</span>
            </span>
            <div className="flex items-center gap-4">
              <SocialLinks />
              <span className="text-accent">eof</span>
            </div>
          </div>
        </footer>
        <StatusBar />
      </div>
    </MotionConfig>
  );
}
