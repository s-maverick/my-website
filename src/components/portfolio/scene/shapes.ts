import * as THREE from "three";

/**
 * One particle system, six forms. Each page section has a shape; scrolling
 * between sections morphs the particles from one to the next.
 * `id` is the section's DOM id; `name` shows up in the status bar.
 */
export const SHAPES = [
  { id: "top", name: "neural_core.glsl" },
  { id: "philosophy", name: "lorenz_attractor(σ=10, ρ=28, β=8/3)" },
  { id: "experience", name: "double_helix.obj" },
  { id: "work", name: "spiral_galaxy(arms=3)" },
  { id: "stack", name: "loss_landscape(x, z)" },
  { id: "contact", name: "vortex_ring.flow" },
] as const;

export type Placement = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

// where each shape sits relative to the screen centre (world units, ~160px each
// on a 900px-tall viewport). Wide screens park shapes in the empty side of the
// layout; narrow screens keep them centred and dimmer behind the text.
export const PLACEMENTS: { wide: Placement[]; narrow: Placement[] } = {
  wide: [
    { x: 0.75, y: 0.15, scale: 1.15, opacity: 0.9 }, // between headline and portrait
    { x: 2.9, y: 0.25, scale: 0.95, opacity: 0.95 }, // right side, glowing through card 3
    { x: 3.1, y: 0, scale: 1.05, opacity: 0.9 }, // beside the commit dates
    { x: 2.2, y: -0.1, scale: 1.5, opacity: 0.8 }, // behind the grid, core off-centre
    { x: 2.3, y: -0.2, scale: 1.3, opacity: 0.85 }, // behind the stack cards
    { x: 0, y: 0, scale: 2.6, opacity: 0.95 }, // a portal framing the contact card
  ],
  narrow: [
    { x: 0.85, y: 0.55, scale: 0.85, opacity: 0.5 }, // peeking in from the right edge
    { x: 0, y: 0.8, scale: 0.72, opacity: 0.5 },
    { x: 0.55, y: 0, scale: 0.8, opacity: 0.45 },
    { x: 0, y: 0, scale: 0.8, opacity: 0.45 },
    { x: 0, y: 0.9, scale: 0.7, opacity: 0.45 },
    { x: 0, y: 0, scale: 1.1, opacity: 0.55 },
  ],
};

const TAU = Math.PI * 2;
const jitter = (amount: number) => (Math.random() - 0.5) * amount;

function randomUnit(v = new THREE.Vector3()) {
  const u = Math.random() * 2 - 1;
  const a = Math.random() * TAU;
  const r = Math.sqrt(1 - u * u);
  return v.set(Math.cos(a) * r, u, Math.sin(a) * r);
}

/** 0 · fibonacci shell plus a sprinkle of inner points for depth */
function core(count: number) {
  const out = new Float32Array(count * 3);
  const shell = Math.floor(count * 0.86);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    if (i < shell) {
      const y = 1 - (i / (shell - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      v.set(Math.cos(golden * i) * r, y, Math.sin(golden * i) * r);
    } else {
      randomUnit(v).multiplyScalar(0.2 + 0.65 * Math.cbrt(Math.random()));
    }
    v.toArray(out, i * 3);
  }
  return out;
}

/** 1 · Lorenz attractor, sampled in path order so light can flow along it */
function lorenz(count: number) {
  const out = new Float32Array(count * 3);
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  const dt = 0.005;
  let x = 0.1;
  let y = 0;
  let z = 0;
  const step = () => {
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
  };
  for (let i = 0; i < 1500; i++) step(); // skip the transient
  for (let i = 0; i < count; i++) {
    step();
    step();
    // classic butterfly view: z up, centred and scaled to ~1.3 units
    out[i * 3] = x / 20 + jitter(0.02);
    out[i * 3 + 1] = (z - 25) / 20 + jitter(0.02);
    out[i * 3 + 2] = y / 20 + jitter(0.02);
  }
  return out;
}

/** 2 · DNA double helix: index 0–40% strand A, 40–80% strand B, rest are rungs */
function helix(count: number) {
  const out = new Float32Array(count * 3);
  const turns = 3.2;
  const height = 3.2;
  const radius = 0.55;
  const rungs = 30;
  for (let i = 0; i < count; i++) {
    const seq = i / count;
    let px: number;
    let py: number;
    let pz: number;
    if (seq < 0.8) {
      const strand = seq >= 0.4 ? 1 : 0;
      const t = (seq - strand * 0.4) / 0.4;
      const a = t * turns * TAU + strand * Math.PI;
      const tube = 0.05 * Math.sqrt(Math.random());
      const ta = Math.random() * TAU;
      px = Math.cos(a) * radius + Math.cos(ta) * tube;
      pz = Math.sin(a) * radius + Math.sin(ta) * tube;
      py = (t - 0.5) * height + Math.sin(ta) * tube;
    } else {
      const t = (Math.floor(Math.random() * rungs) + 0.5) / rungs;
      const a = t * turns * TAU;
      const f = Math.random() * 2 - 1; // across the rung, strand A → strand B
      px = Math.cos(a) * radius * f + jitter(0.02);
      pz = Math.sin(a) * radius * f + jitter(0.02);
      py = (t - 0.5) * height + jitter(0.02);
    }
    out[i * 3] = px;
    out[i * 3 + 1] = py;
    out[i * 3 + 2] = pz;
  }
  return out;
}

/** 3 · three-armed spiral galaxy with a bulge, in the xz plane (tilted in the shader) */
function galaxy(count: number) {
  const out = new Float32Array(count * 3);
  const arms = 3;
  const v = new THREE.Vector3();
  const scatter = (r: number) =>
    Math.pow(Math.random(), 2.6) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * r;
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.08) {
      randomUnit(v).multiplyScalar(0.3 * Math.cbrt(Math.random()));
      v.y *= 0.55;
    } else {
      const r = 0.1 + Math.pow(Math.random(), 1.4) * 1.7;
      const a = ((i % arms) / arms) * TAU + r * 2.4;
      v.set(
        Math.cos(a) * r + scatter(r),
        scatter(r) * 0.35,
        Math.sin(a) * r + scatter(r),
      );
    }
    v.toArray(out, i * 3);
  }
  return out;
}

