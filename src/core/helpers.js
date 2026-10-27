// Small math, material and canvas-texture helpers, plus the shared collision/camera-blocker lists.
import * as THREE from 'three';
import { renderer } from './renderer.js';

/* ---------- helpers ---------- */
const V3 = THREE.Vector3;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lam = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o));
const decal = (m, k) => {
  m.polygonOffset = true;
  m.polygonOffsetFactor = -k;
  m.polygonOffsetUnits = -k * 2;
  return m;
};
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
function tex(w, h, fn, repeat = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  fn(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
  }
  t.anisotropy = maxAniso;
  return t;
}
function speckle(g, w, h, n, a, rgb) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(${rgb},${Math.random() * a})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.5, 1 + Math.random() * 1.5);
  }
}
function scaleUV(geo, su, sv) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  uv.needsUpdate = true;
  return geo;
}
const SHAD = (o) => {
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
};
function segAt(r, s) {
  for (const g of r.segs) if (s <= g.s0 + g.len) return g;
  return r.segs[r.segs.length - 1];
}
function posAt(r, s, o) {
  const g = segAt(r, s),
    t = clamp(s - g.s0, 0, g.len);
  return [g.a[0] + g.d[0] * t + g.rt[0] * o, g.a[1] + g.d[1] * t + g.rt[1] * o, g];
}
const solids = [];
// AABBs {x1,x2,z1,z2}
const blockers = [];
// meshes that stop the camera
const MAPDRAW = [];

export {
  MAPDRAW,
  SHAD,
  V3,
  blockers,
  clamp,
  decal,
  lam,
  pick,
  posAt,
  rand,
  scaleUV,
  segAt,
  solids,
  speckle,
  tex,
};
