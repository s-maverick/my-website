import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  "Software Engineer",
  "Data Scientist",
  "Data Analyst",
  "ML Engineer",
  "AI Engineer",
  "AI Enthusiast",
  "Forward Deployment Engineer",
  "Founder",
  "Trader",
  "Developer", 
  "Freelancer",
  "Researcher", 
  "Web3 Enthusiast"
];

export function RoleRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROLES.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-flex items-baseline">
      <span className="font-mono text-accent">role=</span>
      {/* <span className="relative ml-1 inline-block min-w-[14ch] overflow-hidden align-bottom"> */}
      <span className="relative ml-1 inline-block overflow-hidden align-bottom">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={ROLES[i]}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block font-mono text-foreground"
          >
            "{ROLES[i]}"
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="caret" aria-hidden />
    </span>
  );
}
