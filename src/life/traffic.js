// Traffic lanes, instanced cars, signal timing and the traffic simulation.
import * as THREE from 'three';
import { state, late } from '../core/state.js';
import { DNTX, INTS, RD, ROADS, SW } from '../world/layout.js';
import { scene } from '../core/renderer.js';
import { clamp, lam, pick, posAt, rand, solids } from '../core/helpers.js';
import { LAMP, LAMPCOL, LAMPDIM } from '../world/signals.js';
import { parked } from '../world/lots.js';

/* ---------- traffic lanes + instanced cars ---------- */
const CARCOLS = [
  0xf4f4f2, 0xf4f4f2, 0xc9ccd0, 0x1c1d20, 0x55595e, 0x8f1d22, 0x1f3f73, 0x2e4a3a, 0xb9ac90, 0x6e7f8e,
  0xd8d2c4, 0x9a3b18,
];
const lanes = [];
for (const r of ROADS) {
  r.lanes = [];
  for (const l of r.lanesDef) {
    const lane = { r, o: l.o, d: l.d, y: r.elevated ? r.y : 0, spd: r.spd * rand(0.9, 1.05), cars: [] };
    lanes.push(lane);
    r.lanes.push(lane);
    let s = rand(0, 60);
    while (s < r.L - 10) {
      lane.cars.push({ s, v: lane.spd * 0.8, lane });
      s += rand(r.elevated ? 80 : 95, r.elevated ? 170 : 200);
    }
  }
}
// how traffic gets on and off roads that end inside the map
const xAt = (r, x) => Math.abs(x - r.pts[0][0]);
RD.noel.lanes[0].onEnd = { to: RD.lbj.lanes[1], s: xAt(RD.lbj, -1.75) + 3 };
RD.noel.lanes[1].onEnd = { to: RD.lbj.lanes[2], s: xAt(RD.lbj, -5.25) + 3 };
RD.lbj.lanes[2].branch = { s: xAt(RD.lbj, 5.5), p: 0.3, to: RD.noel.lanes[3], toS: RD.noel.L - 14 };
RD.noel.lanes[2].onEnd = { to: RD.noel.lanes[0], s: 0 };
RD.noel.lanes[3].onEnd = { to: RD.noel.lanes[1], s: 0 };
for (let i = 0; i < 3; i++) {
  RD.dnt.lanes[i].onEnd = { to: RD.i635.lanes[i], s: xAt(RD.i635, DNTX) + 8 };
  RD.dnt.lanes[3 + i].onEnd = { to: RD.dnt.lanes[i], s: 0 };
}
RD.i635.lanes[5].branch = { s: xAt(RD.i635, DNTX + 9), p: 0.35, to: RD.dnt.lanes[5], toS: RD.dnt.L - 16 };
const movers = lanes.flatMap((l) => l.cars);
const NCAR = movers.length + parked.length;
const IM = {
  body: new THREE.InstancedMesh(new THREE.BoxGeometry(1.86, 0.72, 4.5), lam(0xffffff), NCAR),
  cabin: new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.62, 0.6, 2.3),
    new THREE.MeshPhongMaterial({ color: 0x26313a, specular: 0x8899aa, shininess: 80 }),
    NCAR,
  ),
  roof: new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.08, 1.95), lam(0xffffff), NCAR),
  wheel: new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.34, 0.34, 1.96, 8).rotateZ(Math.PI / 2),
    lam(0x18191b),
    NCAR * 2,
  ),
  lite: new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.5, 0.14, 0.07),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    NCAR * 2,
  ),
};
for (const k in IM) {
  const m = IM[k];
  m.castShadow = k === 'body';
  m.receiveShadow = k === 'body';
  m.frustumCulled = false;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(m);
}
const _m = new THREE.Matrix4(),
  _c = new THREE.Color();
