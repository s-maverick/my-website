import { useEffect, useState } from "react";
import { ScrambleText } from "./ScrambleText";
import { SCENE_STATUS_EVENT, type SceneStatus } from "./scene/events";

export function StatusBar() {
  const [time, setTime] = useState("");
  // what the WebGL background is rendering right now
  const [scene, setScene] = useState<SceneStatus | null>(null);
  useEffect(() => {
    const onStatus = (e: Event) => setScene((e as CustomEvent<SceneStatus>).detail);
    window.addEventListener(SCENE_STATUS_EVENT, onStatus);
    return () => window.removeEventListener(SCENE_STATUS_EVENT, onStatus);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat("en-US", opts).format(d));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    // <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-accent" />
            online
          </span>
          <span className="hidden sm:inline">amherst, ma</span>
          {scene && (
            <span className="hidden items-center gap-1.5 normal-case lg:flex">
              <span className="text-accent">render:</span>
              <ScrambleText key={scene.shape} text={scene.shape} immediate duration={600} />
              <span>
                · {Math.round(scene.points / 1000)}k pts · {scene.fps} fps
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline">last_deploy: 14s ago</span>
          <span>{time || "--:--:--"} et</span>
        </div>
      </div>
    </div>
  );
}
