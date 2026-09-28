import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  HELPERS,
  NOISE,
  STREAK_FRAGMENT,
  STREAK_VERTEX,
  WORLD_FX,
} from "./glsl";
import { buildEntityGeometry, PLACEMENTS, SHAPES } from "./shapes";
import { additiveShader, frame, input, shared } from "./state";

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

// xyz + a per-shape param (see shapes.ts for what each param means)
attribute vec4 aChip;
attribute vec4 aGit;
attribute vec4 aBars;
attribute vec4 aLoss;
attribute vec4 aGlobe;
attribute vec4 aMeta; // x: random 0..1, y: seed, z: neural-net layer progress

varying vec3 vColor;
varying float vAlpha;

${NOISE}
${HELPERS}
${WORLD_FX}
${STREAK_VERTEX}

// a looping pulse travelling along a 0..1 param
float pulse(float t, float speed, float phase, float sharpness) {
  return pow(fract(t - uTime * speed + phase), sharpness);
}

// position, colour and glow of this particle in shape idx
void shape(float idx, out vec3 p, out vec3 c, out float glow) {
  glow = 0.0;

  if (idx < 0.5) {
    // neural network: a forward pass sweeps up through the layers
    p = rotX(rotY(position, uTime * 0.15), 0.32);
    float front = fract(uTime * 0.2) * 1.3 - 0.15;
    float d = aMeta.z - front;
    glow = exp(-d * d * 200.0);
    c = mix(uAccent, uGreen, aMeta.z);
  } else if (idx < 1.5) {
    // cpu die: signals leave the package along each trace
    p = rotX(rotY(aChip.xyz, sin(uTime * 0.2) * 0.35), -0.6);
    float w = aChip.w;
    if (w >= 0.0) {
      glow = pulse(fract(w), 0.45, floor(w) * 0.618, 22.0);
      c = mix(uAccent * 0.75, uGreen, glow);
    } else if (w > -1.5) {
      c = uAccent; // package + pins
    } else if (w > -2.5) {
      c = uGreen * 0.9; // cores, busy
      glow = 0.2 + 0.2 * sin(uTime * 2.0 + p.x * 8.0);
    } else if (w > -3.5) {
      c = uHot * 0.9; // vias
      glow = 0.3;
    } else {
      c = uAccent * 0.3; // silicon
    }
  } else if (idx < 2.5) {
    // git graph: commits flow upward along every branch
    p = rotX(rotY(aGit.xyz, sin(uTime * 0.3) * 0.6), 0.12);
    float base = floor(aGit.w);
    float commit = step(3.5, base);
    float lane = base - 4.0 * commit;
    c = lane < 0.5 ? uAccent : lane < 1.5 ? uGreen : lane < 2.5 ? mix(uAccent, uGreen, 0.5) : uHot;
    c *= mix(0.7, 1.1, commit);
    glow = pulse(fract(aGit.w) * 3.0, 0.25, 0.0, 16.0) * (1.0 - commit * 0.5) + commit * 0.2;
  } else if (idx < 3.5) {
    // live bar chart: every bar's height keeps updating
    float y = aBars.y;
    float h = 0.0;
    if (aBars.w >= 1.0) {
      float id = aBars.w - 1.0;
      float seed = fract(sin(id * 12.9898) * 43758.5453);
      h = 0.18 + 0.95 * seed * (0.55 + 0.45 * sin(uTime * 0.8 + id * 0.7));
      y = aBars.y * h;
      c = mix(uGreen, uAccent, smoothstep(0.2, 0.7, h));
      c = mix(c, uHot, smoothstep(0.75, 1.05, h));
      glow = smoothstep(0.97, 1.0, aBars.y) * 0.3; // bar tops
    } else {
      c = uAccent * 0.4; // floor grid + axis
    }
    p = rotX(rotY(vec3(aBars.x, y - 0.5, aBars.z), uTime * 0.12), 0.45);
  } else if (idx < 4.5) {
    // loss landscape with the optimiser's trajectory descending into the minimum
    float x = aLoss.x;
    float z = aLoss.z;
    float y = 0.12 * (x * x + z * z)
      - 0.6 * exp(-((x - 0.5) * (x - 0.5) + (z + 0.3) * (z + 0.3)) * 2.0)
      + 0.06 * sin(3.0 * x + uTime * 0.8) * cos(2.6 * z + uTime * 0.6);
    float path = step(0.0, aLoss.w);
    y += path * 0.04;
    p = rotX(rotY(vec3(x, y, z), uTime * 0.06), 0.6);
    c = mix(uGreen, uAccent, smoothstep(-0.45, 0.5, y)) * 0.7;
    c = mix(c, uHot * 0.8, smoothstep(0.45, 0.75, y));
    c = mix(c, uHot, path * 0.6);
    glow = path * (0.2 + pulse(aLoss.w, 0.15, 0.0, 30.0) * 1.2);
    glow += (1.0 - smoothstep(0.0, 0.3, length(vec2(x - 0.5, z + 0.3)))) * 0.3 * (1.0 - path);
  } else {
    // network globe: requests travel along the arcs between cities
    p = rotX(rotY(aGlobe.xyz, uTime * 0.12), 0.35);
    float w = aGlobe.w;
    if (w >= 0.0) {
      glow = pulse(fract(w), 0.4, floor(w) * 0.37, 20.0);
      c = mix(uGreen * 0.8, vec3(0.85, 1.0, 0.95), glow * 0.5);
    } else if (w > -1.5) {
      c = uAccent * 0.4; // graticule
    } else {
      c = uHot * 0.9; // cities
      glow = 0.3 + 0.2 * sin(uTime * 3.0 + aGlobe.x * 10.0);
    }
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
    col = mix(col, mix(vec3(0.9), uHot, aMeta.x), burst * 0.3);
  }

  vec4 world = modelMatrix * vec4(p, 1.0);
  float push;
  float shock;
  world.xyz = applyWorldFx(world.xyz, push, shock);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  computeStreak(gl_Position);

  // small, crisp points; highlights come from density and pulses, not size
  float size = (0.036 + aMeta.x * 0.045) * (1.0 + glow * 1.1 + shock * 2.0 + push * 0.6 + burst * 0.4);
  gl_PointSize = size * vStretch * uScale / -mv.z;

  vColor = col * 0.85 + (glow * 0.35 + shock * 0.5 + push * 0.2) * 0.5;
  vAlpha = (0.22 + 0.5 * smoothstep(-2.5, 1.5, world.z)) * (1.0 + glow * 0.9);
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

// ── component ────────────────────────────────────────────────────────────

const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

export function MorphEntity({
  count,
  surfaceLines,
}: {
  count: number;
  surfaceLines: number;
}) {
  const group = useRef<THREE.Group>(null);
  const wide = useThree((s) => s.size.width >= 768);

  const geometry = useMemo(
    () => buildEntityGeometry(count, surfaceLines),
    [count, surfaceLines],
  );
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
  const material = useMemo(
    () => additiveShader(entityVertex, entityFragment, uniforms),
    [uniforms],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
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

    // the entity rides along with the camera, so it stays put on screen while
    // the dust and wireframes scroll past it
    g.position.set(x, frame.camY + y, 0);
    g.scale.setScalar(scale);
    g.rotation.x = damp(g.rotation.x, -input.y * 0.18, 2, delta);
    g.rotation.y = damp(g.rotation.y, input.x * 0.25, 2, delta);
    uniforms.uOpacity.value = lerp(a.opacity, b.opacity, t);
    // the explosion starts at the screen centre, where the boot screen collapsed
    uniforms.uBurstOrigin.value.set(-x / scale, -y / scale, 0);
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
