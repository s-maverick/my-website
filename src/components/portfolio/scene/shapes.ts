import * as THREE from "three";

/**
 * One particle system, six forms — each a piece of the work: AI engineering,
 * software, analytics, ML research. Scrolling between sections morphs the
 * particles from one to the next. `id` is the section's DOM id; `name` shows
 * up in the status bar.
 */
export const SHAPES = [
  { id: "top", name: "model.forward(x) · 5-layer mlp" },
  { id: "philosophy", name: "soc.route(traces) · 28 io" },
  { id: "experience", name: "git log --graph --all" },
  { id: "work", name: "dashboard.render(kpis)" },
  { id: "stack", name: "optimizer.step() · loss ↓" },
  { id: "contact", name: "net.connect(world) · 16 routes" },
] as const;

export type Placement = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

// where each shape sits relative to the screen centre (world units, ~160px each
// on a 900px-tall viewport). Wide screens park shapes in the emptier side of the
// layout; narrow screens tuck them against the right edge, dimmer.
export const PLACEMENTS: { wide: Placement[]; narrow: Placement[] } = {
  wide: [
    { x: 0.7, y: 0.15, scale: 1.05, opacity: 0.8 }, // tower between headline and portrait
    { x: 3.0, y: 1.6, scale: 0.7, opacity: 0.8 }, // open space right of the heading
    { x: 2.78, y: 0, scale: 0.9, opacity: 0.8 }, // the xl gutter beside the git log
    { x: 2.78, y: 0, scale: 0.75, opacity: 0.8 }, // the xl gutter beside the project grid
    { x: 3.0, y: 1.35, scale: 0.7, opacity: 0.75 }, // right of the heading
    { x: -3.2, y: 0, scale: 1.3, opacity: 0.75 }, // left of the contact card
  ],
  narrow: [
    { x: 0.95, y: 0.6, scale: 0.7, opacity: 0.45 },
    { x: 0.7, y: 0.7, scale: 0.6, opacity: 0.4 },
    { x: 0.9, y: 0, scale: 0.7, opacity: 0.4 },
    { x: 0.6, y: 0, scale: 0.7, opacity: 0.4 },
    { x: 0.3, y: 0.9, scale: 0.65, opacity: 0.4 },
    { x: 0.8, y: 0.3, scale: 0.8, opacity: 0.45 },
  ],
};

const TAU = Math.PI * 2;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const jitter = (amount: number) => (Math.random() - 0.5) * amount;
const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

function polyLength(points: THREE.Vector3[]) {
  let total = 0;
  for (let i = 1; i < points.length; i++)
    total += points[i].distanceTo(points[i - 1]);
  return total;
}

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Writes particles as (x, y, z, param) — param drives colour and pulses per shape. */
class Writer {
  i = 0;
  readonly out: Float32Array;
  private readonly tmp = new THREE.Vector3();

  constructor(readonly count: number) {
    this.out = new Float32Array(count * 4);
  }

  get full() {
    return this.i >= this.count;
  }

  push(x: number, y: number, z: number, w: number) {
    if (this.full) return;
    this.out.set([x, y, z, w], this.i * 4);
    this.i++;
  }

  /** n particles spread along a polyline; param gets the 0..1 distance along it */
  line(
    points: THREE.Vector3[],
    n: number,
    param: (u: number, at: THREE.Vector3) => number,
    spread = 0.005,
  ) {
    const lengths = points.slice(1).map((p, k) => p.distanceTo(points[k]));
    const total = lengths.reduce((a, b) => a + b, 0) || 1;
    for (let k = 0; k < n; k++) {
      const u = (k + Math.random()) / n;
      let d = u * total;
      let s = 0;
      while (s < lengths.length - 1 && d > lengths[s]) d -= lengths[s++];
      const at = this.tmp
        .copy(points[s])
        .lerp(points[s + 1], lengths[s] ? d / lengths[s] : 0);
      this.push(
        at.x + jitter(spread),
        at.y + jitter(spread),
        at.z + jitter(spread),
        param(u, at),
      );
    }
  }

  /** small spherical cluster — a node, a commit, a city */
  blob(c: THREE.Vector3, r: number, n: number, w: number) {
    for (let k = 0; k < n; k++) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * TAU;
      const rr = r * Math.cbrt(Math.random());
      const s = Math.sqrt(1 - u * u);
      this.push(
        c.x + Math.cos(a) * s * rr,
        c.y + u * rr,
        c.z + Math.sin(a) * s * rr,
        w,
      );
    }
  }
}

