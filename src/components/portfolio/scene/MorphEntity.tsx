import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  CORE,
  HELPERS,
  NOISE,
  STREAK_FRAGMENT,
  STREAK_VERTEX,
  WORLD_FX,
} from "./glsl";
import {
  buildEntityGeometry,
  buildSynapses,
  PLACEMENTS,
  SHAPES,
} from "./shapes";
import {
  ACCENT,
  GREEN,
  additiveShader,
  frame,
  input,
  shared,
  smoothstep,
} from "./state";

// ── particle entity ──────────────────────────────────────────────────────

const entityVertex = /* glsl */ `
uniform float uTime;
uniform float uFrom;
uniform float uTo;
uniform float uMorph;
uniform float uIntro;
uniform vec3 uBurstOrigin;
uniform float uScale;
uniform vec3 uAccent;
uniform vec3 uGreen;
uniform vec3 uHot;

attribute vec3 aLorenz;
attribute vec3 aHelix;
attribute vec3 aGalaxy;
attribute vec3 aSurface;
attribute vec3 aVortex;
attribute vec2 aMeta; // x: random 0..1, y: index / count

varying vec3 vColor;
varying float vAlpha;

${NOISE}
${HELPERS}
${CORE}
${WORLD_FX}
${STREAK_VERTEX}

// position, colour and glow of this particle in shape idx (see shapes.ts)
void shape(float idx, out vec3 p, out vec3 c, out float glow) {
  float rnd = aMeta.x;
  float seq = aMeta.y;
  glow = 0.0;

  if (idx < 0.5) {
    // neural core: breathing noise sphere with the odd hot spark
    float n;
    p = corePosition(position, n);
    c = mix(uAccent, uGreen, smoothstep(0.35, 0.8, n * 0.5 + 0.5));
    glow = step(0.985, rnd) * (0.5 + 0.5 * sin(uTime * 3.0 + rnd * 60.0));
    c = mix(c, uHot, glow);
  } else if (idx < 1.5) {
    // lorenz attractor on a turntable; pulses of light run along the trajectory
    p = rotY(aLorenz, uTime * 0.12);
    c = mix(uAccent, uGreen, smoothstep(-0.5, 0.5, aLorenz.x));
    glow = pow(fract(seq * 30.0 - uTime * 0.12), 14.0);
  } else if (idx < 2.5) {
    // double helix; data streams up the strands
    p = rotZ(rotY(aHelix, uTime * 0.35), 0.18);
    float strandB = step(0.4, seq) * (1.0 - step(0.8, seq));
    float rung = step(0.8, seq);
    c = mix(mix(uAccent, uGreen, strandB), uHot, rung * 0.7);
    glow = pow(fract(aHelix.y * 0.5 - uTime * 0.3 + strandB * 0.5), 12.0) * (1.0 - rung);
  } else if (idx < 3.5) {
    // spiral galaxy with differential rotation — the core spins faster
    float r = length(aGalaxy.xz);
    p = rotY(aGalaxy, uTime * 0.3 / (0.3 + r));
    p = rotZ(rotX(p, 0.65), 0.22);
    c = mix(vec3(1.0, 0.8, 0.7), uHot, smoothstep(0.0, 0.25, r));
    c = mix(c, uAccent, smoothstep(0.15, 0.7, r));
    c = mix(c, uGreen, smoothstep(0.9, 1.8, r) * step(0.4, rnd));
    glow = (1.0 - smoothstep(0.0, 0.35, r)) * 0.25;
  } else if (idx < 4.5) {
    // loss landscape: bowl + a deep minimum + drifting ripples
    float x = aSurface.x;
    float z = aSurface.z;
    float y = 0.12 * (x * x + z * z)
      - 0.6 * exp(-((x - 0.5) * (x - 0.5) + (z + 0.3) * (z + 0.3)) * 2.0)
      + 0.08 * sin(3.0 * x + uTime * 0.8) * cos(2.6 * z + uTime * 0.6);
    p = rotX(rotY(vec3(x, y, z), uTime * 0.06), 0.6);
    c = mix(uGreen, uAccent, smoothstep(-0.45, 0.5, y));
    c = mix(c, uHot, smoothstep(0.45, 0.75, y));
    // the global minimum pulses — "converged"
    glow = (1.0 - smoothstep(0.0, 0.35, length(vec2(x - 0.5, z + 0.3)))) * (0.6 + 0.4 * sin(uTime * 2.0));
  } else {
    // vortex ring: particles roll around the tube while the ring turns
    float u = aVortex.x + uTime * 0.12;
    float v = aVortex.y + uTime * 0.9;
    float rr = 0.32 * aVortex.z;
    p = vec3((1.0 + rr * cos(v)) * cos(u), rr * sin(v), (1.0 + rr * cos(v)) * sin(u));
    p = rotX(p, 1.2);
    c = mix(uAccent, uGreen, 0.5 + 0.5 * cos(v));
    glow = pow(0.5 + 0.5 * sin(u * 5.0 - uTime * 1.6), 18.0);
  }
}

void main() {
  vec3 p;
  vec3 col;
  float glow;
  shape(uFrom, p, col, glow);

  if (uMorph > 0.0001) {
    vec3 pB;
    vec3 cB;
    float gB;
    shape(uTo, pB, cB, gB);
    // staggered per particle, and swarming through noise while in transit
    float delay = aMeta.x * 0.4;
    float m = smoothstep(delay, delay + 0.6, uMorph);
    p = mix(p, pB, m);
    col = mix(col, cB, m);
    glow = mix(glow, gB, m);
    float transit = sin(m * PI);
    vec3 q = p * 0.8 + vec3(0.0, uTime * 0.2, 0.0);
    p += vec3(snoise(q), snoise(q + 17.1), snoise(q + 31.7)) * transit * 0.6;
  }

  // intro: singularity → explosion → spiral back into shape
  float burst = 0.0;
  if (uIntro < 1.0) {
    float t = clamp((uIntro - aMeta.x * 0.12) / 0.88, 0.0, 1.0);
    vec3 dir = normalize(hash3(aMeta.y * 1731.0 + aMeta.x * 91.0) * 2.0 - 1.0);
    float out1 = 1.0 - pow(1.0 - clamp(t / 0.28, 0.0, 1.0), 4.0);
    float settle = smoothstep(0.18, 1.0, t);
    vec3 flung = dir * (2.2 + aMeta.x * 4.0) * out1;
    flung = uBurstOrigin + rotY(flung, (1.0 - settle) * 3.0);
    p = mix(flung, p, settle);
    burst = 1.0 - settle;
    col = mix(col, mix(vec3(1.0), uHot, aMeta.x), burst * 0.6);
  }

  vec4 world = modelMatrix * vec4(p, 1.0);
  float push;
  float shock;
  world.xyz = applyWorldFx(world.xyz, push, shock);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  computeStreak(gl_Position);

  float size = (0.05 + aMeta.x * 0.07) * (1.0 + glow * 1.6 + shock * 2.5 + push * 0.8 + burst * 0.8);
  gl_PointSize = size * vStretch * uScale / -mv.z;

  vColor = col + (glow * 0.6 + shock * 0.8 + push * 0.3) * 0.5;
  vAlpha = (0.3 + 0.7 * smoothstep(-2.5, 1.5, world.z)) * (1.0 + glow);
}
`;

