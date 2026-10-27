// Player state and model, skateboard, ice skates and the double-jump puff.
import * as THREE from 'three';
import { state } from '../core/state.js';
import { DOORS } from '../world/layout.js';
import { scene } from '../core/renderer.js';
import { V3, lam } from '../core/helpers.js';
import { human } from '../life/people.js';
import { late } from '../core/state.js';

/* ---------- player ---------- */
// start on the Noel Rd sidewalk, facing Macy's entrance into the Galleria
const P = {
  pos: new V3(DOORS[0].x + 2, 0, DOORS[0].z + 13),
  vel: new V3(),
  vy: 0,
  rot: Math.atan2(-0.8, -0.6),
  ground: true,
};
const ph = human({ skin: '#c68b62', shirt: '#1f4e79', pants: '#2a2e38', shoe: '#efefec', hair: '#22180f' });
scene.add(ph.g);
// skateboard (hold Shift)
const board = new THREE.Group();
{
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.84), lam(0x1d1d1f));
  deck.position.y = 0.11;
  board.add(deck);
  const art = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.006, 0.6), lam(0xf2b33d));
  art.position.y = 0.09;
  board.add(art);
  const wg = new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10).rotateZ(Math.PI / 2),
    wm = lam(0xe9e4d6);
  for (const x of [-0.09, 0.09])
    for (const z of [-0.28, 0.28]) {
      const w = new THREE.Mesh(wg, wm);
      w.position.set(x, 0.04, z);
      board.add(w);
    }
  for (const z of [-0.28, 0.28]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.05), lam(0x8d9196));
    t.position.set(0, 0.075, z);
    board.add(t);
  }
  board.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  board.position.y = -0.12;
  board.visible = false;
  ph.g.add(board);
}
state.skating = false;
state.iceSkating = false;
state.sprinting = false;
state.jumpQ = false;
const puffM = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const puffR = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.5, 28).rotateX(-Math.PI / 2), puffM);
let puffT = 0;
function puff() {
  (state.mode === 'room' ? state.curRoom.scene : scene).add(puffR);
  puffR.position.set(P.pos.x, P.pos.y + 0.05, P.pos.z);
  puffT = 1;
}
function stepPuff(dt) {
  if (puffT <= 0) return;
  puffT = Math.max(0, puffT - dt * 2.5);
  const s = 1 + (1 - puffT) * 2.6;
  puffR.scale.set(s, 1, s);
  puffM.opacity = 0.7 * puffT;
}
const blades = new THREE.Group();
{
  const bm = new THREE.MeshPhongMaterial({ color: 0xd6dade, specular: 0xffffff, shininess: 120 }),
    bt = lam(0xf4f4f2);
  for (const leg of [ph.legL, ph.legR]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.34), bm);
    b.position.set(0, -0.95, 0.05);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.16, 0.3), bt);
    boot.position.set(0, -0.85, 0.05);
    const grp = new THREE.Group();
    grp.add(b, boot);
    leg.add(grp);
  }
}
const _bl = [ph.legL.children[ph.legL.children.length - 1], ph.legR.children[ph.legR.children.length - 1]];
Object.defineProperty(blades, 'visible', {
  set(v) {
    _bl.forEach((g) => (g.visible = v));
  },
  get() {
    return _bl[0].visible;
  },
});
blades.visible = false;
function skatePose(h, push, dt) {
  h.phase += dt * (push ? 7 : 0);
  const s = push ? Math.max(0, Math.sin(h.phase)) * 0.8 : 0;
  h.legL.rotation.x = 0.12;
  h.legR.rotation.x = -0.1 - s;
  h.armL.rotation.x = 0.1;
  h.armR.rotation.x = -0.1;
  h.armL.rotation.z = -0.5;
  h.armR.rotation.z = 0.5;
  h.torso.position.y = 1.22;
}

Object.assign(late, { P });
export { P, blades, board, ph, puff, skatePose, stepPuff };
