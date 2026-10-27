// Target interior.
import * as THREE from 'three';
import { decal, lam, pick, rand, scaleUV, speckle, tex } from '../core/helpers.js';
import { flat } from '../core/materials.js';
import { signPlane, textTex } from '../world/signals.js';
import { marker } from '../world/mall-exterior.js';
import { PANTS, SHIRTS, SKINS, human } from '../life/people.js';

/* ---------- Target interior: a stocked big-box floor ---------- */
function buildTarget() {
  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0x0e0e0e);
  const M = { x1: -24, x2: 24, z1: -18, z2: 18, h: 7 },
    blk = [],
    sol = [];
  sc.add(new THREE.AmbientLight(0xffffff, 0.5));
  sc.add(new THREE.HemisphereLight(0xffffff, 0xb7b0a2, 0.42));
  const dl = new THREE.DirectionalLight(0xffffff, 0.32);
  dl.position.set(6, 10, 9);
  sc.add(dl);
  const B = (w, h, d, m, x, y, z, solid, block) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    sc.add(b);
    if (solid) sol.push({ x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2 });
    if (block) blk.push(b);
    return b;
  };
  const floorT = tex(64, 64, (g, w, h) => {
    g.fillStyle = '#d9d6d0';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 300, 0.07, '0,0,0');
    g.fillStyle = '#c7c3bb';
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, 0, 1, h);
  });
  flat(M.x1, M.x2, M.z1, M.z2, 0, lam(0xffffff, { map: floorT }), 1.2, sc);
  flat(M.x1, M.x2, 6.6, 9.6, 0.01, decal(lam(0xf4f2ed), 2), 0, sc); // main aisle loop (front)
  flat(M.x1, M.x2, -17.6, -15.6, 0.01, decal(lam(0xf4f2ed), 2), 0, sc); // back aisle
  const wall = lam(0xf1efea),
    red = lam(0xc8202a),
    gray = lam(0x8e9196),
    white = lam(0xf6f5f2);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(48, 36).rotateX(Math.PI / 2), lam(0x4a4c50));
  ceil.position.y = M.h;
  sc.add(ceil);
  B(48.4, M.h, 0.2, wall, 0, M.h / 2, M.z1 - 0.1, 0, 1);
  B(0.2, M.h, 36, wall, M.x1 - 0.1, M.h / 2, 0, 0, 1);
  B(0.2, M.h, 36, wall, M.x2 + 0.1, M.h / 2, 0, 0, 1);
  B(22.6, M.h, 0.2, wall, -12.7, M.h / 2, M.z2 + 0.1, 0, 1);
  B(22.6, M.h, 0.2, wall, 12.7, M.h / 2, M.z2 + 0.1, 0, 1);
  B(2.8, M.h - 3, 0.2, wall, 0, 3 + (M.h - 3) / 2, M.z2 + 0.1, 0, 1);
  B(48, 0.9, 0.06, red, 0, 5.4, M.z1 + 0.04);
  B(0.06, 0.9, 36, red, M.x1 + 0.04, 5.4, 0);
  B(0.06, 0.9, 36, red, M.x2 - 0.04, 5.4, 0);
  const gl = new THREE.MeshPhongMaterial({
    color: 0x9fbccc,
    transparent: true,
    opacity: 0.5,
    specular: 0xffffff,
    shininess: 90,
  });
  B(1.35, 2.9, 0.06, gl, -0.7, 1.45, M.z2 + 0.02);
  B(1.35, 2.9, 0.06, gl, 0.7, 1.45, M.z2 + 0.02);
  B(2.9, 0.14, 0.26, red, 0, 2.97, M.z2);
  const ex = textTex(256, 96, (g, w, h) => {
    g.fillStyle = '#f4f1ea';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#c7271f';
    g.font = '800 64px Overpass, Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('EXIT', w / 2, h / 2 + 4);
  });
  {
    const es = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.26), new THREE.MeshBasicMaterial({ map: ex }));
    es.position.set(0, 3.4, M.z2 - 0.02);
    es.rotation.y = Math.PI;
    sc.add(es);
  }
  // department signs
  const dep = (t, x, y, z, ry) => {
    const tt = textTex(512, 128, (g, w, h) => {
      g.fillStyle = '#c8202a';
      g.font = '800 72px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(t, w / 2, h / 2 + 4);
    });
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 1.5),
      new THREE.MeshBasicMaterial({ map: tt, transparent: true }),
    );
    m.position.set(x, y, z);
    m.rotation.y = ry;
    sc.add(m);
  };
  [
    ['GROCERY', -16],
    ['HOME', -5],
    ['ELECTRONICS', 6],
    ['TOYS', 17],
  ].forEach(([t, x]) => dep(t, x, 4.4, M.z1 + 0.08, 0));
  dep('APPAREL', M.x1 + 0.08, 4.4, 2, Math.PI / 2);
  dep('BEAUTY', M.x2 - 0.08, 4.4, 2, -Math.PI / 2);
  // ceiling light strips
  {
    const lm = new THREE.MeshBasicMaterial({ color: 0xfffdf6 });
    for (let x = -18; x <= 18; x += 6)
      for (let z = -14; z <= 14; z += 7) B(3, 0.08, 0.4, lm, x, M.h - 0.3, z);
  }
  // shelving gondolas with stocked faces
  const prod = () =>
    tex(256, 128, (g, w, h) => {
      g.fillStyle = '#eceae6';
      g.fillRect(0, 0, w, h);
      for (let sh = 0; sh < 4; sh++) {
        const y = sh * 32;
        g.fillStyle = '#a9a69f';
        g.fillRect(0, y + 29, w, 3);
        let x = 2;
        while (x < w - 4) {
          const bw = 7 + Math.random() * 16,
            bh = 11 + Math.random() * 15;
          g.fillStyle = `hsl(${(Math.random() * 360) | 0},${(45 + Math.random() * 45) | 0}%,${(30 + Math.random() * 40) | 0}%)`;
          g.fillRect(x, y + 29 - bh, bw - 1.5, bh);
          x += bw;
        }
      }
    });
  const pms = [prod(), prod(), prod()].map((t) => lam(0xffffff, { map: t }));
  const numT = (n) =>
    textTex(128, 128, (g, w, h) => {
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(64, 64, 60, 0, 7);
      g.fill();
      g.fillStyle = '#c8202a';
      g.font = '800 68px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(n, 64, 70);
    });
  const aisleXs = [];
  for (let i = 0; i < 9; i++) {
    const x = -19.2 + i * 4.8,
      L = 13,
      zc = -8.6;
    const geo = scaleUV(new THREE.BoxGeometry(1.3, 2.1, L), L / 3, 1);
    const pm = pms[i % 3];
    const gnd = new THREE.Mesh(geo, [pm, pm, white, white, white, white]);
    gnd.position.set(x, 1.05, zc);
    sc.add(gnd);
    blk.push(gnd);
    sol.push({ x1: x - 0.65, x2: x + 0.65, z1: zc - L / 2, z2: zc + L / 2 });
    B(1.4, 1.25, 0.9, red, x, 0.62, zc + L / 2 + 0.45, 1);
    B(1.42, 0.08, 0.95, white, x, 1.27, zc + L / 2 + 0.45);
    if (i < 8) {
      const ax = x + 2.4;
      aisleXs.push(ax);
      const sg = signPlane(numT(String(i + 1)), 0.9, 0.9);
      sg.position.set(ax, 4.1, -8.6);
      sc.add(sg);
      B(0.04, 2.4, 0.04, gray, ax, 5.8, -8.6);
    }
  }
  // apparel racks (front left)
  const clothes = [0x2d5d8a, 0xc23b33, 0xe8e4da, 0x2f6b4e, 0x6d4a8a, 0xd79a2b, 0x3a3d42];
  for (const [x, z] of [
    [-20, 1.5],
    [-16, 3.8],
    [-12.5, 1.5],
    [-9, 3.8],
  ]) {
    B(0.08, 1.4, 0.08, gray, x, 0.7, z);
    const r = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.85, 18, 1, true),
      lam(pick(clothes), { side: THREE.DoubleSide }),
    );
    r.position.set(x, 1.05, z);
    sc.add(r);
    sol.push({ x1: x - 1, x2: x + 1, z1: z - 1, z2: z + 1 });
  }
  // display tables (front right)
  for (const [x, z] of [
    [9, 1.8],
    [13.5, 3.8],
    [18, 1.8],
  ]) {
    B(2.6, 0.8, 1.6, lam(0x8a6a4c), x, 0.4, z, 1);
    for (let k = 0; k < 6; k++)
      B(
        0.4,
        0.25 + Math.random() * 0.3,
        0.4,
        lam(pick(clothes)),
        x - 0.95 + (k % 3) * 0.95,
        0.95,
        z - 0.35 + (k > 2 ? 0.7 : 0),
      );
  }
  // checkout lanes
  for (let i = 0; i < 6; i++) {
    const x = -20 + i * 4.4;
    B(0.9, 1, 3.2, lam(0xdedad3), x, 0.5, 12.4, 1, 1);
    B(0.95, 0.06, 2.2, lam(0x222222), x, 1.03, 12.8);
    B(0.08, 2.6, 0.08, gray, x + 0.42, 1.3, 10.9);
    const n = signPlane(numT(String(i + 1)), 0.55, 0.55);
    n.position.set(x + 0.42, 2.85, 10.9);
    sc.add(n);
  }
  B(6, 1.1, 1.2, red, 17, 0.55, 13, 1, 1);
  B(6, 0.08, 1.3, white, 17, 1.12, 13); // guest services
  // shopping carts by the door
  const cartM = red;
  for (let row = 0; row < 2; row++)
    for (let k = 0; k < 5; k++) {
      const x = 6.5 + k * 0.7,
        z = 15.2 + row * 1.4;
      B(0.55, 0.45, 0.85, cartM, x, 0.78, z);
      B(0.5, 0.04, 0.04, gray, x, 1.05, z + 0.48);
      B(0.5, 0.5, 0.04, gray, x, 0.3, z);
    }
  sol.push({ x1: 6.1, x2: 9.6, z1: 14.7, z2: 17.2 });
  // shoppers
  const npcs = [];
  const paths = [
    { ax: 'x', c: 8.1, a: -22, b: 22 },
    { ax: 'x', c: -16.6, a: -22, b: 22 },
    ...aisleXs.map((x) => ({ ax: 'z', c: x, a: -15, b: 5 })),
  ];
  for (let i = 0; i < 8; i++) {
    const p = paths[i % paths.length];
    const h = human({
      skin: pick(SKINS),
      shirt: pick(SHIRTS),
      pants: pick(PANTS),
      shoe: pick(['#e9e9e6', '#1b1b1b']),
      hair: pick(['#1b1410', '#3a2a1e', '#6b4a2a', '#c9a46a']),
    });
    sc.add(h.g);
    npcs.push({ h, ...p, t: rand(p.a, p.b), dir: Math.random() < 0.5 ? 1 : -1, spd: rand(0.9, 1.3) });
  }
  const mk = marker(sc, 0, M.z2 - 0.9);
  return {
    scene: sc,
    RM: M,
    door: { x: 0, z: M.z2 },
    spawn: { x: 0, z: 15 },
    blockers: blk,
    solids: sol,
    camMax: 6.5,
    mark: mk,
    npcs,
    label: ['Target', 'Inside · store floor', 'Target · off James Temple Dr'],
    name: 'Target',
    exitText: 'Exit to the parking lot',
  };
}

export { buildTarget };