function putI(im, i, x, y, z, rot, lx, ly, lz) {
  const c = Math.cos(rot),
    s = Math.sin(rot);
  _m.makeRotationY(rot);
  _m.setPosition(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
  im.setMatrixAt(i, _m);
}
function placeCar(i, x, y, z, rot) {
  putI(IM.body, i, x, y, z, rot, 0, 0.62, 0);
  putI(IM.cabin, i, x, y, z, rot, 0, 1.28, -0.25);
  putI(IM.roof, i, x, y, z, rot, 0, 1.6, -0.25);
  putI(IM.wheel, i * 2, x, y, z, rot, 0, 0.34, 1.45);
  putI(IM.wheel, i * 2 + 1, x, y, z, rot, 0, 0.34, -1.45);
  putI(IM.lite, i * 2, x, y, z, rot, 0, 0.68, 2.26);
  putI(IM.lite, i * 2 + 1, x, y, z, rot, 0, 0.72, -2.26);
}
function colorCar(i, col, head, tail) {
  _c.setHex(col);
  IM.body.setColorAt(i, _c);
  IM.roof.setColorAt(i, _c);
  IM.lite.setColorAt(i * 2, _c.setHex(head));
  IM.lite.setColorAt(i * 2 + 1, _c.setHex(tail));
}
movers.forEach((c, i) => {
  c.i = i;
  colorCar(i, pick(CARCOLS), 0xfff3d0, 0xc4232a);
});
parked.forEach((p, k) => {
  const i = movers.length + k;
  colorCar(i, pick(CARCOLS), 0xe9e4d6, 0x8e1d22);
  placeCar(i, p.x, 0, p.z, p.rot);
  solids.push({ x1: p.x - 1, x2: p.x + 1, z1: p.z - 2.3, z2: p.z + 2.3 });
});
for (const k in IM) if (IM[k].instanceColor) IM[k].instanceColor.needsUpdate = true;
/* ---------- simulation ---------- */
state.sigT = 4;
state.clockMin = 17 * 60 + 40;
state.dayN = 1;
function sig(axis) {
  const t = state.sigT % 36;
  if (axis === 'z') return t < 14 ? 'g' : t < 17 ? 'y' : 'r';
  return t >= 18 && t < 32 ? 'g' : t >= 32 && t < 35 ? 'y' : 'r';
}
function updateLamps() {
  for (const [ax, a] of [
    ['ns', 'z'],
    ['ew', 'x'],
  ]) {
    const s = sig(a);
    for (const c of ['r', 'y', 'g']) LAMP[ax + c].color.setHex(s === c ? LAMPCOL[c] : LAMPDIM[c]);
  }
}
for (const I of INTS) {
  if (!I.sig) continue;
  for (const [r, s, other, ax] of [
    [I.E, I.sE, I.N, 'x'],
    [I.N, I.sN, I.E, 'z'],
  ]) {
    (r.stops = r.stops || []).push({ s, half: other.w / 2 + SW + 0.6, ax });
  }
}
function moveCar(c, L, ns) {
  L.cars.splice(L.cars.indexOf(c), 1);
  ns.to.cars.push(c);
  c.lane = ns.to;
  c.s = ns.s;
}
function stepTraffic(dt) {
  const OBS = [];
  if (state.mode === 'out' && late.P.pos.y < 2) OBS.push(late.P.pos);
  if (late.V.exists && !late.V.active) OBS.push(late.V.pos);
  for (const L of lanes) {
    const r = L.r;
    for (let ci = L.cars.length - 1; ci >= 0; ci--) {
      const c = L.cars[ci];
      if (c.lane !== L) continue;
      let target = L.spd,
        gap = 1e9;
      for (const o of L.cars) {
        if (o === c) continue;
        const g = (o.s - c.s) * L.d;
        if (g > 0 && g < gap) gap = g;
      }
      if (gap < 40) target = Math.min(target, Math.max(0, (gap - 7.5) * 0.9));
      if (r.stops)
        for (const st of r.stops) {
          const dist = (st.s - L.d * st.half - c.s) * L.d - 2.25;
          if (dist > -1.5 && dist < 45) {
            const sg = sig(st.ax);
            if (sg === 'r' || (sg === 'y' && dist > 7)) target = Math.min(target, Math.max(0, dist) * 0.6);
          }
        }
      if (!r.elevated && c.x !== undefined)
        for (const q of OBS) {
          const dx = q.x - c.x,
            dz = q.z - c.z,
            cs = Math.cos(c.rot),
            sn = Math.sin(c.rot);
          const lz = dx * sn + dz * cs,
            lx = dx * cs - dz * sn;
          if (Math.abs(lx) < 2.1 && lz > 1.5 && lz < 20) target = Math.min(target, Math.max(0, lz - 5) * 0.7);
        }
      c.v += clamp(target - c.v, -11 * dt, 3.6 * dt);
      if (c.v < 0) c.v = 0;
      const prev = c.s;
      c.s += c.v * L.d * dt;
      if (
        L.branch &&
        (prev - L.branch.s) * (c.s - L.branch.s) <= 0 &&
        prev !== c.s &&
        Math.random() < L.branch.p
      ) {
        moveCar(c, L, { to: L.branch.to, s: L.branch.toS });
      } else if (L.d > 0 && c.s > r.L - (L.onEnd ? 4 : 0)) {
        if (L.onEnd) moveCar(c, L, L.onEnd);
        else c.s -= r.L;
      } else if (L.d < 0 && c.s < 0) {
        if (L.onEnd) moveCar(c, L, L.onEnd);
        else c.s += r.L;
      }
      const CL = c.lane,
        [x, z, g] = posAt(CL.r, c.s, CL.o);
      const rot = Math.atan2(g.d[0] * CL.d, g.d[1] * CL.d);
      c.x = x;
      c.z = z;
      c.rot = rot;
      placeCar(c.i, x, CL.y, z, rot);
    }
  }
  for (const k in IM) IM[k].instanceMatrix.needsUpdate = true;
}

Object.assign(late, { movers });
export { _c, _m, putI, stepTraffic, updateLamps };
