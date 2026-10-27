// Road surfaces, intersections, crosswalks, sidewalks and the elevated Tollway and I-635.
import { BOUNDS, I635Z, INTS, MED, RD, ROADS, SW, distRoad } from './layout.js';
import { MAPDRAW, blockers, decal, lam, posAt, scaleUV, segAt, solids, tex } from '../core/helpers.js';
import { MAT, box, flat, mapRect, ribbon, roadMat } from '../core/materials.js';
import { MAPMAX, MAPMIN } from './sky.js';

/* ---------- roads ---------- */
for (const r of ROADS) {
  ribbon(r, 0, r.L, -r.w / 2, r.w / 2, r.y, roadMat(r), 'road');
  MAPDRAW.push({ k: 'road', r });
}
// under-Tollway median between the Dallas Pkwy frontage roads
flat(MED[0], MED[1], -1500, 1900, 0.015, MAT.pad, 4);
mapRect(MED[0], MED[1], MAPMIN.z, MAPMAX.z, '#6f6c63');
/* ---------- intersections: patches, crosswalks, corners ---------- */
const zebraV = tex(32, 8, (g, w, h) => {
  g.fillStyle = '#3a3c3f';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ecebe4';
  g.fillRect(4, 0, 12, h);
});
const zebraH = tex(8, 32, (g, w, h) => {
  g.fillStyle = '#3a3c3f';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ecebe4';
  g.fillRect(0, 4, w, 12);
});
const zebraVM = decal(lam(0xffffff, { map: zebraV }), 7),
  zebraHM = decal(lam(0xffffff, { map: zebraH }), 7);
for (const I of INTS) {
  const hn = I.N.w / 2,
    he = I.E.w / 2;
  flat(I.x - hn, I.x + hn, I.z - he, I.z + he, 0.032, MAT.asphalt, 8);
  if (I.ext.n) {
    const m = flat(I.x - hn, I.x + hn, I.z - he - SW, I.z - he, 0.036, zebraVM);
    scaleUV(m.geometry, I.N.w / 1.2, 1);
  }
  if (I.ext.s) {
    const m = flat(I.x - hn, I.x + hn, I.z + he, I.z + he + SW, 0.036, zebraVM);
    scaleUV(m.geometry, I.N.w / 1.2, 1);
  }
  if (I.ext.w) {
    const m = flat(I.x - hn - SW, I.x - hn, I.z - he, I.z + he, 0.036, zebraHM);
    scaleUV(m.geometry, 1, I.E.w / 1.2);
  }
  if (I.ext.e) {
    const m = flat(I.x + hn, I.x + hn + SW, I.z - he, I.z + he, 0.036, zebraHM);
    scaleUV(m.geometry, 1, I.E.w / 1.2);
  }
  for (const qx of [-1, 1])
    for (const qz of [-1, 1]) {
      if (!(qx < 0 ? I.ext.w : I.ext.e) || !(qz < 0 ? I.ext.n : I.ext.s)) continue;
      const cx = I.x + qx * (hn + SW / 2),
        cz = I.z + qz * (he + SW / 2);
      flat(cx - SW / 2, cx + SW / 2, cz - SW / 2, cz + SW / 2, 0.04, MAT.sidewalk, 2);
    }
}
/* ---------- sidewalks ---------- */
const SIDEWALKS = [];
function inView(x, z, pad) {
  return x > BOUNDS.x1 - pad && x < BOUNDS.x2 + pad && z > BOUNDS.z1 - pad && z < BOUNDS.z2 + pad;
}
for (const r of ROADS) {
  if (r.elevated) continue;
  let lo = 1e9,
    hi = -1e9;
  for (let s = 0; s <= r.L; s += 4) {
    const [x, z] = posAt(r, s, 0);
    if (inView(x, z, 40)) {
      lo = Math.min(lo, s);
      hi = Math.max(hi, s);
    }
  }
  if (lo > hi) continue;
  hi = Math.min(r.L, hi + 4);
  for (const k of [-1, 1]) {
    const cuts = [];
    for (const I of INTS) {
      let sI, wO, ext;
      if (I.E === r) {
        sI = I.sE;
        wO = I.N.w;
        const g = segAt(r, sI);
        ext = g.rt[1] * k > 0 ? I.ext.s : I.ext.n;
      } else if (I.N === r) {
        sI = I.sN;
        wO = I.E.w;
        const g = segAt(r, sI);
        ext = g.rt[0] * k > 0 ? I.ext.e : I.ext.w;
      } else continue;
      const ends = sI < 1 || sI > r.L - 1;
      if (ext || ends) cuts.push([sI - wO / 2 - SW, sI + wO / 2 + SW]);
    }
    cuts.sort((a, b) => a[0] - b[0]);
    let s = lo;
    const spans = [];
    for (const [c0, c1] of cuts) {
      if (c1 <= s || c0 >= hi) continue;
      if (c0 > s) spans.push([s, c0]);
      s = Math.max(s, c1);
    }
    if (s < hi) spans.push([s, hi]);
    const o0 = k < 0 ? -r.w / 2 - SW : r.w / 2,
      o1 = k < 0 ? -r.w / 2 : r.w / 2 + SW;
    for (const [a, b] of spans) {
      if (b - a < 0.5) continue;
      ribbon(r, a, b, o0, o1, 0.04, MAT.sidewalk, 'walk');
      MAPDRAW.push({ k: 'walk', r, a, b, o0, o1 });
      if (b - a > 20) SIDEWALKS.push({ r, k, a: a + 2, b: b - 2, oc: (o0 + o1) / 2 });
    }
  }
}
/* ---------- elevated highways ---------- */
function onGroundRoad(x, z, pad) {
  for (const r of ROADS) {
    if (r.elevated) continue;
    if (distRoad(r, x, z) < r.w / 2 + pad) return r;
  }
  return null;
}
for (const r of [RD.dnt, RD.i635]) {
  const g = r.segs[0],
    ax = g.axis,
    mid = r.L / 2,
    [cx, cz] = posAt(r, mid, 0),
    L = r.L;
  const deck = ax === 'z' ? box(r.w, 1.2, L, MAT.deck, cx, 8.6, cz) : box(L, 1.2, r.w, MAT.deck, cx, 8.6, cz);
  blockers.push(deck);
  for (const o of [-r.w / 2 + 0.3, r.w / 2 - 0.3, 0]) {
    const t = o === 0 ? 0.9 : 0.6;
    if (ax === 'z') box(t, 1.05, L, MAT.barrier, cx + o, 9.75, cz);
    else box(L, 1.05, t, MAT.barrier, cx, 9.75, cz + o);
  }
  for (let s = 10; s < L; s += 32) {
    const [x, z] = posAt(r, s, 0);
    if (!inView(x, z, 120)) continue;
    if (onGroundRoad(x, z, 3)) continue;
    if (r === RD.dnt && z > I635Z - 16) continue;
    box(2.4, 8, 2.4, MAT.barrier, x, 4, z);
    if (ax === 'z') box(r.w - 4, 1.1, 2.8, MAT.barrier, x, 7.45, z);
    else box(2.8, 1.1, r.w - 4, MAT.barrier, x, 7.45, z);
    solids.push({ x1: x - 1.2, x2: x + 1.2, z1: z - 1.2, z2: z + 1.2 });
  }
}

export { SIDEWALKS, inView, onGroundRoad };
