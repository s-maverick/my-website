// Shared GLSL chunks. Include order in a vertex shader:
//   uniforms (incl. uTime) → NOISE → HELPERS → WORLD_FX → STREAK_VERTEX

// Ashima 3D simplex noise (MIT) — https://github.com/ashima/webgl-noise
export const NOISE = /* glsl */ `
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

export const HELPERS = /* glsl */ `
#define PI 3.141592653589793
vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotZ(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }
vec3 hash3(float n) {
  return fract(sin(vec3(n, n + 1.7, n + 3.1)) * vec3(43758.5453, 22578.1459, 19642.349));
}
`;

/** Cursor repulsion (with a little swirl) and click shockwave, in world space. */
export const WORLD_FX = /* glsl */ `
uniform vec3 uRayOrigin;
uniform vec3 uRayDir;
uniform float uMouseStrength;
uniform vec4 uShock;

vec3 applyWorldFx(vec3 w, out float push, out float shock) {
  // where the cursor ray crosses this particle's depth
  vec3 m = uRayOrigin + uRayDir * ((w.z - uRayOrigin.z) / uRayDir.z);
  vec2 d = w.xy - m.xy;
  float dist = length(d);
  push = (1.0 - smoothstep(0.0, 0.95, dist)) * uMouseStrength;
  vec2 dir = d / max(dist, 1e-3);
  w.xy += (dir * 0.32 + vec2(-dir.y, dir.x) * 0.18) * push;
  w.z += push * 0.35;

  shock = 0.0;
  if (uShock.w < 2.5) {
    vec3 s = w - uShock.xyz;
    float ds = length(s);
    float front = uShock.w * 3.2;
    shock = exp(-pow((ds - front) * 2.2, 2.0)) * exp(-uShock.w * 1.4);
    w += (s / max(ds, 1e-3)) * shock * 0.55;
  }
  return w;
}
`;

/**
 * Points become streaks: vertical when scrolling fast (uStreak), radial from
 * the screen centre during the intro warp (uWarp). The sprite is enlarged by
 * vStretch and squashed back across the streak in the fragment shader.
 */
export const STREAK_VERTEX = /* glsl */ `
uniform float uStreak;
uniform float uWarp;
varying vec2 vStreakDir;
varying float vStretch;

void computeStreak(vec4 clip) {
  vec2 ndc = clip.xy / clip.w;
  vec2 radial = normalize(ndc + vec2(1e-4));
  float s = max(uStreak, uWarp);
  vStreakDir = normalize(mix(vec2(0.0, 1.0), radial, uWarp / max(s, 1e-4)));
  vStretch = 1.0 + s * 6.0;
}
`;

export const STREAK_FRAGMENT = /* glsl */ `
varying vec2 vStreakDir;
varying float vStretch;

float spriteMask() {
  vec2 c = gl_PointCoord - 0.5;
  c.y = -c.y;
  float along = dot(c, vStreakDir);
  float across = dot(c, vec2(-vStreakDir.y, vStreakDir.x)) * vStretch;
  return (1.0 - smoothstep(0.0, 0.5, length(vec2(along, across))));
}
`;