/**
 * 0 · Neural network: five layers stacked bottom (input) → top (output),
 * sparsely wired. param: 0 at the input layer … 1 at the output, for the
 * forward-pass wave.
 */
function neuralNet(count: number) {
  const w = new Writer(count);
  const sides = [4, 4, 3, 3, 2];
  const spacing = 0.3;
  const last = sides.length - 1;
  const layers = sides.map((n, l) => {
    const pts: THREE.Vector3[] = [];
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        pts.push(
          V(
            (a - (n - 1) / 2) * spacing,
            -1.3 + l * 0.65,
            (b - (n - 1) / 2) * spacing,
          ),
        );
      }
    }
    return pts;
  });

  // every node feeds up to three nodes above it; every node above gets an input
  const edges: [THREE.Vector3, THREE.Vector3, number][] = [];
  for (let l = 0; l < last; l++) {
    const next = layers[l + 1];
    const fed = new Set<number>();
    for (const a of layers[l]) {
      for (const j of shuffle(next.map((_, k) => k)).slice(0, 3)) {
        fed.add(j);
        edges.push([a, next[j], l]);
      }
    }
    next.forEach((b, j) => fed.has(j) || edges.push([pick(layers[l]), b, l]));
  }

  const perNode = Math.floor((count * 0.28) / layers.flat().length);
  layers.forEach((pts, l) =>
    pts.forEach((p) => w.blob(p, 0.035, perNode, l / last)),
  );
  const perEdge = Math.floor((count - w.i) / edges.length);
  for (const [a, b, l] of edges)
    w.line([a, b], perEdge, (u) => (l + u) / last, 0.004);
  while (!w.full) {
    const [a, b, l] = pick(edges);
    w.line([a, b], 1, (u) => (l + u) / last, 0.004);
  }
  return w.out;
}

/**
 * 1 · CPU die: package outline, four cores, 28 pins and Manhattan-routed PCB
 * traces ending in vias. param: trace index + 0..1 along it (≥ 0); negative
 * values tag the other parts (-1 package, -2 cores, -3 vias, -4 die fill).
 */
function chip(count: number) {
  const w = new Writer(count);
  const H = 0.42;
  const square = (cx: number, cy: number, h: number) => [
    V(cx - h, cy - h, 0),
    V(cx + h, cy - h, 0),
    V(cx + h, cy + h, 0),
    V(cx - h, cy + h, 0),
    V(cx - h, cy - h, 0),
  ];

  w.line(square(0, 0, H), Math.floor(count * 0.07), () => -1);
  w.line(square(0, 0, H - 0.05), Math.floor(count * 0.05), () => -1);
  for (const cx of [-0.17, 0.17]) {
    for (const cy of [-0.17, 0.17])
      w.line(square(cx, cy, 0.11), Math.floor(count * 0.025), () => -2);
  }

  const pins: THREE.Vector3[][] = [];
  const traces: THREE.Vector3[][] = [];
  const normals = [V(0, -1, 0), V(1, 0, 0), V(0, 1, 0), V(-1, 0, 0)];
  for (const out of normals) {
    const tan = V(-out.y, out.x, 0);
    for (let k = 0; k < 7; k++) {
      const along = ((k + 0.5) / 7 - 0.5) * 2 * (H - 0.08);
      const base = out.clone().multiplyScalar(H).addScaledVector(tan, along);
      const pinEnd = base.clone().addScaledVector(out, 0.09);
      pins.push([base, pinEnd]);
      // out, jog sideways (fanning away from the side's centre), out again
      const p1 = pinEnd
        .clone()
        .addScaledVector(out, 0.06 + Math.random() * 0.28);
      const p2 = p1
        .clone()
        .addScaledVector(
          tan,
          Math.sign(along || 1) * (0.04 + Math.random() * 0.2),
        );
      const p3 = p2.clone().addScaledVector(out, 0.12 + Math.random() * 0.4);
      traces.push([pinEnd, p1, p2, p3]);
    }
  }

  const perPin = Math.floor((count * 0.06) / pins.length);
  for (const pin of pins) w.line(pin, perPin, () => -1, 0.01);
  const viaBudget = Math.floor(count * 0.08);
  const perTrace = Math.floor((count - w.i - viaBudget) / traces.length);
  traces.forEach((t, i) => w.line(t, perTrace, (u) => i + u * 0.999, 0.004));
  const perVia = Math.floor(viaBudget / traces.length);
  for (const t of traces) {
    const end = t[t.length - 1];
    for (let k = 0; k < perVia; k++) {
      const a = Math.random() * TAU;
      w.push(
        end.x + Math.cos(a) * 0.028,
        end.y + Math.sin(a) * 0.028,
        jitter(0.01),
        -3,
      );
    }
  }
  while (!w.full)
    w.push(jitter(2 * (H - 0.07)), jitter(2 * (H - 0.07)), jitter(0.02), -4);
  return w.out;
}

