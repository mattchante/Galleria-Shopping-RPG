// The Galleria's north entrance and the glowing door markers.
import * as THREE from 'three';
import { DOORS, MALLF } from './layout.js';
import { scene } from '../core/renderer.js';
import { blockers, lam, solids } from '../core/helpers.js';
import { MAT, box } from '../core/materials.js';
import { textTex } from './signals.js';

/* ---------- mall entrance (north face of the north anchor) ---------- */
const portalMat = new THREE.MeshPhongMaterial({
  color: 0x8fb4c8,
  specular: 0xffffff,
  shininess: 100,
  emissive: 0x1d3442,
});
{
  const X = DOORS[0].x,
    F = MALLF;
  const p = box(16, 9, 2.2, portalMat, X, 4.5, F - 1.1);
  blockers.push(p);
  solids.push({ x1: X - 8, x2: X + 8, z1: F - 2.2, z2: F });
  box(20, 0.6, 6.2, lam(0xe9e3d6), X, 9.3, F - 3.1);
  for (const dx of [-9.5, 9.5]) {
    box(0.7, 9, 0.7, lam(0xe9e3d6), X + dx, 4.5, F - 5.6);
    solids.push({ x1: X + dx - 0.35, x2: X + dx + 0.35, z1: F - 5.95, z2: F - 5.25 });
  }
  const doors = new THREE.MeshPhongMaterial({ color: 0x223644, specular: 0x99aabb, shininess: 80 });
  for (const dx of [-1.3, 1.3]) box(2.4, 3.2, 0.1, doors, X + dx, 1.6, F - 2.27);
  box(5.4, 0.18, 0.12, MAT.dark, X, 3.25, F - 2.27);
  box(0.12, 3.2, 0.12, MAT.dark, X, 1.6, F - 2.28);
  const gs = textTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#2f2a24';
    g.textAlign = 'center';
    try {
      g.letterSpacing = '22px';
    } catch (e) {}
    g.font = '800 150px Overpass, Arial, sans-serif';
    g.fillText('GALLERIA', w / 2 + 11, 150);
    try {
      g.letterSpacing = '30px';
    } catch (e) {}
    g.font = '600 54px Overpass, Arial, sans-serif';
    g.fillText('DALLAS', w / 2 + 15, 228);
  });
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 7.5),
    new THREE.MeshBasicMaterial({ map: gs, transparent: true }),
  );
  sign.position.set(X, 15.2, F - 0.08);
  sign.rotation.y = Math.PI;
  scene.add(sign);
}
function marker(parent, x, z) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.15, 40).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xf2b33d, transparent: true, opacity: 0.9 }),
  );
  ring.position.y = 0.07;
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 2.4, 32, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xf2b33d,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  col.position.y = 1.2;
  g.add(ring, col);
  g.position.set(x, 0, z);
  parent.add(g);
  return g;
}
const marksOut = DOORS.map((d) => marker(scene, d.x, d.z));

export { marker, marksOut };
