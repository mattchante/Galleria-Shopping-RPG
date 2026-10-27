// Low-poly people (also used for the player), walk animation and sidewalk pedestrians.
import * as THREE from 'three';
import { late } from '../core/state.js';
import { scene } from '../core/renderer.js';
import { lam, pick, posAt, rand } from '../core/helpers.js';
import { SIDEWALKS, inView } from '../world/streets.js';

/* ---------- people ---------- */
function human(c) {
  const g = new THREE.Group(),
    M = (x) => lam(x);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.26), M(c.shirt));
  torso.position.y = 1.24;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), M(c.skin));
  neck.position.y = 1.59;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), M(c.skin));
  head.position.y = 1.74;
  head.scale.set(0.92, 1.05, 1);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.155, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    M(c.hair),
  );
  hair.position.set(0, 1.76, -0.01);
  g.add(torso, neck, head, hair);
  const limb = (x, y, len, w, col, end, endCol) => {
    const p = new THREE.Group();
    p.position.set(x, y, 0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, w * 1.05), M(col));
    m.position.y = -len / 2;
    p.add(m);
    if (end === 'hand') {
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M(endCol));
      h.position.y = -len - 0.03;
      p.add(h);
    }
    if (end === 'shoe') {
      const s = new THREE.Mesh(new THREE.BoxGeometry(w + 0.01, 0.1, 0.28), M(endCol));
      s.position.set(0, -len - 0.02, 0.05);
      p.add(s);
    }
    g.add(p);
    return p;
  };
  const armL = limb(-0.3, 1.5, 0.58, 0.12, c.shirt, 'hand', c.skin),
    armR = limb(0.3, 1.5, 0.58, 0.12, c.shirt, 'hand', c.skin);
  const legL = limb(-0.11, 0.94, 0.84, 0.17, c.pants, 'shoe', c.shoe),
    legR = limb(0.11, 0.94, 0.84, 0.17, c.pants, 'shoe', c.shoe);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return { g, torso, armL, armR, legL, legR, phase: 0 };
}
function animate(h, spd, dt, air) {
  h.phase += dt * (2.2 + spd * 1.7);
  const amp = air ? 0.45 : Math.min(1, spd / 4) * 0.75;
  const s = Math.sin(h.phase) * amp;
  h.legL.rotation.x = s;
  h.legR.rotation.x = -s;
  h.armL.rotation.x = -s * 0.85;
  h.armR.rotation.x = s * 0.85;
  h.armL.rotation.z = -0.06;
  h.armR.rotation.z = 0.06;
  h.torso.position.y = 1.24 + Math.abs(Math.cos(h.phase)) * 0.04 * Math.min(1, spd / 3);
}
const SKINS = ['#f1c9a5', '#d9a47c', '#b47b55', '#8a5a3b', '#5e3b26', '#e7b998'],
  SHIRTS = [
    '#c23b33',
    '#2d5d8a',
    '#e8e4da',
    '#3a3d42',
    '#2f6b4e',
    '#d79a2b',
    '#6d4a8a',
    '#1f2a3a',
    '#a8c3d6',
  ],
  PANTS = ['#2b2f3a', '#3c4a62', '#5b5246', '#1d1f22', '#7a6a55'];
const npcs = [];
{
  const walks = SIDEWALKS.filter((s) => {
    const [x, z] = posAt(s.r, (s.a + s.b) / 2, s.oc);
    return inView(x, z, -20);
  });
  for (let i = 0; i < 30 && walks.length; i++) {
    const sw = pick(walks);
    const h = human({
      skin: pick(SKINS),
      shirt: pick(SHIRTS),
      pants: pick(PANTS),
      shoe: pick(['#e9e9e6', '#1b1b1b', '#7a5a3a']),
      hair: pick(['#1b1410', '#3a2a1e', '#6b4a2a', '#c9a46a', '#2a2a2a']),
    });
    npcs.push({
      h,
      sw,
      t: rand(sw.a, sw.b),
      dir: Math.random() < 0.5 ? 1 : -1,
      spd: rand(1.15, 1.6),
      off: rand(-1.1, 1.1),
    });
    scene.add(h.g);
  }
}
function stepNPCs(dt) {
  for (const n of npcs) {
    n.t += n.dir * n.spd * dt;
    if (n.t > n.sw.b) {
      n.t = n.sw.b;
      n.dir = -1;
    }
    if (n.t < n.sw.a) {
      n.t = n.sw.a;
      n.dir = 1;
    }
    const [x, z, g] = posAt(n.sw.r, n.t, n.sw.oc + n.off * 0.6);
    n.h.g.position.set(x, 0.04, z);
    n.h.g.rotation.y = Math.atan2(g.d[0] * n.dir, g.d[1] * n.dir);
    const dx = x - late.P.pos.x,
      dz = z - late.P.pos.z;
    if (dx * dx + dz * dz < 4900) animate(n.h, n.spd, dt, false);
  }
}

export { PANTS, SHIRTS, SKINS, animate, human, stepNPCs };