/**
 * 2 · git graph: main, develop, two features, a hotfix and an abandoned spike,
 * forking and merging on S-curves. param: lane colour (0 main, 1 develop,
 * 2 feature, 3 hotfix) + 4 for commit dots, plus height 0..1 in the fraction.
 */
function gitGraph(count: number) {
  const w = new Writer(count);
  const lanes = {
    main: [0, 0],
    dev: [0.42, 0.12],
    featA: [0.85, -0.18],
    featB: [0.88, 0.26],
    hotfix: [-0.42, -0.14],
    spike: [-0.8, 0.22],
  } as const;
  type Lane = keyof typeof lanes;
  const P = (l: Lane, y: number) => V(lanes[l][0], y, lanes[l][1]);
  const curve = (a: Lane, b: Lane, y0: number, y1: number) =>
    Array.from({ length: 17 }, (_, k) => {
      const s = k / 16;
      const e = s * s * (3 - 2 * s);
      return V(
        THREE.MathUtils.lerp(lanes[a][0], lanes[b][0], e),
        THREE.MathUtils.lerp(y0, y1, s),
        THREE.MathUtils.lerp(lanes[a][1], lanes[b][1], e),
      );
    });

  const segments: { pts: THREE.Vector3[]; lane: number }[] = [
    { pts: [P("main", -1.6), P("main", 1.6)], lane: 0 },
    { pts: curve("main", "dev", -1.4, -1.1), lane: 1 },
    { pts: [P("dev", -1.1), P("dev", 1.0)], lane: 1 },
    { pts: curve("dev", "main", -0.35, -0.05), lane: 1 },
    { pts: curve("dev", "main", 0.45, 0.75), lane: 1 },
    { pts: curve("dev", "main", 1.0, 1.3), lane: 1 },
    { pts: curve("dev", "featA", -0.95, -0.7), lane: 2 },
    { pts: [P("featA", -0.7), P("featA", -0.2)], lane: 2 },
    { pts: curve("featA", "dev", -0.2, 0.05), lane: 2 },
    { pts: curve("dev", "featB", 0.1, 0.35), lane: 2 },
    { pts: [P("featB", 0.35), P("featB", 0.8)], lane: 2 },
    { pts: curve("featB", "dev", 0.8, 1.0), lane: 2 },
    { pts: curve("main", "hotfix", 0.15, 0.4), lane: 3 },
    { pts: [P("hotfix", 0.4), P("hotfix", 0.7)], lane: 3 },
    { pts: curve("hotfix", "main", 0.7, 0.95), lane: 3 },
    { pts: curve("main", "spike", -0.95, -0.7), lane: 2 },
    { pts: [P("spike", -0.7), P("spike", -0.15)], lane: 2 },
  ];
  const height = (y: number) =>
    THREE.MathUtils.clamp((y + 1.6) / 3.2, 0, 0.999);

  const commits: { at: THREE.Vector3; lane: number }[] = [];
  for (const { pts, lane } of segments) {
    if (pts.length !== 2) continue;
    const n = Math.max(2, Math.round(pts[0].distanceTo(pts[1]) / 0.24));
    for (let k = 0; k <= n; k++)
      commits.push({ at: pts[0].clone().lerp(pts[1], k / n), lane });
  }
  const perCommit = Math.floor((count * 0.22) / commits.length);
  for (const c of commits)
    w.blob(c.at, 0.035, perCommit, 4 + c.lane + height(c.at.y));

  const total = segments.reduce((s, seg) => s + polyLength(seg.pts), 0);
  const budget = count - w.i;
  for (const { pts, lane } of segments) {
    w.line(
      pts,
      Math.floor((budget * polyLength(pts)) / total),
      (_, at) => lane + height(at.y),
      0.004,
    );
  }
  while (!w.full) {
    const { pts, lane } = pick(segments);
    w.line(pts, 1, (_, at) => lane + height(at.y), 0.004);
  }
  return w.out;
}

