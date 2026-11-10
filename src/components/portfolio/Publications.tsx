import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

// Titles, venues, publishers and years as registered with Crossref.
const papers = [
  {
    year: 2026,
    title: "Face Emotion Detection from Facial Expression Using OpenCV",
    venue: "Lecture Notes in Electrical Engineering",
    publisher: "Springer",
    topic: "computer vision",
    note: "First author. A real-time pipeline that classifies 6+ facial emotions from live video.",
    href: "https://link.springer.com/chapter/10.1007/978-981-95-0148-9_18",
  },
  {
    year: 2024,
    title: "Wildfire Smoke Detection Using Faster R-CNN",
    venue: "Algorithms for Intelligent Systems",
    publisher: "Springer",
    topic: "computer vision",
    note: "Smoke detection trained on ISRO Bhuvan-NRSC and IMD satellite datasets.",
    href: "https://link.springer.com/chapter/10.1007/978-981-99-8398-8_10",
  },
  {
    year: 2024,
    title:
      "CryptoTrace: Tracking Cryptocurrency Transactions with Blockchain Technology",
    venue: "Advances in Networks, Intelligence and Computing",
    publisher: "CRC Press",
    topic: "blockchain · ml",
    note: "Analytics and machine learning that surface patterns and anomalies in on-chain transaction flows.",
    href: "https://www.taylorfrancis.com/chapters/edit/10.1201/9781003430421-17/cryptotrace-tracking-cryptocurrency-transactions-blockchain-technology-kuldeep-vayadande-sangam-patil-sayee-chauhan-tanuj-baware-rohit-gurav-sameer-naik",
  },
  {
    year: 2023,
    title:
      "Smart Contract Vulnerability Detection Using Natural Language Processing",
    venue: "ICRASET 2023",
    publisher: "IEEE",
    topic: "nlp · security",
    note: "NLP and deep learning models that flag high-risk vulnerabilities in smart contract source code.",
    href: "https://ieeexplore.ieee.org/abstract/document/10420108",
  },
  {
    year: 2023,
    title: "Powering Progress: A Hospital's Journey towards Renewable Energy",
    venue: "E3S Web of Conferences",
    publisher: "EDP Sciences",
    topic: "techno-economics",
    note: "A techno-economic model of a hospital's shift to renewables under time-of-day tariffs.",
    href: "https://doi.org/10.1051/e3sconf/202345502022",
  },
  {
    year: 2022,
    title: "Blockchain-Based Land Record System",
    venue: "ITM Web of Conferences",
    publisher: "EDP Sciences",
    topic: "blockchain",
    note: "Immutable land records with Web3 verification of ownership and transfer history.",
    href: "https://doi.org/10.1051/itmconf/20225001006",
  },
];

export function Publications() {
  return (
    // xl keeps a gutter on the right for the 3D shape (see scene/shapes.ts → placementFor)
    <section
      id="research"
      className="mx-auto max-w-7xl px-4 py-24 xl:pr-[23rem]"
    >
      <SectionHeading
        index="04"
        label="Publications"
        title="Research, peer reviewed."
        className="mb-8"
      >
        Six papers across computer vision, NLP and applied machine learning.
      </SectionHeading>

      <ol className="border-t border-border">
        {papers.map((p, i) => (
          <motion.li
            key={p.href}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="border-b border-border"
          >
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative grid gap-x-6 gap-y-2 py-5 pl-4 pr-2 transition-colors hover:bg-surface/50 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-baseline"
            >
              {/* accent bar that grows in on hover */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100"
              />
              {/* phones: year and publisher share the top row; sm+: they become the outer grid columns */}
              <span className="flex items-center justify-between gap-3 sm:contents">
                <span className="font-mono text-sm tabular-nums text-accent sm:order-1">
                  {p.year}
                </span>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:border-accent/50 group-hover:text-accent sm:order-3 sm:mt-0.5 sm:self-start">
                  {p.publisher}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
              <span className="sm:order-2">
                <span className="block font-display text-lg font-medium leading-snug tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent">
                  {p.title}
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                  {p.note}
                </span>
                <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {p.venue} <span className="text-accent/70">/</span> {p.topic}
                </span>
              </span>
            </a>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
