// Street-name blades, traffic signals, stop signs and highway guide signs.
import * as THREE from 'three';
import { G, INTS, RD, SW, sAt } from './layout.js';
import { scene } from '../core/renderer.js';
import { posAt, segAt, solids, tex } from '../core/helpers.js';
import { MAT, box } from '../core/materials.js';

/* ---------- signs ---------- */
function textTex(w, h, draw) {
  return tex(w, h, draw, false);
}
function rrect(g, x, y, w, h, r) {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, r);
  else g.rect(x, y, w, h);
}
function bladeTex(txt) {
  return textTex(512, 96, (g, w, h) => {
    g.fillStyle = '#0f6b3f';
    rrect(g, 0, 0, w, h, 12);
    g.fill();
    g.strokeStyle = '#eef3ec';
    g.lineWidth = 5;
    rrect(g, 7, 7, w - 14, h - 14, 8);
    g.stroke();
    g.fillStyle = '#f4f7f2';
    let fs = 56;
    g.font = `800 ${fs}px Overpass, Arial Narrow, Arial, sans-serif`;
    while (g.measureText(txt.toUpperCase()).width > w - 40 && fs > 30) {
      fs -= 2;
      g.font = `800 ${fs}px Overpass, Arial Narrow, Arial, sans-serif`;
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(txt.toUpperCase(), w / 2, h / 2 + 4);
  });
}
function signPlane(t, w, h) {
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true });
  const g = new THREE.Group();
  const a = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  const b = a.clone();
  b.rotation.y = Math.PI;
  g.add(a, b);
  return g;
}
const stopTex = textTex(128, 128, (g, w, h) => {
  g.fillStyle = '#b8211c';
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    g.lineTo(64 + 60 * Math.cos(a), 64 + 60 * Math.sin(a));
  }
  g.fill();
  g.strokeStyle = '#fff';
  g.lineWidth = 5;
  g.stroke();
  g.fillStyle = '#fff';
  g.font = '800 40px Overpass, Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('STOP', 64, 68);
});
const stopMat = new THREE.MeshBasicMaterial({ map: stopTex, transparent: true, alphaTest: 0.5 });
function stopSign(x, z, face) {
  box(0.08, 2.6, 0.08, MAT.pole, x, 1.3, z);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.78), stopMat);
  s.position.set(x, 2.45, z);
  s.rotation.y = face;
  scene.add(s);
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.39, 8), MAT.pole);
  back.position.set(x, 2.45, z);
  back.rotation.y = face + Math.PI;
  back.translateZ(0.01);
  scene.add(back);
}
/* ---------- signals, stop signs, street blades ---------- */
const LAMP = {};
for (const ax of ['ns', 'ew'])
  for (const c of ['r', 'y', 'g']) LAMP[ax + c] = new THREE.MeshBasicMaterial({ color: 0x222222 });
const LAMPCOL = { r: 0xff3b2f, y: 0xffb21f, g: 0x3dff8a },
  LAMPDIM = { r: 0x3a1311, y: 0x3a2c0d, g: 0x0f3320 };
const headGeo = new THREE.BoxGeometry(0.42, 1.25, 0.32),
  lampGeo = new THREE.SphereGeometry(0.12, 10, 8);