/**
 * 3 · 3D bar chart: 6×6 wireframe bars on a floor grid with a y-axis. For bars
 * y holds the fraction of the bar's height (the shader animates the height) and
 * param = 1 + bar index; floor and axis particles have param 0.
 */
function barChart(count: number) {
  const w = new Writer(count);
  const n = 6;
  const cell = 0.34;
  const half = 0.11;
  const extent = (n / 2) * cell;

  const grid: THREE.Vector3[][] = [];
  for (let k = 0; k <= n; k++) {
    const t = -extent + k * cell;
    grid.push(
      [V(t, 0, -extent), V(t, 0, extent)],
      [V(-extent, 0, t), V(extent, 0, t)],
    );
  }
  const perGrid = Math.floor((count * 0.14) / grid.length);
  for (const g of grid) w.line(g, perGrid, () => 0, 0.003);
  w.line(
    [V(-extent, 0, -extent), V(-extent, 1.25, -extent)],
    Math.floor(count * 0.03),
    () => 0,
    0.003,
  );
  for (let k = 1; k <= 4; k++) {
    const y = k * 0.28;
    w.line(
      [V(-extent, y, -extent), V(-extent + 0.08, y, -extent)],
      Math.floor(count * 0.004),
      () => 0,
      0.002,
    );
  }

  const bars: { x: number; z: number; id: number }[] = [];
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      bars.push({
        x: -extent + (a + 0.5) * cell,
        z: -extent + (b + 0.5) * cell,
        id: a * n + b,
      });
    }
  }
  const perEdge = Math.floor((count - w.i) / (bars.length * 8));
  for (const { x, z, id } of bars) {
    const corners = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].map(([u, v]) => [x + u * half, z + v * half]);
    corners.forEach(([cx, cz], k) => {
      const [nx, nz] = corners[(k + 1) % 4];
      w.line([V(cx, 0, cz), V(cx, 1, cz)], perEdge, () => 1 + id, 0.002);
      w.line([V(cx, 1, cz), V(nx, 1, nz)], perEdge, () => 1 + id, 0.002);
    });
  }
  while (!w.full) {
    const { x, z, id } = pick(bars);
    w.push(x + jitter(2 * half), 1, z + jitter(2 * half), 1 + id);
  }
  return w.out;
}

/** the static part of the loss surface — the shader adds a drifting ripple on top */
const loss = (x: number, z: number) =>
  0.12 * (x * x + z * z) -
  0.6 * Math.exp(-((x - 0.5) ** 2 + (z + 0.3) ** 2) * 2);

/**
 * 4 · Loss landscape (wireframe grid, param -1) plus the trajectory of an
 * actual momentum-SGD run on it, param 0..1 from start to convergence.
 * Heights are computed in the shader.
 */
function lossLandscape(count: number, lines: number) {
  const w = new Writer(count);
  const e = 1e-3;
  let x = -1.45;
  let z = 1.3;
  let vx = 0;
  let vz = 0;
  const path = [V(x, 0, z)];
  for (let i = 0; i < 600; i++) {
    const gx = (loss(x + e, z) - loss(x - e, z)) / (2 * e);
    const gz = (loss(x, z + e) - loss(x, z - e)) / (2 * e);
    vx = 0.9 * vx - 0.02 * gx;
    vz = 0.9 * vz - 0.02 * gz;
    x += vx;
    z += vz;
    path.push(V(x, 0, z));
    if (i > 60 && Math.hypot(vx, vz) < 2e-4) break;
  }
  w.line(path, Math.floor(count * 0.07), (u) => u * 0.999, 0.003);

  const span = 3.4;
  const total = lines * 2;
  const perLine = Math.floor((count - w.i) / total);
  for (let line = 0; line < total; line++) {
    const fixed = ((line % lines) / (lines - 1) - 0.5) * span;
    const ends =
      line < lines
        ? [V(-span / 2, 0, fixed), V(span / 2, 0, fixed)]
        : [V(fixed, 0, -span / 2), V(fixed, 0, span / 2)];
    w.line(ends, perLine, () => -1, 0);
  }
  while (!w.full) w.push(jitter(span), 0, jitter(span), -1);
  return w.out;
}

