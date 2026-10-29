// Street trees and street lights.
import * as THREE from 'three';
import { BOUNDS, DOORS, LOTS, PLAZA, RD, SW, distRoad } from './layout.js';
import { scene } from '../core/renderer.js';
import { MAPDRAW, V3, lam, pick, posAt, rand, solids } from '../core/helpers.js';
import { MAT } from '../core/materials.js';
import { SIDEWALKS, inView, onGroundRoad } from './streets.js';
import { _c, _m, putI } from '../life/traffic.js';

/* ---------- trees + street lights ---------- */
function isFree(x, z, r) {
  if (x < BOUNDS.x1 || x > BOUNDS.x2 || z < BOUNDS.z1 || z > BOUNDS.z2 - 4) return false;
  if (distRoad(RD.dnt, x, z) < RD.dnt.w / 2 + 3) return false;
  for (const d of DOORS) if (Math.hypot(x - d.x, z - d.z) < 12) return false;
  // Target Plaza is paved from Target's front to Montfort's sidewalk
  if (x > PLAZA.x1 - 1 && x < PLAZA.x2 + 1.5 && z > PLAZA.z1 - 1 && z < PLAZA.z2 + 1) return false;
  if (onGroundRoad(x, z, SW + 0.5)) return false;
  for (const L of LOTS) if (x > L.x1 - 1 && x < L.x2 + 1 && z > L.z1 && z < L.z2 + 1) return false;
  for (const s of solids)
    if (x + r > s.x1 - 3 && x - r < s.x2 + 3 && z + r > s.z1 - 3 && z - r < s.z2 + 3) return false;
  return true;
}
const trees = [];
for (const sw of SIDEWALKS) {
  const o = sw.k * (sw.r.w / 2 + SW + 1.8);
  for (let t = sw.a + 6; t < sw.b - 6; t += 17) {
    const [x, z] = posAt(sw.r, t, o);
    if (isFree(x, z, 0.6)) trees.push([x, z]);
  }
}
for (let i = 0; i < 700 && trees.length < 330; i++) {
  const x = rand(BOUNDS.x1, BOUNDS.x2),
    z = rand(BOUNDS.z1, BOUNDS.z2);
  if (isFree(x, z, 3)) trees.push([x, z]);
}
{
  const trunk = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.22, 0.3, 3.2, 7),
    MAT.trunk,
    trees.length,
  );
  const can = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), MAT.canopy, trees.length);
  const greens = [0x4c6a31, 0x587a38, 0x627f3c, 0x4a6230, 0x6d8a45];
  const q = new THREE.Quaternion(),
    sc = new V3(),
    ps = new V3(),
    eu = new THREE.Euler();
  trees.forEach(([x, z], i) => {
    _m.makeTranslation(x, 1.6, z);
    trunk.setMatrixAt(i, _m);
    const s = rand(2.4, 3.6);
    q.setFromEuler(eu.set(0, rand(0, 6), 0));
    _m.compose(ps.set(x, 3.2 + s * 0.55, z), q, sc.set(s * 1.15, s * 0.82, s * 1.15));
    can.setMatrixAt(i, _m);
    _c.setHex(pick(greens));
    can.setColorAt(i, _c);
    solids.push({ x1: x - 0.35, x2: x + 0.35, z1: z - 0.35, z2: z + 0.35 });
    MAPDRAW.push({ k: 'c', x, z, r: s * 1.1, col: '#2f4527' });
  });
  trunk.castShadow = can.castShadow = true;
  can.receiveShadow = true;
  scene.add(trunk, can);
}
{
  const pos = [];
  for (const sw of SIDEWALKS) {
    const o = sw.k * (sw.r.w / 2 + 0.6);
    for (let t = sw.a + 10; t < sw.b - 8; t += 42) {
      const [x, z, g] = posAt(sw.r, t, o);
      if (!inView(x, z, 20)) continue;
      const vx = -sw.k * g.rt[0],
        vz = -sw.k * g.rt[1];
      pos.push([x, z, Math.atan2(-vz, vx)]);
    }
  }
  const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.16, 9, 6), MAT.pole, pos.length);
  const arm = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.12, 0.12), MAT.pole, pos.length);
  const head = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 0.2, 0.38), lam(0xe8e3d4), pos.length);
  pos.forEach(([x, z, r], i) => {
    putI(pole, i, x, 0, z, r, 0, 4.5, 0);
    putI(arm, i, x, 0, z, r, 1.3, 8.8, 0);
    putI(head, i, x, 0, z, r, 2.6, 8.7, 0);
  });
  pole.castShadow = arm.castShadow = true;
  scene.add(pole, arm, head);
}
