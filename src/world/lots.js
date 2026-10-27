// Parking lots with striping and parked cars.
import { LOTS, MALLF } from './layout.js';
import { decal, lam, speckle } from '../core/helpers.js';
import { MAT, flat, mapRect } from '../core/materials.js';
import { textTex } from './signals.js';

/* ---------- parking lots ---------- */
const parked = [];
function lot(L) {
  const S = 4,
    W = Math.round((L.x2 - L.x1) * S),
    H = Math.round((L.z2 - L.z1) * S);
  const rows = [];
  let z = L.z1 + 6.5;
  const end = L.z2 - (L.fire ? 8 : 2);
  while (z + 11 <= end) {
    rows.push(z + 5.5);
    z += 11 + 6.5;
  }
  const inWalk = (x) => L.walk && x > L.walk[0] - 1.4 && x < L.walk[1] + 1.4;
  const t = textTex(W, H, (g, w, h) => {
    g.fillStyle = '#45474a';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, (w * h) / 30, 0.15, '255,255,255');
    speckle(g, w, h, (w * h) / 45, 0.2, '0,0,0');
    const X = (x) => (x - L.x1) * S,
      Z = (z) => (z - L.z1) * S;
    g.fillStyle = '#e8e7e0';
    for (const rc of rows) {
      g.fillRect(0, Z(rc) - 1, w, 2);
      for (let x = L.x1; x <= L.x2; x += 2.75) {
        if (inWalk(x)) continue;
        g.fillRect(X(x) - 1, Z(rc - 5.5), 2, 11 * S);
      }
    }
    if (L.walk) for (let x = L.walk[0]; x < L.walk[1]; x += 1.2) g.fillRect(X(x), 0, 0.6 * S, h);
    if (L.fire) {
      g.fillStyle = '#c8382c';
      g.fillRect(0, h - 4, w, 4);
      g.fillStyle = '#e8e7e0';
      g.font = '700 18px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      for (let x = L.x1 + 30; x < L.x2; x += 70) if (!inWalk(x)) g.fillText('FIRE LANE', X(x), Z(L.z2 - 3));
    }
  });
  flat(L.x1, L.x2, L.z1, L.z2, 0.022, decal(lam(0xffffff, { map: t }), 2));
  mapRect(L.x1, L.x2, L.z1, L.z2, '#2f3a33');
  for (const rc of rows)
    for (let x = L.x1 + 1.375; x < L.x2 - 1; x += 2.75) {
      if (inWalk(x)) continue;
      if (Math.random() < L.occ) parked.push({ x, z: rc - 2.75, rot: 0 });
      if (Math.random() < L.occ) parked.push({ x, z: rc + 2.75, rot: Math.PI });
    }
}
LOTS.forEach(lot);
flat(LOTS[0].x1, LOTS[0].x2, LOTS[0].z2, MALLF, 0.045, MAT.sidewalk, 2);

export { parked };
