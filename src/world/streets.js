// Road surfaces, intersections, crosswalks, sidewalks and the elevated Tollway and I-635.
import { BOUNDS, INTS, RD, ROADS, SW, distRoad } from './layout.js';
import { MAPDRAW, blockers, decal, lam, posAt, scaleUV, segAt, solids, tex } from '../core/helpers.js';
import { MAT, box, flat, ribbon, roadMat } from '../core/materials.js';

/* ---------- roads ---------- */
for (const r of ROADS) {
  ribbon(r, 0, r.L, -r.w / 2, r.w / 2, r.y, roadMat(r), 'road');
  MAPDRAW.push({ k: 'road', r });
}
// paved ground under the elevated Tollway
ribbon(RD.dnt, 0, RD.dnt.L, -RD.dnt.w / 2 - 1, RD.dnt.w / 2 + 1, 0.015, MAT.pad, 'walk');
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
// a box laid along a road segment: length runs with the road, o = sideways offset from the centreline
function segBox(g, t0, t1, w, h, y, mat, o = 0) {
  const t = (t0 + t1) / 2,
    m = box(w, h, t1 - t0, mat, g.a[0] + g.d[0] * t + g.rt[0] * o, y, g.a[1] + g.d[1] * t + g.rt[1] * o);
  m.rotation.y = Math.atan2(g.d[0], g.d[1]);
  return m;
}
for (const r of [RD.dnt, RD.i635]) {
  for (const g of r.segs) {
    // only build the stretch near the map; a little overlap hides the joints between segments
    let t0 = 1e9,
      t1 = -1e9;
    for (let t = 0; t <= g.len; t += 4) {
      const x = g.a[0] + g.d[0] * t,
        z = g.a[1] + g.d[1] * t;
      if (inView(x, z, 260)) {
        t0 = Math.min(t0, t);
        t1 = Math.max(t1, t);
      }
    }
    if (t0 > t1) continue;
    t0 = Math.max(0, t0 - 4);
    t1 = Math.min(g.len, t1 + 4);
    const ov = g.s0 > 0 ? 1.5 : 0;
    blockers.push(segBox(g, t0 - ov, t1, r.w, 1.2, 8.6, MAT.deck));
    for (const o of [-r.w / 2 + 0.3, r.w / 2 - 0.3, 0])
      segBox(g, t0 - ov, t1, o === 0 ? 0.9 : 0.6, 1.05, 9.75, MAT.barrier, o);
  }
  for (let s = 10; s < r.L; s += 32) {
    const [x, z, g] = posAt(r, s, 0);
    if (!inView(x, z, 120)) continue;
    if (onGroundRoad(x, z, 3)) continue;
    if (r === RD.dnt && distRoad(RD.i635, x, z) < RD.i635.w / 2 + 4) continue;
    box(2.4, 8, 2.4, MAT.barrier, x, 4, z);
    const cap = box(r.w - 4, 1.1, 2.8, MAT.barrier, x, 7.45, z);
    cap.rotation.y = Math.atan2(g.d[0], g.d[1]);
    solids.push({ x1: x - 1.2, x2: x + 1.2, z1: z - 1.2, z2: z + 1.2 });
  }
}

export { SIDEWALKS, inView, onGroundRoad };