const entityFragment = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
${STREAK_FRAGMENT}

void main() {
  float a = pow(spriteMask(), 1.3);
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
}
`;

// ── synapses: thin wires with pulses firing along them ───────────────────

const synapseVertex = /* glsl */ `
uniform float uTime;
attribute vec2 aEdge; // x: 0 at one end, 1 at the other; y: phase
varying float vT;
varying float vPhase;
varying float vShock;

${NOISE}
${HELPERS}
${CORE}
${WORLD_FX}

void main() {
  float n;
  vec4 world = modelMatrix * vec4(corePosition(position, n), 1.0);
  float push;
  float shock;
  world.xyz = applyWorldFx(world.xyz, push, shock);
  gl_Position = projectionMatrix * viewMatrix * world;
  vT = aEdge.x;
  vPhase = aEdge.y;
  vShock = shock;
}
`;

const synapseFragment = /* glsl */ `
uniform float uTime;
uniform float uAlpha;
uniform vec3 uAccent;
varying float vT;
varying float vPhase;
varying float vShock;

void main() {
  float cycle = uTime * 0.45 + vPhase;
  // each cycle a random ~45% of the wires fire
  float fires = step(0.55, fract(sin(floor(cycle) * 12.9898 + vPhase * 78.233) * 43758.5453));
  float pulse = (1.0 - smoothstep(0.0, 0.14, abs(vT - fract(cycle)))) * fires;
  vec3 col = mix(uAccent, vec3(1.0), pulse * 0.7);
  gl_FragColor = vec4(col, (0.07 + pulse * 0.85 + vShock * 0.5) * uAlpha);
}
`;

const neuronVertex = /* glsl */ `
uniform float uTime;
uniform float uScale;
attribute float aRandom;
varying float vTwinkle;