/**
 * 5 · Network globe: lat/long graticule (param -1), cities (-3) and great-circle
 * request arcs lifted off the surface (arc index + 0..1 along it).
 */
function globe(count: number) {
  const w = new Writer(count);
  const S = (lat: number, lon: number, r = 1) =>
    V(
      r * Math.cos(lat) * Math.cos(lon),
      r * Math.sin(lat),
      r * Math.cos(lat) * Math.sin(lon),
    );

  const circles: THREE.Vector3[][] = [];
  for (let k = -3; k <= 3; k++) {
    circles.push(
      Array.from({ length: 73 }, (_, j) =>
        S((k * Math.PI) / 8, (j / 72) * TAU),
      ),
    );
  }
  for (let k = 0; k < 12; k++) {
    circles.push(
      Array.from({ length: 49 }, (_, j) =>
        S(-Math.PI / 2 + (j / 48) * Math.PI, (k / 12) * TAU),
      ),
    );
  }
  const gridLengths = circles.map(polyLength);
  const gridTotal = gridLengths.reduce((a, b) => a + b, 0);
  const gridBudget = Math.floor(count * 0.5);
  circles.forEach((c, i) =>
    w.line(
      c,
      Math.floor((gridBudget * gridLengths[i]) / gridTotal),
      () => -1,
      0.003,
    ),
  );

  const cities = Array.from({ length: 12 }, () =>
    S((Math.random() - 0.5) * 2, Math.random() * TAU),
  );
  const perCity = Math.floor((count * 0.08) / cities.length);
  for (const c of cities)
    w.blob(c.clone().multiplyScalar(1.01), 0.03, perCity, -3);

  const arcs: THREE.Vector3[][] = [];
  for (let k = 0; k < 16; k++) {
    const a = cities[k % cities.length];
    const b =
      cities[
        (k + 1 + Math.floor(Math.random() * (cities.length - 1))) %
          cities.length
      ];
    const omega = a.angleTo(b);
    const lift = 0.12 + 0.35 * (omega / Math.PI);
    arcs.push(
      Array.from({ length: 33 }, (_, j) => {
        const t = j / 32;
        // slerp between the two cities, bowed outward
        const s = Math.sin(omega) || 1;
        const p = a
          .clone()
          .multiplyScalar(Math.sin((1 - t) * omega) / s)
          .addScaledVector(b, Math.sin(t * omega) / s);
        return p.setLength(1 + lift * Math.sin(Math.PI * t));
      }),
    );
  }
  const arcLengths = arcs.map(polyLength);
  const arcTotal = arcLengths.reduce((a, b) => a + b, 0);
  const arcBudget = count - w.i;
  arcs.forEach((arc, i) =>
    w.line(
      arc,
      Math.floor((arcBudget * arcLengths[i]) / arcTotal),
      (u) => i + u * 0.999,
      0.003,
    ),
  );
  while (!w.full) w.line(pick(circles), 1, () => -1, 0.003);
  return w.out;
}

export function buildEntityGeometry(count: number, surfaceLines: number) {
  const net = neuralNet(count);
  const position = new Float32Array(count * 3);
  const meta = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    position.set(net.subarray(i * 4, i * 4 + 3), i * 3);
    meta[i * 4] = Math.random(); // per-particle random
    meta[i * 4 + 1] = i / count; // stable seed
    meta[i * 4 + 2] = net[i * 4 + 3]; // neural-net param (layer progress)
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(position, 3));
  g.setAttribute("aChip", new THREE.BufferAttribute(chip(count), 4));
  g.setAttribute("aGit", new THREE.BufferAttribute(gitGraph(count), 4));
  g.setAttribute("aBars", new THREE.BufferAttribute(barChart(count), 4));
  g.setAttribute(
    "aLoss",
    new THREE.BufferAttribute(lossLandscape(count, surfaceLines), 4),
  );
  g.setAttribute("aGlobe", new THREE.BufferAttribute(globe(count), 4));
  g.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
  return g;
}
