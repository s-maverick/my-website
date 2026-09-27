import * as THREE from "three";

// palette, converted from the oklch tokens in styles.css
export const ACCENT = new THREE.Color("#00d3ff"); // --accent     oklch(0.80 0.15 220)
export const GREEN = new THREE.Color("#5ad664"); //  --accent-2   oklch(0.78 0.19 145)
export const HOT = new THREE.Color("#ff6254"); //    --accent-hot oklch(0.72 0.21 28)

/** world units the camera travels per viewport of page scroll */
export const SCROLL_DEPTH = 3.4;
export const INTRO_SECONDS = 2.6;

/** Raw input, written by window listeners — the canvas itself is pointer-events: none. */
export const input = {
  /** pointer position in NDC (-1..1) */
  x: 0,
  y: 0,
  /** a mouse (not touch) is hovering the page */
  mouse: false,
  /** NDC of a click waiting to be turned into a shockwave */
  click: null as null | { x: number; y: number },
};

/** Per-frame scene state. Written by <Director>, read by everything else. */
export const frame = {
  time: 0,
  /** clock time the intro began, -1 before the first frame */
  introStart: -1,
  /** seconds since the intro began */
  introTime: 0,
  /** 0 → 1 over INTRO_SECONDS */
  intro: 0,
  /** hyperspace streak strength during the intro, 1 → 0 */
  warp: 0,
  /** how far the dust has flown toward the camera during the warp */
  warpTravel: 0,
  /** smoothed camera height from scroll, without pointer parallax */
  camY: 0,
  /** continuous shape index: 2.5 = halfway from shape 2 to shape 3 */
  s: 0,
};

/** Uniforms shared by reference across every particle material — set once per frame. */
export const shared = {
  uTime: { value: 0 },
  /** px-per-world-unit factor for size attenuation: canvas height (device px) / 2 */
  uScale: { value: 1 },
  uRayOrigin: { value: new THREE.Vector3(0, 0, 6) },
  uRayDir: { value: new THREE.Vector3(0, 0, -1) },
  uMouseStrength: { value: 0 },
  /** xyz: world origin of the last click, w: seconds since it */
  uShock: { value: new THREE.Vector4(0, 0, 0, 99) },
  /** 0..1 from scroll velocity — stretches points into vertical streaks */
  uStreak: { value: 0 },
  uAccent: { value: ACCENT },
  uGreen: { value: GREEN },
  uHot: { value: HOT },
};

export function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * Built by hand rather than via <shaderMaterial uniforms={…}>: R3F copies each
 * uniform into a fresh { value } wrapper, which would cut the materials off from
 * the shared uniforms the Director updates every frame.
 */
export function additiveShader(
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