${NOISE}
${HELPERS}
${CORE}
${WORLD_FX}

void main() {
  float n;
  vec4 world = modelMatrix * vec4(corePosition(position, n), 1.0);
  float push;
  float shock;
  world.xyz = applyWorldFx(world.xyz, push, shock);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  vTwinkle = 0.55 + 0.45 * sin(uTime * (1.0 + aRandom * 2.0) + aRandom * 50.0);
  gl_PointSize = (0.09 + aRandom * 0.05) * (1.0 + shock * 2.0) * uScale / -mv.z;
}
`;

const neuronFragment = /* glsl */ `
uniform float uAlpha;
uniform vec3 uAccent;
varying float vTwinkle;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.0, 0.5, d));
  float core = (1.0 - smoothstep(0.0, 0.18, d));
  gl_FragColor = vec4(mix(uAccent, vec3(1.0), core), (a * 0.6 + core) * vTwinkle * uAlpha);
}
`;

// ── component ────────────────────────────────────────────────────────────

const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

export function MorphEntity({
  count,
  nodes,
  surfaceLines,
}: {
  count: number;
  nodes: number;
  surfaceLines: number;
}) {
  const group = useRef<THREE.Group>(null);
  const extras = useRef<THREE.Group>(null);
  const cage = useRef<THREE.LineSegments>(null);
  const satA = useRef<THREE.Mesh>(null);
  const satB = useRef<THREE.Mesh>(null);
  const wide = useThree((s) => s.size.width >= 768);

  const geometry = useMemo(
    () => buildEntityGeometry(count, surfaceLines),
    [count, surfaceLines],
  );
  const synapses = useMemo(() => buildSynapses(nodes), [nodes]);
  const cageGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.62, 1)),
    [],
  );
  const rings = useMemo(
    () =>
      [1.55, 1.85].map((r) =>
        new THREE.BufferGeometry().setFromPoints(
          new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2).getPoints(128),
        ),
      ),
    [],
  );
  const satGeometry = useMemo(() => new THREE.SphereGeometry(0.03, 12, 12), []);

  const uniforms = useMemo(
    () => ({
      ...shared,
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uMorph: { value: 0 },
      uIntro: { value: 0 },
      uBurstOrigin: { value: new THREE.Vector3() },
      uOpacity: { value: 1 },
      uWarp: { value: 0 },
    }),
    [],
  );
  const synapseUniforms = useMemo(
    () => ({ ...shared, uAlpha: { value: 0 } }),
    [],
  );
  const entityMat = useMemo(
    () => additiveShader(entityVertex, entityFragment, uniforms),
    [uniforms],
  );
  const synapseMat = useMemo(
    () => additiveShader(synapseVertex, synapseFragment, synapseUniforms),
    [synapseUniforms],
  );
  const neuronMat = useMemo(
    () => additiveShader(neuronVertex, neuronFragment, synapseUniforms),
    [synapseUniforms],
  );

  // core-only extras fade with the core's share of the morph
  const cageMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0,
      }),
    [],
  );
  const ringMats = useMemo(
    () =>
      [ACCENT, GREEN].map(
        (color) =>
          new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }),
      ),
    [],
  );
  const satMats = useMemo(
    () =>
      [ACCENT, GREEN].map(
        (color) =>
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 }),
      ),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      synapses.lines.dispose();
      synapses.neurons.dispose();
      cageGeometry.dispose();
      rings.forEach((r) => r.dispose());
      satGeometry.dispose();
      [
        entityMat,
        synapseMat,
        neuronMat,
        cageMat,
        ...ringMats,
        ...satMats,
      ].forEach((m) => m.dispose());
    },
    [
      geometry,
      synapses,
      cageGeometry,
      rings,
      satGeometry,
      entityMat,
      synapseMat,
      neuronMat,
      cageMat,
      ringMats,
      satMats,
    ],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const last = SHAPES.length - 1;
    const from = Math.min(Math.floor(frame.s), last);
    const to = Math.min(from + 1, last);
    const t = to === from ? 0 : frame.s - from;
    uniforms.uFrom.value = from;
    uniforms.uTo.value = to;
    uniforms.uMorph.value = t;
    uniforms.uIntro.value = frame.intro;

    const table = wide ? PLACEMENTS.wide : PLACEMENTS.narrow;
    const a = table[from];
    const b = table[to];
    const x = lerp(a.x, b.x, t);
    const y = lerp(a.y, b.y, t);
    const scale = lerp(a.scale, b.scale, t);
    const opacity = lerp(a.opacity, b.opacity, t);

    // the entity rides along with the camera, so it stays put on screen while
    // the dust and wireframes scroll past it
    g.position.set(x, frame.camY + y, 0);
    g.scale.setScalar(scale);
    g.rotation.x = damp(g.rotation.x, -input.y * 0.18, 2, delta);
    g.rotation.y = damp(g.rotation.y, input.x * 0.25, 2, delta);
    uniforms.uOpacity.value = opacity;
    // the explosion starts at the screen centre, where the boot screen collapsed
    uniforms.uBurstOrigin.value.set(-x / scale, -y / scale, 0);

    const coreWeight = from === 0 ? 1 - t : 0;
    const w = coreWeight * smoothstep(0.55, 1, frame.intro);
    synapseUniforms.uAlpha.value = w * opacity;
    cageMat.opacity = 0.2 * w;
    ringMats[0].opacity = 0.14 * w;
    ringMats[1].opacity = 0.1 * w;
    satMats[0].opacity = satMats[1].opacity = w;
    if (extras.current) extras.current.visible = w > 0.005;

    if (cage.current) {
      cage.current.rotation.y -= delta * 0.25;
      cage.current.rotation.z += delta * 0.12;
    }
    const time = state.clock.elapsedTime;
    satA.current?.position.set(
      Math.cos(time * 0.6) * 1.55,
      Math.sin(time * 0.6) * 1.55,
      0,
    );
    satB.current?.position.set(
      Math.cos(-time * 0.4) * 1.85,
      Math.sin(-time * 0.4) * 1.85,
      0,
    );
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={entityMat} frustumCulled={false} />

      <group ref={extras} visible={false}>
        <lineSegments
          geometry={synapses.lines}
          material={synapseMat}
          frustumCulled={false}
        />
        <points
          geometry={synapses.neurons}
          material={neuronMat}
          frustumCulled={false}
        />
        <lineSegments ref={cage} geometry={cageGeometry} material={cageMat} />
        <group rotation={[1.2, 0.2, 0]}>
          <lineLoop geometry={rings[0]} material={ringMats[0]} />
          <mesh ref={satA} geometry={satGeometry} material={satMats[0]} />
        </group>
        <group rotation={[1.9, -0.5, 0.3]}>
          <lineLoop geometry={rings[1]} material={ringMats[1]} />
          <mesh ref={satB} geometry={satGeometry} material={satMats[1]} />
        </group>
      </group>
    </group>
  );
}
