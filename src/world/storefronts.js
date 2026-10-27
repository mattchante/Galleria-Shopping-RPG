// Target's storefront and the McDonald's at Montfort & LBJ.
import * as THREE from 'three';
import { DOORS, LOTS, MCD, MCDPAD, TGT } from './layout.js';
import { scene } from '../core/renderer.js';
import { blockers, lam, solids } from '../core/helpers.js';
import { MAT, box, flat, mapRect } from '../core/materials.js';
import { signPlane, textTex } from './signals.js';

/* ---------- Target storefront (west face, facing its lot) ---------- */
{
  const D = DOORS[1],
    X = TGT[0];
  flat(LOTS[2].x2, X, TGT[2] + 2, TGT[3] - 2, 0.045, MAT.sidewalk, 2);
  const red = lam(0xc8202a);
  const p = box(2.4, 8.4, 16, red, X - 1.2, 4.2, D.z);
  blockers.push(p);
  solids.push({ x1: X - 2.4, x2: X, z1: D.z - 8, z2: D.z + 8 });
  box(2.6, 0.5, 16.4, lam(0xa8141c), X - 1.3, 8.6, D.z);
  const gm = new THREE.MeshPhongMaterial({ color: 0x2a3440, specular: 0x99aabb, shininess: 80 });
  box(0.1, 3.2, 5.6, gm, X - 2.45, 1.6, D.z);
  box(0.12, 3.3, 0.12, MAT.dark, X - 2.47, 1.65, D.z);
  const bol = lam(0xbdb8ad);
  for (const dz of [-9, -6, -3.2, 3.2, 6, 9]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1, 12), bol);
    b.position.set(X - 6.4, 0.5, D.z + dz);
    b.castShadow = true;
    scene.add(b);
    solids.push({ x1: X - 6.72, x2: X - 6.08, z1: D.z + dz - 0.32, z2: D.z + dz + 0.32 });
  }
  mapRect(X - 2.4, X, D.z - 8, D.z + 8, '#c8202a');
}
/* ---------- McDonald's at Montfort & LBJ (generic signage) ---------- */
{
  const [x1, x2, z1, z2] = MCD;
  flat(MCDPAD[0], MCDPAD[1], MCDPAD[2], MCDPAD[3], 0.021, MAT.asphalt, 8);
  mapRect(MCDPAD[0], MCDPAD[1], MCDPAD[2], MCDPAD[3], '#2f3a33');
  box(x2 - x1 + 1.6, 1.1, z2 - z1 + 1.6, lam(0x3b3733), (x1 + x2) / 2, 6.3, (z1 + z2) / 2);
  box(x2 - x1 - 2, 0.8, z2 - z1 - 2, lam(0x8b8c88), (x1 + x2) / 2, 7.2, (z1 + z2) / 2);
  box(0.6, 1.4, 2.4, lam(0x3b3733), x2 + 0.3, 1.6, z1 + 5);
  box(0.5, 11, 0.5, MAT.pole, x2 + 10, 5.5, z2 + 18);
  const st = textTex(512, 256, (g, w, h) => {
    g.fillStyle = '#2d2a27';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e8e2d4';
    g.lineWidth = 8;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f2b33d';
    g.textAlign = 'center';
    g.font = '800 92px Overpass, Arial, sans-serif';
    g.fillText('BURGERS', w / 2, 124);
    g.fillStyle = '#f4f1ea';
    g.font = '700 44px Overpass, Arial, sans-serif';
    g.fillText('DRIVE-THRU · OPEN LATE', w / 2, 200);
  });
  const sp = signPlane(st, 4.4, 2.2);
  sp.position.set(x2 + 10, 11.6, z2 + 18);
  sp.rotation.y = Math.PI / 2;
  scene.add(sp);
  solids.push({ x1: x2 + 9.75, x2: x2 + 10.25, z1: z2 + 17.75, z2: z2 + 18.25 });
  box(0.25, 1.9, 2.6, MAT.dark, x2 + 5.5, 1.3, z2 + 10);
  solids.push({ x1: x2 + 5.3, x2: x2 + 5.7, z1: z2 + 8.7, z2: z2 + 11.3 });
}
