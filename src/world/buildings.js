// Building blocks, the Galleria exterior and the distant skyline fill.
import * as THREE from 'three';
import { BOUNDS, BUILDINGS, MALL, VAULT } from './layout.js';
import { scene } from '../core/renderer.js';
import { SHAD, blockers, lam, pick, rand, solids } from '../core/helpers.js';
import { MAT, ROOF, TEXCFG, bmat, box, flat, mapRect } from '../core/materials.js';

/* ---------- buildings ---------- */
function building(x1, x2, z1, z2, h, type, tint, opts = {}) {
  const w = x2 - x1,
    d = z2 - z1,
    c = TEXCFG[type];
  const geo = new THREE.BoxGeometry(w, h, d);
  const fh = c.fh || h,
    dims = [
      [d, h],
      [d, h],
      [w, d],
      [w, d],
      [w, h],
      [w, h],
    ],
    uv = geo.attributes.uv;
  for (let f = 0; f < 6; f++) {
    if (f === 2 || f === 3) continue;
    const [fw, fhh] = dims[f];
    const su = Math.max(1, Math.round(fw / c.bw)),
      sv = Math.max(1, Math.round(fhh / fh));
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * su, uv.getY(k) * sv);
    }
  }
  const side = bmat(type, tint);
  const m = new THREE.Mesh(geo, [side, side, ROOF, ROOF, side, side]);
  m.position.set((x1 + x2) / 2, h / 2, (z1 + z2) / 2);
  SHAD(m);
  scene.add(m);
  if (!opts.noCollide) {
    solids.push({ x1, x2, z1, z2 });
    blockers.push(m);
  }
  if (opts.pad !== false) flat(x1 - 4, x2 + 4, z1 - 4, z2 + 4, 0.012, MAT.pad, 2);
  if (h > 28 && !opts.noRoof) {
    const pw = Math.min(w * 0.4, 16),
      pd = Math.min(d * 0.4, 14);
    box(pw, 4, pd, lam(0x9a9b97), (x1 + x2) / 2, h + 2, (z1 + z2) / 2);
  }
  if (!opts.noMap) mapRect(x1, x2, z1, z2, opts.map || '#56665b');
  return m;
}
export { building };
for (const b of BUILDINGS) building(b[0], b[1], b[2], b[3], b[4], b[5], b[6]);
// Galleria Dallas
for (const b of MALL)
  building(b[0], b[1], b[2], b[3], b[4], b[5], b[6], {
    map: '#8b7a5c',
    noRoof: b[5] === 'stone',
  });
{
  const glassM = new THREE.MeshPhongMaterial({
    color: 0xa6c6d6,
    specular: 0xffffff,
    shininess: 90,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide,
  });
  const v1 = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 9, VAULT.z2 - VAULT.z1, 28, 1, true, 0, Math.PI)
      .rotateZ(Math.PI / 2)
      .rotateY(Math.PI / 2),
    glassM,
  );
  v1.position.set(VAULT.x, 20, (VAULT.z1 + VAULT.z2) / 2);
  v1.castShadow = true;
  scene.add(v1);
  const v2 = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 34, 24, 1, true, 0, Math.PI).rotateZ(Math.PI / 2),
    glassM,
  );
  v2.position.set(VAULT.x, 20, (VAULT.z1 + VAULT.z2) / 2);
  scene.add(v2);
}
// distant fill so the horizon is not empty
for (let i = 0; i < 54; i++) {
  const a = (i / 54) * Math.PI * 2 + rand(-0.04, 0.04),
    dist = rand(680, 880);
  const x = 90 + Math.cos(a) * dist,
    z = 170 + Math.sin(a) * dist;
  const w = rand(30, 70),
    d = rand(30, 70),
    h = pick([14, 20, 26, 40, 60, 80, 110]);
  building(
    x - w / 2,
    x + w / 2,
    z - d / 2,
    z + d / 2,
    h,
    pick(['glass', 'apt', 'brick']),
    pick([0x7c97a8, 0xe2d4bb, 0xa8634c, 0x6f9cc0]),
    { noCollide: true, pad: false, noRoof: true, noMap: true },
  );
}
// south fence (keeps you off the LBJ mainlanes)
{
  box(BOUNDS.x2 - BOUNDS.x1 + 60, 1.6, 0.3, lam(0xb7b2a6), (BOUNDS.x1 + BOUNDS.x2) / 2, 0.8, BOUNDS.z2 + 6);
}
