import { useEffect, useState } from "react";

/**
 * True when the primary input is a precise pointer (mouse / trackpad).
 * Hover-driven effects (tilt, magnetic, custom cursor) gate on this so
 * touch devices get the plain, tap-friendly version.
 */
export function useFinePointer() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = () => setFine(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return fine;
}