function travels(r, sI) {
  const g = segAt(r, sI),
    t = new Set();
  const q = (v) => Math.round(v) || 0; // the || 0 turns -0 into 0
  for (const l of r.lanesDef) t.add(q(g.d[0] * l.d) + ',' + q(g.d[1] * l.d));
  return t;
}
for (const I of INTS) {
  const hn = I.N.w / 2,
    he = I.E.w / 2;
  if (I.sig) {
    const tN = travels(I.N, I.sN),
      tE = travels(I.E, I.sE);
    const specs = [];
    if (tN.has('0,1') && I.ext.n)
      specs.push({
        px: I.x - hn - 2,
        pz: I.z + he + 2,
        hx: I.x - hn / 2,
        hz: I.z + he + 2,
        ax: 'ns',
        f: Math.PI,
      });
    if (tN.has('0,-1') && I.ext.s)
      specs.push({ px: I.x + hn + 2, pz: I.z - he - 2, hx: I.x + hn / 2, hz: I.z - he - 2, ax: 'ns', f: 0 });
    if (tE.has('1,0') && I.ext.w)
      specs.push({
        px: I.x + hn + 2,
        pz: I.z + he + 2,
        hx: I.x + hn + 2,
        hz: I.z + he / 2,
        ax: 'ew',
        f: -Math.PI / 2,
      });
    if (tE.has('-1,0') && I.ext.e)
      specs.push({
        px: I.x - hn - 2,
        pz: I.z - he - 2,
        hx: I.x - hn - 2,
        hz: I.z - he / 2,
        ax: 'ew',
        f: Math.PI / 2,
      });
    for (const s of specs) {
      box(0.28, 7, 0.28, MAT.pole, s.px, 3.5, s.pz);
      solids.push({ x1: s.px - 0.2, x2: s.px + 0.2, z1: s.pz - 0.2, z2: s.pz + 0.2 });
      const dx = s.hx - s.px,
        dz = s.hz - s.pz,
        len = Math.hypot(dx, dz) + 0.3;
      const arm = box(
        Math.abs(dx) > 0.01 ? len : 0.18,
        0.18,
        Math.abs(dz) > 0.01 ? len : 0.18,
        MAT.pole,
        (s.px + s.hx) / 2,
        6.9,
        (s.pz + s.hz) / 2,
      );
      arm.castShadow = false;
      const head = new THREE.Group();
      head.position.set(s.hx, 6.2, s.hz);
      head.rotation.y = s.f;
      head.add(new THREE.Mesh(headGeo, MAT.dark));
      ['r', 'y', 'g'].forEach((c, i) => {
        const l = new THREE.Mesh(lampGeo, LAMP[s.ax + c]);
        l.position.set(0, 0.4 - i * 0.4, 0.17);
        head.add(l);
      });
      scene.add(head);
    }
  } else {
    const minorE = !I.E.traffic,
      minorN = !I.N.traffic;
    if (minorE) {
      if (I.ext.e) stopSign(I.x + hn + SW + 1, I.z - he - 1, Math.PI / 2);
      if (I.ext.w) stopSign(I.x - hn - SW - 1, I.z + he + 1, -Math.PI / 2);
    }
    if (minorN) {
      if (I.ext.n) stopSign(I.x - hn - 1, I.z - he - SW - 1, Math.PI);
      if (I.ext.s) stopSign(I.x + hn + 1, I.z + he + SW + 1, 0);
    }
  }
  // street-name blades on a corner that exists
  let corner = null;
  for (const qx of [-1, 1])
    for (const qz of [1, -1])
      if (!corner && (qx < 0 ? I.ext.w : I.ext.e) && (qz < 0 ? I.ext.n : I.ext.s)) corner = [qx, qz];
  if (!corner) corner = [I.ext.e ? 1 : -1, I.ext.s ? 1 : -1];
  const bx = I.x + corner[0] * (hn + SW / 2),
    bz = I.z + corner[1] * (he + SW / 2);
  box(0.12, 4.6, 0.12, MAT.pole, bx, 2.3, bz);
  const nsS = signPlane(bladeTex(I.N.name), 2.6, 0.5);
  nsS.position.set(bx, 4.35, bz);
  nsS.rotation.y = Math.PI / 2;
  scene.add(nsS);
  const ewS = signPlane(bladeTex(I.E.name), 2.6, 0.5);
  ewS.position.set(bx, 3.8, bz);
  scene.add(ewS);
}
// Tollway + LBJ overhead guide signs
function guideTex(lines, dir, shield) {
  return textTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#0f6b3f';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#eef3ec';
    g.lineWidth = 8;
    g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f4f7f2';
    g.textAlign = 'center';
    g.font = '800 62px Overpass, Arial, sans-serif';
    g.fillText(lines, w / 2, 100);
    g.font = '800 54px Overpass, Arial, sans-serif';
    g.fillText(dir, w / 2 - 90, 198);
    if (shield === 'toll') {
      g.fillStyle = '#f2c230';
      g.fillRect(w / 2 + 30, 148, 170, 66);
      g.fillStyle = '#1b1b1b';
      g.font = '800 44px Overpass, Arial, sans-serif';
      g.fillText('TOLL', w / 2 + 115, 198);
    } else {
      const x = w / 2 + 110,
        y = 180;
      g.fillStyle = '#fff';
      g.beginPath();
      g.moveTo(x - 48, y - 42);
      g.lineTo(x + 48, y - 42);
      g.quadraticCurveTo(x + 52, y + 20, x, y + 48);
      g.quadraticCurveTo(x - 52, y + 20, x - 48, y - 42);
      g.fill();
      g.fillStyle = '#1f4f9a';
      g.beginPath();
      g.moveTo(x - 42, y - 22);
      g.lineTo(x + 42, y - 22);
      g.quadraticCurveTo(x + 45, y + 18, x, y + 41);
      g.quadraticCurveTo(x - 45, y + 18, x - 42, y - 22);
      g.fill();
      g.fillStyle = '#c8202a';
      g.fillRect(x - 43, y - 37, 86, 13);
      g.fillStyle = '#fff';
      g.font = '800 34px Overpass, Arial, sans-serif';
      g.fillText('635', x, y + 16);
    }
  });
}
function gantry(r, s, a, b) {
  const [cx, cz, g] = posAt(r, s, 0),
    head = Math.atan2(g.d[0], g.d[1]);
  for (const o of [-r.w / 2 + 0.4, r.w / 2 - 0.4]) {
    const [x, z] = posAt(r, s, o);
    box(0.5, 7, 0.5, MAT.pole, x, 12.7, z);
  }
  const beam = box(r.w, 0.5, 0.6, MAT.pole, cx, 16, cz);
  beam.rotation.y = head;
  for (const sg of [a, b]) {
    const [x, z] = posAt(r, s, sg.o);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 2.6), new THREE.MeshBasicMaterial({ map: sg.t }));
    m.position.set(x, 14.2, z);
    m.rotation.y = head + (sg.back ? Math.PI : 0);
    m.translateZ(0.35);
    scene.add(m);
  }
}
// A sign faces the traffic driving toward it. Traffic on the o > 0 side drives along the road's
// direction (southbound on the Tollway, eastbound on LBJ), so its sign is turned back (back: true).
gantry(
  RD.dnt,
  sAt(RD.dnt, ...G([-366, -90])),
  { o: 6.2, back: true, t: guideTex('DALLAS NORTH TOLLWAY', 'SOUTH', 'toll') },
  { o: -6.2, back: false, t: guideTex('DALLAS NORTH TOLLWAY', 'NORTH', 'toll') },
);
gantry(
  RD.i635,
  sAt(RD.i635, ...G([120, 762])),
  { o: 6.2, back: true, t: guideTex('LBJ FREEWAY', 'EAST', 'i') },
  { o: -6.2, back: false, t: guideTex('LBJ FREEWAY', 'WEST', 'i') },
);

export { LAMP, LAMPCOL, LAMPDIM, rrect, signPlane, textTex };
