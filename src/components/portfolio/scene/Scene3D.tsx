import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HELPERS, STREAK_FRAGMENT, STREAK_VERTEX, WORLD_FX } from "./glsl";
import { MorphEntity } from "./MorphEntity";
import { SHAPES } from "./shapes";
import {
  ACCENT,
  additiveShader,
  GREEN,
  HOT,
  INTRO_SECONDS,
  SCROLL_DEPTH,
  frame,
  input,
  shared,
  smoothstep,
} from "./state";
import { SCENE_STATUS_EVENT, type SceneStatus } from "./events";

/**
 * Page-wide WebGL layer, one fixed canvas behind all content:
 *  - a particle entity that morphs into a different shape for each section
 *  - a big-bang intro: flash, shockwave rings, warp-speed dust, camera shake
 *  - cursor repulsion, click shockwaves, and scroll-speed streaks
 * Lazy-loaded via Background3D so three.js never blocks first paint.
 */

// how many viewports of page the dust field covers
const DUST_VIEWPORTS = 14;
const damp = THREE.MathUtils.damp;

// ── director: input → per-frame state ────────────────────────────────────

type Bounds = { top: number; bottom: number };

/** Continuous shape index for a document y, morphing across each section boundary. */
function shapeIndexAt(y: number, bounds: Bounds[], vh: number) {
  if (!bounds.length) return 0;
  const w = vh * 0.28; // half-width of the morph zone around each boundary
  let i = 0;
  while (i < bounds.length - 1 && y >= bounds[i + 1].top) i++;
  if (i < bounds.length - 1 && y > bounds[i].bottom - w) {
    return i + smoothstep(0, 1, (y - (bounds[i].bottom - w)) / (2 * w));
  }
  if (i > 0 && y < bounds[i].top + w) {
    return i - 1 + smoothstep(0, 1, (y - (bounds[i].top - w)) / (2 * w));
  }
  return i;
}

function Director({
  points,
  onStart,
}: {
  points: number;
  onStart?: () => void;
}) {
  const camera = useThree((s) => s.camera);
  const setDpr = useThree((s) => s.setDpr);
  const bounds = useRef<Bounds[]>([]);
  const lastScroll = useRef(0);
  const shown = useRef(-1);
  const pointer = useRef({ x: 0, y: 0 });
  const fps = useRef({ frames: 0, time: 0, value: 60, lowered: false });
  const ray = useMemo(() => new THREE.Vector3(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    frame.introStart = -1;
    frame.intro = 0;
    lastScroll.current = window.scrollY;

    const measure = () => {
      bounds.current = SHAPES.map((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return bounds.current[i] ?? { top: 0, bottom: 0 };
        const r = el.getBoundingClientRect();
        return {
          top: r.top + window.scrollY,
          bottom: r.bottom + window.scrollY,
        };
      });
    };
    measure();
    // content height changes (e.g. expanding the project grid) move the boundaries
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const emit = (shape: number) => {
    const detail: SceneStatus = {
      shape: SHAPES[shape].name,
      points,
      fps: Math.round(fps.current.value),
    };
    window.dispatchEvent(new CustomEvent(SCENE_STATUS_EVENT, { detail }));
  };

  // unproject an NDC point onto the z = 0 plane
  const toPlane = (x: number, y: number, out: THREE.Vector3) => {
    ray.set(x, y, 0.5).unproject(camera).sub(camera.position).normalize();
    return out
      .copy(camera.position)
      .addScaledVector(ray, -camera.position.z / ray.z);
  };

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const time = state.clock.elapsedTime;
    frame.time = time;
    shared.uTime.value = time;
    shared.uScale.value = (state.size.height * state.viewport.dpr) / 2;

    // intro clock starts on the first rendered frame (after shader compile)
    if (frame.introStart < 0) {
      frame.introStart = time;
      onStart?.();
    }
    frame.introTime = time - frame.introStart;
    frame.intro = Math.min(1, frame.introTime / INTRO_SECONDS);
    frame.warp = (1 - frame.intro) ** 2;
    frame.warpTravel += frame.warp * 26 * delta;

    // scroll → camera height, streak strength, and which shape to show
    const vh = window.innerHeight || 1;
    const scrollY = window.scrollY;
    const velocity = (scrollY - lastScroll.current) / Math.max(rawDelta, 1e-3);
    lastScroll.current = scrollY;
    shared.uStreak.value = damp(
      shared.uStreak.value,
      Math.min(Math.abs(velocity) / 3500, 1),
      8,
      delta,
    );
    frame.camY = damp(frame.camY, -(scrollY / vh) * SCROLL_DEPTH, 6, delta);
    const target = shapeIndexAt(scrollY + vh / 2, bounds.current, vh);
    frame.s = frame.introTime < 0.1 ? target : damp(frame.s, target, 5, delta);

    // camera: smoothed pointer parallax + a jolt when the intro detonates
    const p = pointer.current;
    p.x = damp(p.x, input.x, 3, delta);
    p.y = damp(p.y, input.y, 3, delta);
    const shake =
      frame.introTime < 0.9 ? (1 - frame.introTime / 0.9) ** 2 * 0.09 : 0;
    camera.position.x = p.x * 0.35 + (Math.random() - 0.5) * shake;
    camera.position.y = frame.camY + p.y * 0.25 + (Math.random() - 0.5) * shake;
    camera.lookAt(0, frame.camY, 0);
    camera.updateMatrixWorld();

    // cursor ray, for repulsion at any depth
    shared.uRayOrigin.value.copy(camera.position);
    shared.uRayDir.value
      .set(input.x, input.y, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();
    shared.uMouseStrength.value = damp(
      shared.uMouseStrength.value,
      input.mouse ? 1 : 0,
      4,
      delta,
    );

    // clicks → shockwave through every particle
    const shock = shared.uShock.value;
    if (input.click) {
      toPlane(input.click.x, input.click.y, hit);
      shock.set(hit.x, hit.y, 0, 0);
      input.click = null;
    } else {
      shock.w += delta;
    }

    // status bar readout + adaptive resolution
    const f = fps.current;
    f.frames++;
    f.time += rawDelta;
    if (f.time >= 1) {
      f.value = f.frames / f.time;
      f.frames = 0;
      f.time = 0;
      if (!f.lowered && frame.introTime > 4 && f.value < 42) {
        f.lowered = true;
        setDpr(1);
      }
      emit(Math.round(frame.s));
    }
    const current = Math.round(frame.s);
    if (current !== shown.current) {
      shown.current = current;
      emit(current);
    }
  });

  return null;
}

// ── dust: parallax field that warps in during the intro ──────────────────

const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uScale;
uniform float uTravel;
uniform vec3 uAccent;
uniform vec3 uGreen;
attribute float aRandom;
varying float vTwinkle;
varying vec3 vColor;

${HELPERS}
${WORLD_FX}
${STREAK_VERTEX}

void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.1 + aRandom * 40.0) * 0.15;
  p.y += cos(uTime * 0.08 + aRandom * 25.0) * 0.15;
  // hyperspace: stream toward the camera, wrapping in a 10-unit deep slab
  p.z = mod(p.z + 8.0 + uTravel, 10.0) - 8.0;

  vec4 world = modelMatrix * vec4(p, 1.0);
  float push;
  float shock;
  world.xyz = applyWorldFx(world.xyz, push, shock);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  computeStreak(gl_Position);

  gl_PointSize = (0.035 + aRandom * 0.05) * (1.0 + shock * 2.0) * vStretch * uScale / -mv.z;
  vTwinkle = (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aRandom * 1.8) + aRandom * 100.0)))
    * (1.0 + shock * 2.0 + push);
  vColor = mix(uAccent, uGreen, step(0.72, aRandom));
}
`;

const dustFragment = /* glsl */ `
varying float vTwinkle;
varying vec3 vColor;
${STREAK_FRAGMENT}

