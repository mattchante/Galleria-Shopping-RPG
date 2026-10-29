// The drivable black SUV: model, enter/exit and driving physics.
import * as THREE from 'three';
import { state, late } from '../core/state.js';
import { scene } from '../core/renderer.js';
import { V3, clamp, lam } from '../core/helpers.js';
import { collide } from '../core/collision.js';
import { P, board, ph } from '../player/avatar.js';

// black SUV (Tab)
const V = { active: false, exists: false, pos: new V3(), h: 0, speed: 0, steer: 0 };
const suv = (function () {
  const g = new THREE.Group();
  const paint = new THREE.MeshPhongMaterial({ color: 0x0e0f11, specular: 0x777c84, shininess: 90 }),
    glass = new THREE.MeshPhongMaterial({ color: 0x161b21, specular: 0x99aabb, shininess: 110 }),
    trim = lam(0x161616),
    chrome = new THREE.MeshPhongMaterial({ color: 0xaeb2b8, specular: 0xffffff, shininess: 120 });
  const add = (w, h, d, m, x, y, z) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    b.castShadow = true;
    g.add(b);
    return b;
  };
  add(2.0, 0.95, 4.95, paint, 0, 0.9, 0);
  add(1.86, 0.8, 3.05, glass, 0, 1.76, -0.35);
  add(1.92, 0.1, 3.0, paint, 0, 2.2, -0.35);
  add(1.88, 0.78, 0.14, paint, 0, 1.76, 0.3);
  add(1.4, 0.32, 0.06, trim, 0, 0.98, 2.48);
  add(2.04, 0.28, 0.22, trim, 0, 0.5, 2.45);
  add(2.04, 0.28, 0.22, trim, 0, 0.5, -2.45);
  for (const x of [-0.8, 0.8]) add(0.06, 0.06, 2.6, chrome, x, 2.29, -0.35);
  const hl = new THREE.MeshBasicMaterial({ color: 0xfff2d2 }),
    tl = new THREE.MeshBasicMaterial({ color: 0xb3141b });
  for (const s of [-1, 1]) {
    add(0.4, 0.13, 0.05, hl, s * 0.7, 1.12, 2.48);
    add(0.28, 0.3, 0.05, tl, s * 0.82, 1.12, -2.48);
    add(0.12, 0.14, 0.24, paint, s * 1.06, 1.5, 0.95);
  }
  const wg = new THREE.CylinderGeometry(0.43, 0.43, 0.34, 16).rotateZ(Math.PI / 2),
    rg = new THREE.CylinderGeometry(0.26, 0.26, 0.36, 10).rotateZ(Math.PI / 2),
    wm = lam(0x121212);
  const wheels = [],
    fronts = [];
  for (const x of [-0.92, 0.92])
    for (const z of [1.55, -1.55]) {
      const piv = new THREE.Group();
      piv.position.set(x, 0.43, z);
      const w = new THREE.Group();
      const t = new THREE.Mesh(wg, wm);
      t.castShadow = true;
      w.add(t, new THREE.Mesh(rg, chrome));
      piv.add(w);
      g.add(piv);
      wheels.push(w);
      if (z > 0) fronts.push(piv);
    }
  g.visible = false;
  scene.add(g);
  return { g, wheels, fronts };
})();
function carCollide() {
  const fx = Math.sin(V.h),
    fz = Math.cos(V.h);
  let hit = 0;
  for (const off of [1.6, 0, -1.6]) {
    const p = { x: V.pos.x + fx * off, z: V.pos.z + fz * off },
      bx = p.x,
      bz = p.z;
    collide(p, 1.05, true);
    const dx = p.x - bx,
      dz = p.z - bz;
    if (dx || dz) {
      V.pos.x += dx;
      V.pos.z += dz;
      hit += Math.hypot(dx, dz);
    }
  }
  return hit;
}
function toggleCar() {
  if (!state.started || state.busy || state.flying || state.mode !== 'out') return;
  if (V.active) {
    V.active = false;
    const lx = Math.cos(V.h),
      lz = -Math.sin(V.h);
    P.pos.set(V.pos.x + lx * 2.2, 0, V.pos.z + lz * 2.2);
    P.rot = V.h;
    P.vel.set(0, 0, 0);
    P.vy = 0;
    collide(P.pos, 0.42);
    V.speed = 0;
    V.steer = 0;
    ph.g.visible = true;
    return;
  }
  if (!V.exists || Math.hypot(V.pos.x - P.pos.x, V.pos.z - P.pos.z) > 12) {
    const rx = -Math.cos(P.rot),
      rz = Math.sin(P.rot);
    V.pos.set(P.pos.x + rx * 3.2, 0, P.pos.z + rz * 3.2);
    V.h = P.rot;
    V.exists = true;
    suv.g.visible = true;
    carCollide();
    carCollide();
  }
  V.active = true;
  V.speed = 0;
  state.skating = false;
  board.visible = false;
  ph.g.visible = false;
  late.cam.yaw = V.h + Math.PI;
  state.lastLook = 0;
  syncCar(0);
}
function syncCar(dt) {
  suv.g.position.set(V.pos.x, 0, V.pos.z);
  suv.g.rotation.y = V.h;
  for (const w of suv.wheels) w.rotation.x += (V.speed * dt) / 0.43;
  for (const f of suv.fronts) f.rotation.y = -V.steer;
  P.pos.set(V.pos.x, 0, V.pos.z);
  P.rot = V.h;
  P.vel.set(0, 0, 0);
}
function stepCar(dt) {
  let thr = 0,
    str = 0;
  if (late.keys.KeyW || late.keys.ArrowUp) thr += 1;
  if (late.keys.KeyS || late.keys.ArrowDown) thr -= 1;
  if (late.keys.KeyD || late.keys.ArrowRight) str += 1;
  if (late.keys.KeyA || late.keys.ArrowLeft) str -= 1;
  if (late.stick.id !== null) {
    thr -= late.stick.y;
    str += late.stick.x;
  }
  thr = clamp(thr, -1, 1);
  str = clamp(str, -1, 1);
  const TOP = 46,
    REV = 11,
    sp = V.speed;
  if (thr > 0) {
    if (sp < 0) V.speed += 34 * dt * thr;
    else V.speed += (4 + 15 * (1 - sp / TOP)) * thr * dt;
  } else if (thr < 0) {
    if (sp > 0.5) V.speed -= 30 * dt * -thr;
    else V.speed = Math.max(-REV, sp - 7 * dt * -thr);
  } else V.speed -= Math.sign(sp) * Math.min(Math.abs(sp), (2.5 + Math.abs(sp) * 0.04) * dt);
  if (late.keys.Space) V.speed -= Math.sign(V.speed) * Math.min(Math.abs(V.speed), 38 * dt);
  V.speed = clamp(V.speed, -REV, TOP);
  const maxSteer = 0.55 * (1 - Math.min(0.7, Math.abs(V.speed) / 60));
  V.steer += (str * maxSteer - V.steer) * Math.min(1, dt * 8);
  const dist = V.speed * dt,
    n = Math.max(1, Math.ceil(Math.abs(dist) / 0.5));
  for (let i = 0; i < n; i++) {
    V.h -= ((dist / n) * Math.tan(V.steer)) / 2.9;
    V.pos.x += (Math.sin(V.h) * dist) / n;
    V.pos.z += (Math.cos(V.h) * dist) / n;
    const hit = carCollide();
    if (hit > 0.03) {
      V.speed *= Math.max(0.15, 1 - hit * 0.9);
      break;
    }
  }
  syncCar(dt);
}

Object.assign(late, { V });
export { V, stepCar, toggleCar };