/** 4 · wireframe grid for the loss surface; height is computed live in the shader */
function surface(count: number, lines: number) {
  const out = new Float32Array(count * 3);
  const span = 3.4;
  const total = lines * 2;
  const perLine = Math.max(2, Math.floor(count / total));
  for (let i = 0; i < count; i++) {
    // leftovers past the last full line land on a random line
    const line =
      i < perLine * total
        ? Math.floor(i / perLine)
        : Math.floor(Math.random() * total);
    const along = ((i % perLine) / (perLine - 1) - 0.5) * span;
    const fixed = ((line % lines) / (lines - 1) - 0.5) * span;
    const xLine = line < lines;
    out[i * 3] = xLine ? along : fixed;
    out[i * 3 + 1] = 0;
    out[i * 3 + 2] = xLine ? fixed : along;
  }
  return out;
}

/** 5 · vortex ring stored as torus angles (u, v) + tube radius factor */
function vortex(count: number) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out[i * 3] = Math.random() * TAU;
    out[i * 3 + 1] = Math.random() * TAU;
    out[i * 3 + 2] = 0.55 + 0.45 * Math.sqrt(Math.random());
  }
  return out;
}

export function buildEntityGeometry(count: number, surfaceLines: number) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(core(count), 3));
  g.setAttribute("aLorenz", new THREE.BufferAttribute(lorenz(count), 3));
  g.setAttribute("aHelix", new THREE.BufferAttribute(helix(count), 3));
  g.setAttribute("aGalaxy", new THREE.BufferAttribute(galaxy(count), 3));
  g.setAttribute(
    "aSurface",
    new THREE.BufferAttribute(surface(count, surfaceLines), 3),
  );
  g.setAttribute("aVortex", new THREE.BufferAttribute(vortex(count), 3));
  const meta = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    meta[i * 2] = Math.random(); // per-particle random
    meta[i * 2 + 1] = i / count; // sequence: path order for lorenz, strand for helix
  }
  g.setAttribute("aMeta", new THREE.BufferAttribute(meta, 2));
  return g;
}

/**
 * Neurons scattered on the core's surface, each wired to its nearest
 * neighbours. Lines carry a 0→1 coordinate and a phase for travelling pulses.
 */
export function buildSynapses(nodeCount: number) {
  const nodes = Array.from({ length: nodeCount }, () => randomUnit());
  const seen = new Set<number>();
  const pairs: [number, number][] = [];
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: i === j ? Infinity : a.distanceToSquared(b) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = Math.min(i, j) * nodeCount + Math.max(i, j);
        if (seen.has(key)) return;
        seen.add(key);
        pairs.push([i, j]);
      });
  });

  const linePos = new Float32Array(pairs.length * 6);
  const lineEdge = new Float32Array(pairs.length * 4);
  pairs.forEach(([i, j], k) => {
    nodes[i].toArray(linePos, k * 6);
    nodes[j].toArray(linePos, k * 6 + 3);
    const phase = Math.random();
    lineEdge.set([0, phase, 1, phase], k * 4);
  });
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lines.setAttribute("aEdge", new THREE.BufferAttribute(lineEdge, 2));

  const nodePos = new Float32Array(nodeCount * 3);
  const nodeRnd = new Float32Array(nodeCount);
  nodes.forEach((n, i) => {
    n.toArray(nodePos, i * 3);
    nodeRnd[i] = Math.random();
  });
  const neurons = new THREE.BufferGeometry();
  neurons.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
  neurons.setAttribute("aRandom", new THREE.BufferAttribute(nodeRnd, 1));

  return { lines, neurons };
}