void main() {
  float a = spriteMask();
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a * vTwinkle * 0.55);
}
`;

function DustField({ count, span }: { count: number; span: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = 4 - Math.random() * (span + 8);
      pos[i * 3 + 2] = -8 + Math.random() * 10;
      rnd[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRandom", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [count, span]);
  const uniforms = useMemo(
    () => ({ ...shared, uTravel: { value: 0 }, uWarp: { value: 1 } }),
    [],
  );
  const material = useMemo(
    () => additiveShader(dustVertex, dustFragment, uniforms),
    [uniforms],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    uniforms.uTravel.value = frame.warpTravel;
    uniforms.uWarp.value = frame.warp;
  });

  return (
    <points geometry={geometry} material={material} frustumCulled={false} />
  );
}

// ── floating wireframe solids ────────────────────────────────────────────

type FloaterDef = {
  shape: "octa" | "torus" | "ico" | "knot";
  pos: [number, number, number];
  size: number;
  color: THREE.Color;
  spin: number;
};

// y is in "viewports of scroll" and gets multiplied by SCROLL_DEPTH
const FLOATERS: FloaterDef[] = [
  { shape: "octa", pos: [-4.2, -0.9, -2], size: 0.5, color: GREEN, spin: 0.3 },
  {
    shape: "torus",
    pos: [4.6, -1.8, -3],
    size: 0.7,
    color: ACCENT,
    spin: -0.2,
  },
  { shape: "ico", pos: [-5.0, -3.2, -4], size: 0.9, color: ACCENT, spin: 0.15 },
  {
    shape: "knot",
    pos: [5.0, -4.6, -3.5],
    size: 0.55,
    color: GREEN,
    spin: 0.25,
  },
  { shape: "octa", pos: [-4.6, -6.4, -2.5], size: 0.6, color: HOT, spin: -0.3 },
  { shape: "torus", pos: [4.4, -8.0, -3], size: 0.8, color: ACCENT, spin: 0.2 },
  {
    shape: "ico",
    pos: [-4.8, -9.8, -3.5],
    size: 0.7,
    color: GREEN,
    spin: -0.18,
  },
];

function floaterGeometry(shape: FloaterDef["shape"]) {
  switch (shape) {
    case "octa":
      return new THREE.OctahedronGeometry(1, 0);
    case "torus":
      return new THREE.TorusGeometry(1, 0.32, 10, 28);
    case "ico":
      return new THREE.IcosahedronGeometry(1, 0);
    case "knot":
      return new THREE.TorusKnotGeometry(0.8, 0.22, 64, 8);
  }
}

function Floater({ def }: { def: FloaterDef }) {
  const ref = useRef<THREE.Mesh>(null);
  const wide = useThree((s) => s.size.width >= 768);
  const geometry = useMemo(() => floaterGeometry(def.shape), [def.shape]);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: def.color,
        wireframe: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [def.color],
  );
  const seed = useMemo(() => Math.random() * 10, []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // pull solids toward the edges' safe zone on small screens so they don't sit under text
  const x = wide ? def.pos[0] : def.pos[0] * 0.55;
  const y = def.pos[1] * SCROLL_DEPTH;

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    m.rotation.x += delta * def.spin;
    m.rotation.y += delta * def.spin * 0.7;
    m.position.y = y + Math.sin(state.clock.elapsedTime * 0.5 + seed) * 0.15;
    material.opacity = 0.14 * smoothstep(0.4, 1, frame.intro);
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      position={[x, y, def.pos[2]]}
      scale={def.size}
    />
  );
}

// ── intro: flash + two shockwave rings at the screen centre ──────────────

const flashVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const flashFragment = /* glsl */ `
uniform float uAlpha;
uniform vec3 uColor;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = exp(-d * d * 6.0) + 0.6 * exp(-d * 18.0);
  gl_FragColor = vec4(uColor, a * uAlpha);
}
`;

function IntroFx() {
  const group = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  const flashMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uAlpha: { value: 0 },
          uColor: { value: new THREE.Color("#c8f6ff") },
        },
        vertexShader: flashVertex,
        fragmentShader: flashFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.96, 1, 160), []);
  const ringMats = useMemo(
    () =>
      [ACCENT, GREEN].map(
        (color) =>
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          }),
      ),
    [],
  );
  useEffect(
    () => () => {
      flashMat.dispose();
      ringGeo.dispose();
      ringMats.forEach((m) => m.dispose());
    },
    [flashMat, ringGeo, ringMats],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = frame.introTime;
    if (frame.introStart < 0 || t > 2.2) {
      g.visible = false;
      return;
    }
    g.visible = true;
    g.position.set(0, frame.camY, 0.6);

    flashMat.uniforms.uAlpha.value =
      (t < 0.07 ? t / 0.07 : Math.exp(-(t - 0.07) * 4.5)) * 1.4;
    flash.current?.scale.setScalar(1.5 + t * 5);

    const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
    const easeOut = (v: number) => 1 - (1 - clamp01(v)) ** 3;
    const tA = t / 1.3;
    const tB = (t - 0.12) / 1.5;
    ringA.current?.scale.setScalar(0.05 + easeOut(tA) * 7);
    ringB.current?.scale.setScalar(0.05 + easeOut(tB) * 6);
    ringMats[0].opacity = (1 - clamp01(tA)) ** 2 * 0.9;
    ringMats[1].opacity = tB > 0 ? (1 - clamp01(tB)) ** 2 * 0.8 : 0;
  });

  return (
    <group ref={group} visible={false}>
      <mesh ref={flash} material={flashMat}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <mesh ref={ringA} geometry={ringGeo} material={ringMats[0]} />
      <mesh
        ref={ringB}
        geometry={ringGeo}
        material={ringMats[1]}
        rotation={[1.25, 0, 0.3]}
      />
    </group>
  );
}

// ── root ─────────────────────────────────────────────────────────────────

function useInputListeners() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      input.x = (e.clientX / window.innerWidth) * 2 - 1;
      input.y = -((e.clientY / window.innerHeight) * 2 - 1);
      input.mouse = e.pointerType === "mouse";
    };
    const onDown = (e: PointerEvent) => {
      input.click = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    const onLeave = () => (input.mouse = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
}

export default function Scene3D({
  lite,
  onStart,
}: {
  lite: boolean;
  onStart?: () => void;
}) {
  useInputListeners();
  const points = lite ? 6000 : 16000;

  return (
    <Canvas
      dpr={lite ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 60 }}
      gl={{
        antialias: !lite,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Director points={points} onStart={onStart} />
      <DustField
        count={lite ? 600 : 1500}
        span={DUST_VIEWPORTS * SCROLL_DEPTH}
      />
      {FLOATERS.map((f, i) => (
        <Floater key={i} def={f} />
      ))}
      <MorphEntity
        count={points}
        nodes={lite ? 120 : 240}
        surfaceLines={lite ? 22 : 32}
      />
      <IntroFx />
    </Canvas>
  );
}
