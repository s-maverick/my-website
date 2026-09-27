import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Page-wide WebGL layer. One fixed canvas behind all content:
 *  - a noise-displaced "neural core" point sphere in the hero that bulges toward the cursor
 *  - slow wireframe solids floating along the page at different depths
 *  - a dust field the camera sinks through as you scroll (real depth parallax)
 * Lazy-loaded via Background3D so three.js never blocks first paint.
 */

// palette, converted from the oklch tokens in styles.css
const ACCENT = new THREE.Color("#00d3ff"); // --accent  oklch(0.80 0.15 220)
const GREEN = new THREE.Color("#5ad664"); //            oklch(0.78 0.19 145)
const HOT = new THREE.Color("#ff6254"); //   --accent-hot oklch(0.72 0.21 28)

// world units the camera travels per viewport of page scroll. < visible height
// (~5.6 at z=6, fov 50) so the scene lags behind content and reads as "far away".
const SCROLL_DEPTH = 3.4;
// how many viewports of page the dust field covers
const DUST_VIEWPORTS = 14;

// shared, mutated by window listeners — the canvas itself is pointer-events: none
const pointer = { x: 0, y: 0 };

// Ashima 3D simplex noise (MIT) — https://github.com/ashima/webgl-noise
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

// ── neural core ──────────────────────────────────────────────────────────

const coreVertex = /* glsl */ `
${NOISE_GLSL}
uniform float uTime;
uniform float uReveal;
uniform vec3 uPointerDir;
uniform float uScale;
attribute float aRandom;
varying float vMix;
varying float vDepth;
varying float vSpark;

void main() {
  vec3 dir = normalize(position);
  float n = snoise(dir * 1.6 + vec3(0.0, 0.0, uTime * 0.22));
  float r = 1.0 + n * 0.22;

  // cursor pulls a lobe of the sphere outward
  vec3 worldDir = normalize((modelMatrix * vec4(dir, 0.0)).xyz);
  float facing = max(dot(worldDir, uPointerDir), 0.0);
  r += pow(facing, 8.0) * 0.45;

  // boot-in: points fly in from a wider shell
  r *= mix(2.6, 1.0, uReveal);

  vec4 mv = modelViewMatrix * vec4(dir * r, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.05 + aRandom * 0.07) * uScale / -mv.z;

  vMix = n * 0.5 + 0.5;
  vDepth = smoothstep(-1.2, 1.2, (modelMatrix * vec4(dir, 0.0)).z);
  vSpark = step(0.985, aRandom) * (0.5 + 0.5 * sin(uTime * 3.0 + aRandom * 60.0));
}
`;

const coreFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorHot;
uniform float uOpacity;
varying float vMix;
varying float vDepth;
varying float vSpark;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, d), 1.3);
  vec3 col = mix(uColorA, uColorB, smoothstep(0.35, 0.8, vMix));
  col = mix(col, uColorHot, vSpark);
  gl_FragColor = vec4(col, a * (0.25 + 0.75 * vDepth) * uOpacity);
}
`;

function fibonacciSphere(count: number) {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * radius;
  }
  return positions;
}

function NeuralCore({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const cage = useRef<THREE.LineSegments>(null);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(fibonacciSphere(count), 3),
    );
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) rnd[i] = Math.random();
    g.setAttribute("aRandom", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPointerDir: { value: new THREE.Vector3(0, 0, 1) },
      uScale: { value: 1 },
      uColorA: { value: ACCENT },
      uColorB: { value: GREEN },
      uColorHot: { value: HOT },
      uOpacity: { value: 0.9 },
    }),
    [],
  );

  const cageGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.62, 1)),
    [],
  );
  const rings = useMemo(
    () =>
      [1.55, 1.85].map((r) => {
        const pts = new THREE.EllipseCurve(
          0,
          0,
          r,
          r,
          0,
          Math.PI * 2,
        ).getPoints(128);
        return new THREE.BufferGeometry().setFromPoints(pts);
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      cageGeometry.dispose();
      rings.forEach((r) => r.dispose());
    };
  }, [geometry, cageGeometry, rings]);

  // wide screens: sit between the headline and the portrait; narrow: behind the text
  const wide = size.width >= 768;
  const x = wide ? 0.45 : 0;
  const scale = wide ? 1.35 : 1.05;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uScale.value = (size.height * dpr) / 2;
    uniforms.uReveal.value = THREE.MathUtils.damp(
      uniforms.uReveal.value,
      1,
      1.6,
      delta,
    );
    uniforms.uPointerDir.value
      .set(pointer.x * 1.4, pointer.y * 1.4, 1)
      .normalize();

    if (group.current) {
      group.current.rotation.y += delta * 0.08;
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        -pointer.y * 0.25,
        2,
        delta,
      );
    }
    if (cage.current) {
      cage.current.rotation.y -= delta * 0.25;
      cage.current.rotation.z += delta * 0.12;
    }
  });

  return (
    <group position={[x, 0.1, 0]} scale={scale}>
      <group ref={group}>
        <points geometry={geometry}>
          <shaderMaterial
            vertexShader={coreVertex}
            fragmentShader={coreFragment}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        <lineSegments ref={cage} geometry={cageGeometry}>
          <lineBasicMaterial color={ACCENT} transparent opacity={0.22} />
        </lineSegments>
      </group>
      <group rotation={[1.2, 0.2, 0]}>
        <lineLoop geometry={rings[0]}>
          <lineBasicMaterial color={ACCENT} transparent opacity={0.14} />
        </lineLoop>
        <Satellite radius={1.55} speed={0.6} color={ACCENT} />
      </group>
      <group rotation={[1.9, -0.5, 0.3]}>
        <lineLoop geometry={rings[1]}>
          <lineBasicMaterial color={GREEN} transparent opacity={0.1} />
        </lineLoop>
        <Satellite radius={1.85} speed={-0.4} color={GREEN} />
      </group>
    </group>
  );
}

function Satellite({
  radius,
  speed,
  color,
}: {
  radius: number;
  speed: number;
  color: THREE.Color;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const a = state.clock.elapsedTime * speed;
    ref.current?.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
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
  {
    shape: "knot",
    pos: [4.8, -11.6, -4],
    size: 0.6,
    color: ACCENT,
    spin: 0.22,
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
  const seed = useMemo(() => Math.random() * 10, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // pull solids toward the edges' safe zone on small screens so they don't sit under text
  const x = wide ? def.pos[0] : def.pos[0] * 0.55;
  const y = def.pos[1] * SCROLL_DEPTH;

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.rotation.x += delta * def.spin;
    m.rotation.y += delta * def.spin * 0.7;
    m.position.y = y + Math.sin(t * 0.5 + seed) * 0.15;
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      position={[x, y, def.pos[2]]}
      scale={def.size}
    >
      <meshBasicMaterial
        color={def.color}
        wireframe
        transparent
        opacity={0.16}
      />
    </mesh>
  );
}

// ── dust field ───────────────────────────────────────────────────────────

const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uScale;
attribute float aRandom;
varying float vTwinkle;
void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.1 + aRandom * 40.0) * 0.15;
  p.y += cos(uTime * 0.08 + aRandom * 25.0) * 0.15;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.035 + aRandom * 0.05) * uScale / -mv.z;
  vTwinkle = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aRandom * 1.8) + aRandom * 100.0));
}
`;

const dustFragment = /* glsl */ `
uniform vec3 uColor;
varying float vTwinkle;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, a * vTwinkle * 0.55);
}
`;

function DustField({ count, span }: { count: number; span: number }) {
  const height = useThree((s) => s.size.height);
  const dpr = useThree((s) => s.viewport.dpr);
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
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: 1 },
      uColor: { value: ACCENT },
    }),
    [],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uScale.value = (height * dpr) / 2;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── camera rig ───────────────────────────────────────────────────────────

function CameraRig() {
  useFrame(({ camera }, delta) => {
    const vh = window.innerHeight || 1;
    const targetY = -(window.scrollY / vh) * SCROLL_DEPTH;
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      pointer.x * 0.35,
      3,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetY + pointer.y * 0.25,
      6,
      delta,
    );
    camera.lookAt(0, camera.position.y, 0);
  });
  return null;
}

// ── root ─────────────────────────────────────────────────────────────────

export default function Scene3D({ lite }: { lite: boolean }) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={lite ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 50 }}
      gl={{
        antialias: !lite,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CameraRig />
      <NeuralCore count={lite ? 1400 : 3200} />
      <DustField
        count={lite ? 600 : 1400}
        span={DUST_VIEWPORTS * SCROLL_DEPTH}
      />
      {FLOATERS.map((f, i) => (
        <Floater key={i} def={f} />
      ))}
    </Canvas>
  );
}
