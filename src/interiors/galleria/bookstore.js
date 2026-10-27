// Barnes & Noble: two-floor anchor at the Galleria's north end, part of the mall itself (no loading screen).
// Level 1 opens off the mall concourse; level 2 opens off both upper walkways and is also reached by
// the staircase along the east wall. Built in local coordinates inside a group placed at z = BZ:
// local z = 0 is the mall's north wall, the store runs north to local z = -34.
import * as THREE from 'three';
import { clamp, decal, lam, pick, rand, speckle, tex } from '../../core/helpers.js';
import { flat } from '../../core/materials.js';
import { signPlane, textTex } from '../../world/signals.js';
import { PANTS, SHIRTS, SKINS, human } from '../../life/people.js';

export const BZ = -68.3; // world z of the store front
const L2 = 5.5, // level-2 floor height (matches the mall's upper walkways)
  H2 = 10.5; // roof
// stair along the east wall: foot at local z = -6.5, top at z = -18.5
const ST = { x1: 19.2, x2: 22, zb: -6.5, zt: -18.5 };
// level-2 floor plates (local). The open atrium is x -6..6, z -24..-10; the stairwell is cut out.
const FLOOR2 = [
  [-22, 22, -34, -24],
  [-22, -6, -24, -10],
  [6, ST.x1, -24, -10],
  [ST.x1, 22, -24, ST.zt],
  [-22, ST.x1, -10, 0.6],
  [ST.x1, 22, ST.zb, 0.6],
];

export function buildBookstore(ctx) {
  const root = new THREE.Group();
  root.position.z = BZ;
  ctx.sc.add(root);
  const g1 = new THREE.Group(),
    g2 = new THREE.Group();
  g2.position.y = L2;
  root.add(g1, g2);
  let sc = g1,
    band = [0, L2 - 0.5]; // height band new solids block, relative to the world floor
  const M = { x1: -22, x2: 22, z1: -34, z2: 0 },
    blk = ctx.blk,
    npcs = ctx.npcs;
  const push = (s) => {
    const y0 = s.y0 !== undefined ? s.y0 : band[0],
      y1 = s.y1 !== undefined ? s.y1 : band[1];
    ctx.sol.push({ x1: s.x1, x2: s.x2, z1: s.z1 + BZ, z2: s.z2 + BZ, y0, y1 });
  };
  for (const [x, z] of [
    [-12, -20],
    [12, -20],
  ]) {
    const pl = new THREE.PointLight(0xffe6c2, 0.36, 24);
    pl.position.set(x, 4.3, z);
    root.add(pl);
  }
  const B = (w, h, d, m, x, y, z, solid, block) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    sc.add(b);
    if (solid) push({ x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2 });
    if (block) blk.push(b);
    return b;
  };
  const wood = lam(0x3b2a1e),
    woodL = lam(0x7a5a3c),
    cream = lam(0xf1ebde),
    dark = lam(0x262321),
    white = lam(0xf6f4ef),
    brass = new THREE.MeshPhongMaterial({ color: 0xb8924a, specular: 0xffe9b0, shininess: 80 });
  // floor: green carpet with a tile cross-aisle and rust border stripes
  const carpT = tex(64, 64, (g, w, h) => {
    g.fillStyle = '#3d5546';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 900, 0.12, '0,0,0');
    speckle(g, w, h, 300, 0.06, '255,255,255');
  });
  flat(M.x1, M.x2, M.z1, M.z2, 0, lam(0xffffff, { map: carpT }), 2, sc);
  const tileT = tex(128, 128, (g, w, h) => {
    g.fillStyle = '#d9b98c';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#cfa877';
    g.fillRect(0, 0, 64, 64);
    g.fillRect(64, 64, 64, 64);
    speckle(g, w, h, 400, 0.08, '60,30,10');
    g.fillStyle = '#b88f5d';
    g.fillRect(0, 0, w, 2);
    g.fillRect(0, 0, 2, h);
    g.fillRect(0, 63, w, 1);
    g.fillRect(63, 0, 1, h);
  });
  const tileM = decal(lam(0xffffff, { map: tileT }), 2),
    rust = decal(lam(0x9a4a2c), 3),
    cremeS = decal(lam(0xe9dcc2), 3);
  const walk = (x1, x2, z1, z2) => {
    flat(x1, x2, z1, z2, 0.01, tileM, 2.4, sc);
    if (x2 - x1 < z2 - z1) {
      for (const x of [x1 - 0.5, x2 + 0.1]) {
        flat(x, x + 0.4, z1, z2, 0.012, rust, 0, sc);
      }
      flat(x1 - 0.1, x1, z1, z2, 0.012, cremeS, 0, sc);
      flat(x2, x2 + 0.1, z1, z2, 0.012, cremeS, 0, sc);
    } else {
      for (const z of [z1 - 0.5, z2 + 0.1]) {
        flat(x1, x2, z, z + 0.4, 0.012, rust, 0, sc);
      }
      flat(x1, x2, z1 - 0.1, z1, 0.012, cremeS, 0, sc);
      flat(x1, x2, z2, z2 + 0.1, 0.012, cremeS, 0, sc);
    }
  };
  walk(-2.6, 2.6, -33.5, 0);
  walk(-21.5, 21.5, -19.6, -14.4);
  // books
  const SPINE = [
    '#6b1f1f',
    '#1f3a5a',
    '#2f4a35',
    '#7a5a1e',
    '#4a2a4a',
    '#1d1d1d',
    '#8c3b2a',
    '#2a5a6b',
    '#c9b48a',
    '#5a6b2a',
    '#a8752e',
    '#e3dccb',
    '#30406b',
    '#7b2e44',
    '#3f3f3f',
    '#b54a2a',
  ];
  const bookTex = (rows) =>
    tex(256, 256, (g, w, h) => {
      g.fillStyle = '#2e2017';
      g.fillRect(0, 0, w, h);
      const rh = h / rows;
      for (let r = 0; r < rows; r++) {
        const y = r * rh;
        g.fillStyle = '#4a3424';
        g.fillRect(0, y + rh - 6, w, 6);
        let x = 2;
        while (x < w - 3) {
          const bw = 4 + Math.random() * 7,
            bh = rh * (0.55 + Math.random() * 0.35);
          const c = pick(SPINE);
          g.fillStyle = c;
          g.fillRect(x, y + rh - 6 - bh, bw - 0.8, bh);
          if (Math.random() < 0.5) {
            g.fillStyle = 'rgba(230,200,120,.55)';
            g.fillRect(x + 1, y + rh - 6 - bh + bh * 0.2, bw - 2.8, 1.5);
            g.fillRect(x + 1, y + rh - 6 - bh + bh * 0.75, bw - 2.8, 1.5);
          }
          if (Math.random() < 0.06) {
            g.fillStyle = '#2e2017';
            g.fillRect(x + bw, y + 4, 6, rh - 10);
            x += 6;
          }
          x += bw;
        }
      }
      g.fillStyle = 'rgba(0,0,0,.25)';
      g.fillRect(0, 0, w, 3);
    });
  const bookMs = [bookTex(4), bookTex(4), bookTex(4)].map((t) => lam(0xffffff, { map: t }));
  const shelf = (ax, cx, cz, L, H, D, two) => {
    const geo = new THREE.BoxGeometry(ax === 'x' ? L : D, H, ax === 'x' ? D : L);
    const uv = geo.attributes.uv,
      su = L / 2.4,
      sv = H / 2.2;
    const faces = ax === 'x' ? [4, 5] : [0, 1];
    for (const f of faces)
      for (let i = 0; i < 4; i++) {
        const k = f * 4 + i;
        uv.setXY(k, uv.getX(k) * su, uv.getY(k) * sv);
      }
    const bm = pick(bookMs),
      mats = [wood, wood, wood, wood, wood, wood];
    for (const f of faces) mats[f] = bm;
    const m = new THREE.Mesh(geo, mats);
    m.position.set(cx, H / 2, cz);
    sc.add(m);
    blk.push(m);
    B(ax === 'x' ? L + 0.1 : D + 0.12, 0.12, ax === 'x' ? D + 0.12 : L + 0.1, wood, cx, H + 0.06, cz);
    push({
      x1: cx - (ax === 'x' ? L : D) / 2 - 0.05,
      x2: cx + (ax === 'x' ? L : D) / 2 + 0.05,
      z1: cz - (ax === 'x' ? D : L) / 2 - 0.05,
      z2: cz + (ax === 'x' ? D : L) / 2 + 0.05,
    });
  };
  // wall bays all the way round, with department signs above
  const depSign = (t, x, z, ry, w = 5) => {
    const tt = textTex(512, 96, (g, W2, H) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, W2, H);
      g.strokeStyle = '#c9b48a';
      g.lineWidth = 4;
      g.strokeRect(8, 8, W2 - 16, H - 16);
      g.fillStyle = '#efe6d2';
      g.font = '600 50px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '6px';
      } catch (e) {}
      g.fillText(t, W2 / 2, H / 2 + 2);
    });
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, (w * 96) / 512),
      new THREE.MeshBasicMaterial({ map: tt }),
    );
    m.position.set(x, 3.85, z);
    m.rotation.y = ry;
    sc.add(m);
  };
  [
    [-18, 'FICTION'],
    [-10, 'MYSTERY'],
    [-2.8, 'NEW RELEASES'],
  ].forEach(([x, t]) => depSign(t, x, M.z1 + 0.32, 0));
  for (let x = -21; x < 4; x += 4.2) shelf('x', x + 2, M.z1 + 0.3, 4.1, 3.2, 0.55);
  [
    [-29, 'BIOGRAPHY'],
    [-23, 'HISTORY'],
    [-8, 'SCI-FI & FANTASY'],
    [-3, 'TEEN'],
  ].forEach(([z, t]) => depSign(t, M.x1 + 0.32, z, Math.PI / 2, 4.4));
  for (let z = -33; z < -1.5; z += 4.2) {
    if (z > -20 && z < -13) continue;
    shelf('z', M.x1 + 0.3, z + 2, 4.1, 3.2, 0.55);
  }
  depSign('GAMES & PUZZLES', M.x2 - 0.32, -2.6, -Math.PI / 2, 4.4);
  shelf('z', M.x2 - 0.3, -2.6, 4.1, 3.2, 0.55);
  // freestanding double-sided rows
  for (const z of [-30, -26.4, -22.8]) shelf('x', -12.5, z, 12, 1.7, 0.9, true);
  for (const z of [-11.2, -7.6, -4]) shelf('x', -12.5, z, 12, 1.7, 0.9, true);
  for (const z of [-11.4, -7.8]) shelf('x', 8.5, z, 6, 1.7, 0.9, true);
  // columns
  for (const [x, z] of [
    [-5, -26],
    [5, -26],
    [-5, -8],
    [5, -8],
  ]) {
    B(1, H2, 1, cream, x, H2 / 2, z, 0, 1);
    push({ x1: x - 0.5, x2: x + 0.5, z1: z - 0.5, z2: z + 0.5, y0: 0, y1: H2 });
    B(1.2, 0.3, 1.2, woodL, x, 0.15, z);
    B(1.2, 0.25, 1.2, cream, x, L2 - 0.75, z);
  }
  // display tables with face-out books
  const cover = () => {
    const c = new THREE.Color().setHSL(
      Math.random(),
      0.45 + Math.random() * 0.3,
      0.32 + Math.random() * 0.35,
    );
    return lam(c.getHex());
  };
  const stacks = (cx, cz, r, top, n) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + 0.3,
        rr = r * 0.55;
      const h = 0.1 + Math.floor(Math.random() * 4) * 0.045;
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.32, h, 0.44), cover());
      b.position.set(cx + Math.cos(a) * rr, top + h / 2, cz + Math.sin(a) * rr);
      b.rotation.y = a + Math.PI / 2;
      sc.add(b);
      if (Math.random() < 0.5) {
        const e = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.05), cover());
        e.position.set(cx + Math.cos(a) * rr * 0.45, top + 0.21, cz + Math.sin(a) * rr * 0.45);
        e.rotation.set(-0.25, a + Math.PI / 2, 0);
        sc.add(e);
      }
    }
  };
  const roundTable = (x, z, r) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 28), wood);
    t.position.set(x, 0.86, z);
    sc.add(t);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.82, 10), wood);
    p.position.set(x, 0.41, z);
    sc.add(p);
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.08, 14), wood);
    f.position.set(x, 0.04, z);
    sc.add(f);
    stacks(x, z, r, 0.9, 8);
    push({ x1: x - r, x2: x + r, z1: z - r, z2: z + r });
  };
  const sqTable = (x, z, w, d, sign) => {
    B(w, 0.06, d, wood, x, 0.82, z);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) B(0.08, 0.8, 0.08, wood, x + sx * (w / 2 - 0.1), 0.4, z + sz * (d / 2 - 0.1));
    B(w - 0.2, 0.05, d - 0.2, wood, x, 0.25, z);
    stacks(x, z, Math.min(w, d) * 0.9, 0.85, 6);
    push({ x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2 });
    if (sign) {
      const st = textTex(256, 192, (g, W2, H) => {
        g.fillStyle = '#f4efe3';
        g.fillRect(0, 0, W2, H);
        g.fillStyle = '#24382c';
        g.fillRect(0, 0, W2, 44);
        g.fillStyle = '#efe6d2';
        g.font = '700 28px Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.fillText(sign[0], W2 / 2, 31);
        g.fillStyle = '#24382c';
        g.font = '600 34px "Cormorant Garamond", Georgia, serif';
        g.fillText(sign[1], W2 / 2, 110);
        g.font = '600 26px Overpass, Arial, sans-serif';
        g.fillStyle = '#9a4a2c';
        g.fillText(sign[2], W2 / 2, 158);
      });
      B(0.04, 0.5, 0.04, dark, x, 1.13, z);
      const sp = signPlane(st, 0.6, 0.45);
      sp.position.set(x, 1.55, z);
      sc.add(sp);
    }
  };
  roundTable(0, -24, 1.4);
  roundTable(0, -9.5, 1.4);
  sqTable(-7.5, -17, 2.2, 1.3, ['BESTSELLERS', 'Top 20', '20% off']);
  sqTable(-13, -17, 2.2, 1.3, ['STAFF PICKS', 'Read these', 'next']);
  sqTable(-18.5, -17, 2.2, 1.3, ['NEW', 'Hardcovers', 'This week']);
  sqTable(4.4, -21, 1.8, 1.2, ['GIFTS', 'Journals &', 'bookmarks']);
  sqTable(4.4, -12.5, 1.8, 1.2, ['BOOK CLUB', 'This month', 'Buy 2 get 1']);
  // café, northeast corner
  {
    const cx1 = 7,
      cz1 = -33.8;
    flat(
      6.5,
      21.8,
      -33.8,
      -20.5,
      0.008,
      decal(
        lam(0xffffff, {
          map: tex(64, 64, (g, w, h) => {
            g.fillStyle = '#8a6a48';
            g.fillRect(0, 0, w, h);
            for (let y = 0; y < h; y += 8) {
              g.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.12})`;
              g.fillRect(0, y, w, 1);
              g.fillRect((y * 13) % w, y, 1, 8);
            }
          }),
        }),
        1,
      ),
      1.6,
      sc,
    );
    B(0.15, 1, 13.2, woodL, 6.5, 0.5, -27.15, 1); // half wall separating the café
    B(0.25, 0.06, 13.2, wood, 6.5, 1.03, -27.15);
    // counter along the north wall
    B(11, 1.05, 1, wood, 15.8, 0.52, -31.4, 1, 1);
    B(11.2, 0.06, 1.15, lam(0x2b2b2b), 15.8, 1.07, -31.4);
    const steel = new THREE.MeshPhongMaterial({ color: 0xc4c8cc, specular: 0xffffff, shininess: 60 });
    B(1.4, 0.7, 0.6, steel, 18.6, 1.45, -33.2);
    for (const x of [18.2, 19]) B(0.1, 0.12, 0.1, dark, x, 1.12, -32.9);
    B(0.5, 0.6, 0.5, dark, 16.8, 1.4, -33.3);
    B(0.3, 0.5, 0.3, dark, 15.9, 1.35, -33.3);
    const pc = new THREE.MeshPhongMaterial({
      color: 0xcfe6f2,
      transparent: true,
      opacity: 0.35,
      specular: 0xffffff,
      shininess: 100,
    });
    B(3, 0.8, 0.9, pc, 12.6, 1.5, -31.4);
    B(3, 0.04, 0.9, steel, 12.6, 1.2, -31.4);
    for (let k = 0; k < 10; k++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 6),
        lam(pick([0xc98a3a, 0xd9a45a, 0x6b3a22, 0xe8d8b0, 0xb84a7a])),
      );
      p.position.set(11.4 + (k % 5) * 0.6, 1.3 + (k > 4 ? 0.32 : 0), -31.4);
      p.scale.y = 0.7;
      sc.add(p);
    }
    for (const x of [10.6, 21]) B(0.5, 0.4, 0.5, dark, x, 1.3, -31.4);
    B(10.6, 3.2, 0.3, lam(0x2c2622), 15.8, 2.7, -33.85);
    const menu = textTex(1024, 256, (g, w, h) => {
      g.fillStyle = '#1f1b18';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8dcc0';
      g.font = '600 70px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      try {
        g.letterSpacing = '12px';
      } catch (e) {}
      g.fillText('CAFÉ', w / 2, 76);
      try {
        g.letterSpacing = '0px';
      } catch (e) {}
      const items = [
        ['Latte', '$4.95'],
        ['Cold brew', '$4.25'],
        ['Hot cocoa', '$3.75'],
        ['Chai', '$4.45'],
        ['Croissant', '$3.50'],
        ['Cheesecake', '$6.95'],
      ];
      g.font = '600 32px Overpass, Arial, sans-serif';
      items.forEach(([n, p], k) => {
        const col = k % 3,
          row = (k / 3) | 0,
          x = 110 + col * 320,
          y = 140 + row * 62;
        g.textAlign = 'left';
        g.fillStyle = '#e9e3d6';
        g.fillText(n, x, y);
        g.textAlign = 'right';
        g.fillStyle = '#d9a45a';
        g.fillText(p, x + 250, y);
      });
    });
    const mm = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: menu }));
    mm.position.set(15.8, 3.95, -33.69);
    sc.add(mm);
    for (const x of [11, 14, 17, 20]) {
      const pl = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.35, 16, 1, true), brass);
      pl.position.set(x, 3.3, -31.4);
      sc.add(pl);
      B(0.02, 1.5, 0.02, dark, x, 4.2, -31.4);
    }
    // baristas
    for (const x of [14.5, 17.6]) {
      const h = human({
        skin: pick(SKINS),
        shirt: '#1f1d1b',
        pants: '#2b2f3a',
        shoe: '#1b1b1b',
        hair: pick(['#1b1410', '#3a2a1e', '#c9a46a']),
      });
      const ap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.02), lam(0x24382c));
      ap.position.set(0, 1.05, 0.15);
      h.g.add(ap);
      sc.add(h.g);
      npcs.push({ h, ax: 'x', c: -32.6, a: x - 1, b: x + 1, y: 0, t: x, dir: 1, spd: 0.5, face: 'S' });
    }
    // tables
    const chairM = lam(0x3b2a1e);
    const seats = [];
    for (const [x, z] of [
      [9, -28.6],
      [12.4, -28.6],
      [15.8, -28.6],
      [19.2, -28.6],
      [9, -24.6],
      [12.4, -24.6],
      [15.8, -24.6],
      [19.2, -24.6],
      [10.6, -21.6],
      [17.6, -21.6],
    ]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 20), lam(0x2b2b2b));
      t.position.set(x, 0.76, z);
      sc.add(t);
      B(0.08, 0.74, 0.08, dark, x, 0.37, z);
      for (const dx of [-0.8, 0.8]) {
        B(0.42, 0.06, 0.42, chairM, x + dx, 0.46, z);
        B(0.06, 0.5, 0.42, chairM, x + dx * 1.25, 0.72, z);
      }
      push({ x1: x - 1.15, x2: x + 1.15, z1: z - 0.6, z2: z + 0.6 });
      for (const dx of [-0.8, 0.8])
        if (Math.random() < 0.55) {
          seats.push([x + dx, z, dx]);
        }
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.11, 12), white);
      cup.position.set(x + rand(-0.2, 0.2), 0.84, z + rand(-0.15, 0.15));
      sc.add(cup);
      if (Math.random() < 0.7) {
        const bk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.42), cover());
        bk.position.set(x + rand(-0.2, 0.2), 0.805, z + rand(-0.15, 0.15));
        bk.rotation.y = rand(0, 3);
        sc.add(bk);
      }
    }
    for (const [x, z, dx] of seats) {
      const h = human({
        skin: pick(SKINS),
        shirt: pick(SHIRTS),
        pants: pick(PANTS),
        shoe: pick(['#e9e9e6', '#1b1b1b']),
        hair: pick(['#1b1410', '#3a2a1e', '#6b4a2a', '#c9a46a']),
      });
      h.g.position.set(x, -0.38, z);
      h.g.rotation.y = dx < 0 ? Math.PI / 2 : -Math.PI / 2;
      h.legL.rotation.x = h.legR.rotation.x = -1.45;
      h.armL.rotation.x = -0.9;
      h.armR.rotation.x = -0.6;
      sc.add(h.g);
    }
    const cs = textTex(512, 96, (g, w, h) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#efe6d2';
      g.font = '600 56px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '10px';
      } catch (e) {}
      g.fillText('CAFÉ', w / 2, h / 2 + 2);
    });
    const csP = signPlane(cs, 2.6, 0.5);
    csP.position.set(6.5, 2.4, -24);
    csP.rotation.y = Math.PI / 2;
    sc.add(csP);
    B(0.04, 1.3, 0.04, dark, 6.5, 1.7, -24);
  }
  // checkout, southeast
  {
    B(9, 1.05, 0.9, wood, 14, 0.52, -5.2, 1, 1);
    B(9.2, 0.06, 1.05, lam(0x2b2b2b), 14, 1.07, -5.2);
    for (const x of [10.6, 14, 17.4]) {
      B(0.45, 0.3, 0.4, dark, x, 1.25, -5.2);
      B(0.04, 0.3, 0.32, new THREE.MeshBasicMaterial({ color: 0x7fd1ff }), x, 1.42, -4.98);
      const h = human({
        skin: pick(SKINS),
        shirt: '#24382c',
        pants: '#2b2f3a',
        shoe: '#1b1b1b',
        hair: pick(['#1b1410', '#3a2a1e', '#6b4a2a']),
      });
      h.g.position.set(x, 0, -6.2);
      sc.add(h.g);
    }
    for (let k = 0; k < 5; k++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.2), cover());
      b.position.set(10 + k * 2, 1.3, -4.85);
      b.rotation.x = -0.2;
      sc.add(b);
    }
    for (let k = 0; k < 4; k++) {
      const x = 8.6 - k * 1.3;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 10), brass);
      p.position.set(x, 0.48, -3.4);
      sc.add(p);
      const bse = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 14), brass);
      bse.position.set(x, 0.02, -3.4);
      sc.add(bse);
    }
    B(3.9, 0.06, 0.04, lam(0x7a2430), 6.65, 0.85, -3.4);
    push({ x1: 4.6, x2: 8.7, z1: -3.5, z2: -3.3 });
    for (let q = 0; q < 2; q++) {
      const h = human({
        skin: pick(SKINS),
        shirt: pick(SHIRTS),
        pants: pick(PANTS),
        shoe: pick(['#e9e9e6', '#1b1b1b']),
        hair: pick(['#1b1410', '#6b4a2a', '#c9a46a']),
      });
      h.g.position.set(14 + q * 0.1, 0, -3.9 - q * 0.9);
      h.g.rotation.y = Math.PI;
      sc.add(h.g);
    }
    const ck = textTex(512, 96, (g, w, h) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#efe6d2';
      g.font = '700 46px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '10px';
      } catch (e) {}
      g.fillText('CHECKOUT', w / 2, h / 2 + 2);
    });
    const ckP = signPlane(ck, 3.2, 0.6);
    ckP.position.set(14, 3.2, -5.2);
    sc.add(ckP);
    for (const x of [12.7, 15.3]) B(0.02, 1.4, 0.02, dark, x, 4.25, -5.2);
  }
  // browsers
  const mkH1 = () =>
    human({
      skin: pick(SKINS),
      shirt: pick(SHIRTS),
      pants: pick(PANTS),
      shoe: pick(['#e9e9e6', '#1b1b1b']),
      hair: pick(['#1b1410', '#3a2a1e', '#6b4a2a', '#c9a46a']),
    });
  for (const p of [
    { ax: 'z', c: 1.6, a: -32, b: -2 },
    { ax: 'z', c: -1.6, a: -32, b: -2 },
    { ax: 'x', c: -15.4, a: -20, b: 4 },
    { ax: 'x', c: -18.6, a: -20, b: 17 },
    { ax: 'x', c: -28.2, a: -19, b: -7 },
    { ax: 'x', c: -9.4, a: -19, b: -7 },
    { ax: 'z', c: -20, a: -30, b: -4 },
    { ax: 'x', c: -13.6, a: 3, b: 12 },
  ]) {
    const h = mkH1();
    sc.add(h.g);
    npcs.push({ h, ...p, y: 0, t: rand(p.a, p.b), dir: Math.random() < 0.5 ? 1 : -1, spd: rand(0.6, 1.1) });
  }

  // ---------- level-1 ceiling: the underside of the level-2 floor, with downlights ----------
  sc = root;
  const slabM = lam(0xf3efe6),
    lm = new THREE.MeshBasicMaterial({ color: 0xfffbf0 });
  for (const [x1, x2, z1, z2] of FLOOR2)
    B(x2 - x1, 0.5, Math.min(z2, 0) - z1, slabM, (x1 + x2) / 2, L2 - 0.25, (z1 + Math.min(z2, 0)) / 2);
  const inF2 = (x, z) => FLOOR2.some(([x1, x2, z1, z2]) => x > x1 && x < x2 && z > z1 && z < z2);
  for (let x = -19; x <= 19; x += 4.75)
    for (let z = -31; z <= -3; z += 4.65) if (inF2(x, z)) B(1.1, 0.04, 1.1, lm, x, L2 - 0.52, z);
  // brass chandelier hanging through the atrium
  {
    const chand = new THREE.Group();
    chand.position.set(0, 3.9, -17);
    root.add(chand);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.05, 8, 32), brass);
    ring.rotation.x = Math.PI / 2;
    chand.add(ring);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), lm);
      b.position.set(Math.cos(a) * 1.4, 0.08, Math.sin(a) * 1.4);
      chand.add(b);
    }
    B(0.03, H2 - 4, 0.03, brass, 0, 3.9 + (H2 - 4) / 2, -17);
    const pl = new THREE.PointLight(0xffe2b0, 0.4, 18);
    pl.position.set(0, 3.6, -17);
    root.add(pl);
  }

  // ---------- staircase along the east wall ----------
  {
    const n = 22,
      run = (ST.zb - ST.zt) / n,
      rise = L2 / n,
      treadM = lam(0x6a4a30),
      riserM = lam(0xf1ebde);
    for (let i = 0; i < n; i++) {
      const top = (i + 1) * rise,
        z = ST.zb - (i + 0.5) * run;
      B(ST.x2 - ST.x1, top, run, riserM, (ST.x1 + ST.x2) / 2, top / 2, z);
      B(ST.x2 - ST.x1, 0.04, run + 0.02, treadM, (ST.x1 + ST.x2) / 2, top + 0.02, z);
    }
    // the stair body blocks walking underneath it; each 1 m slice blocks below its lowest step
    for (let z = ST.zb; z > ST.zt; z -= 1) {
      // lowest step height in this slice, less the 0.6 m the player can step up
      const lo = (L2 * (ST.zb - z)) / (ST.zb - ST.zt) - 0.6;
      if (lo > 0.1) push({ x1: ST.x1, x2: ST.x2, z1: z - 1, z2: z, y0: -2, y1: lo });
    }
    // glass balustrade on the open (west) side, full height so nobody steps off or under
    const len = Math.hypot(ST.zb - ST.zt, L2),
      ang = Math.atan2(L2, ST.zb - ST.zt);
    const gl = new THREE.MeshPhongMaterial({
      color: 0xcfe6f2,
      transparent: true,
      opacity: 0.3,
      specular: 0xffffff,
      shininess: 100,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pane = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1, len), gl);
    pane.position.set(ST.x1 - 0.02, L2 / 2 + 0.55, (ST.zb + ST.zt) / 2);
    pane.rotation.x = ang;
    root.add(pane);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, len + 0.3), brass);
    rail.position.set(ST.x1 - 0.02, L2 / 2 + 1.07, (ST.zb + ST.zt) / 2);
    rail.rotation.x = ang;
    root.add(rail);
    push({ x1: ST.x1 - 0.12, x2: ST.x1, z1: ST.zt, z2: ST.zb, y0: -2, y1: H2 });
    // level-2 guard where the stairwell meets the front floor plate
    push({ x1: ST.x1, x2: ST.x2, z1: ST.zb - 0.06, z2: ST.zb + 0.06, y0: L2 - 0.2, y1: L2 + 1.3 });
    B(ST.x2 - ST.x1, 1, 0.04, gl, (ST.x1 + ST.x2) / 2, L2 + 0.5, ST.zb);
    B(ST.x2 - ST.x1, 0.06, 0.08, brass, (ST.x1 + ST.x2) / 2, L2 + 1.03, ST.zb);
    const sT = textTex(512, 96, (g, W2, H) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, W2, H);
      g.fillStyle = '#efe6d2';
      g.font = '600 46px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '5px';
      } catch (e) {}
      g.fillText('▲ LEVEL 2 · KIDS · CAFÉ VIEW', W2 / 2, H / 2 + 2);
    });
    const sp = signPlane(sT, 2.6, 0.48);
    sp.position.set(20.6, 3.0, -5.6);
    root.add(sp);
    B(0.03, 1.8, 0.03, dark, 20.6, 4.1, -5.6);
  }

  // ---------- level-2 floor, atrium railings, roof ----------
  sc = g2;
  band = [L2 - 0.5, H2];
  const carp2 = lam(0xffffff, { map: carpT });
  for (const [x1, x2, z1, z2] of FLOOR2) flat(x1, x2, z1, Math.min(z2, 0), 0.01, carp2, 2, g2);
  walk(-2.6, 2.6, -33.5, -24.6);
  walk(-21.5, -6.6, -19.6, -14.4);
  walk(6.6, 18.8, -19.6, -14.4);
  walk(-21.5, 21.5, -6.6, -2);
  {
    const gl = new THREE.MeshPhongMaterial({
      color: 0xcfe6f2,
      transparent: true,
      opacity: 0.28,
      specular: 0xffffff,
      shininess: 100,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const railSeg = (x1, x2, z1, z2) => {
      const cx = (x1 + x2) / 2,
        cz = (z1 + z2) / 2,
        w = Math.max(x2 - x1, 0.04),
        d = Math.max(z2 - z1, 0.04);
      B(w, 1, d, gl, cx, 0.5, cz);
      B(w + 0.04, 0.07, d + 0.04, brass, cx, 1.04, cz);
      push({ x1: x1 - 0.06, x2: x2 + 0.06, z1: z1 - 0.06, z2: z2 + 0.06, y0: L2 - 0.2, y1: L2 + 1.3 });
    };
    railSeg(-6, 6, -24, -24);
    railSeg(-6, 6, -10, -10);
    railSeg(-6, -6, -24, -10);
    railSeg(6, 6, -24, -10);
    // slab edge facing the atrium
    for (const [w, d, x, z] of [
      [12, 0.5, 0, -24],
      [12, 0.5, 0, -10],
      [0.5, 14, -6, -17],
      [0.5, 14, 6, -17],
    ])
      B(w, 0.5, d, woodL, x, -0.25, z);
  }
  // roof with downlights
  {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(44, 34).rotateX(Math.PI / 2), lam(0xf3efe6));
    c.position.set(0, H2 - L2, -17);
    g2.add(c);
    for (let x = -18; x <= 18; x += 6)
      for (let z = -30; z <= -4; z += 6.5) B(1.4, 0.05, 1.4, lm, x, H2 - L2 - 0.03, z);
    for (let x = -21; x <= 21; x += 6) B(0.25, 0.35, 34, cream, x, H2 - L2 - 0.18, -17);
    for (const [x, z] of [
      [-12, -22],
      [12, -12],
    ]) {
      const pl = new THREE.PointLight(0xffe6c2, 0.38, 24);
      pl.position.set(x, 4.2, z);
      g2.add(pl);
    }
  }

  // ---------- outer walls, two storeys, with level-2 windows looking out over Dallas ----------
  sc = root;
  const wallM = lam(0xe8e0cf);
  B(44.4, H2, 0.2, wallM, 0, H2 / 2, M.z1 - 0.1, 0, 1);
  B(0.2, H2, 34.6, wallM, M.x1 - 0.1, H2 / 2, -17.3, 0, 1);
  B(0.2, H2, 34.6, wallM, M.x2 + 0.1, H2 / 2, -17.3, 0, 1);
  push({ x1: M.x1 - 0.3, x2: M.x1, z1: M.z1 - 0.3, z2: 0.6, y0: -2, y1: H2 });
  push({ x1: M.x2, x2: M.x2 + 0.3, z1: M.z1 - 0.3, z2: 0.6, y0: -2, y1: H2 });
  push({ x1: M.x1 - 0.3, x2: M.x2 + 0.3, z1: M.z1 - 0.3, z2: M.z1, y0: -2, y1: H2 });
  {
    const view = (seed) =>
      tex(
        512,
        256,
        (g, w, h) => {
          const sky = g.createLinearGradient(0, 0, 0, h * 0.7);
          sky.addColorStop(0, '#7fa9d6');
          sky.addColorStop(1, '#efd9b4');
          g.fillStyle = sky;
          g.fillRect(0, 0, w, h);
          let x = 0;
          let s = seed;
          const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
          while (x < w) {
            const bw = 24 + rnd() * 60,
              bh = 40 + rnd() * 120;
            g.fillStyle = rnd() < 0.5 ? '#8fa6b8' : rnd() < 0.5 ? '#b7b2a6' : '#7d8e9c';
            g.fillRect(x, h * 0.72 - bh, bw - 4, bh);
            g.fillStyle = 'rgba(255,255,255,.25)';
            for (let yy = h * 0.72 - bh + 6; yy < h * 0.72 - 6; yy += 9) g.fillRect(x + 4, yy, bw - 12, 3);
            x += bw;
          }
          g.fillStyle = '#4f6a3a';
          for (let i = 0; i < 40; i++) {
            g.beginPath();
            g.arc(rnd() * w, h * 0.74, 8 + rnd() * 10, 0, 7);
            g.fill();
          }
          g.fillStyle = '#5a5c60';
          g.fillRect(0, h * 0.76, w, h * 0.24);
          g.fillStyle = '#e8e7e0';
          for (let xx = 10; xx < w; xx += 22) g.fillRect(xx, h * 0.82, 2, h * 0.12);
          for (let i = 0; i < 26; i++) {
            g.fillStyle = pick(['#f4f4f2', '#1c1d20', '#8f1d22', '#1f3f73', '#c9ccd0', '#55595e']);
            g.fillRect(rnd() * w, h * (0.84 + rnd() * 0.1), 12, 6);
          }
        },
        false,
      );
    const frameM = lam(0x3b2a1e);
    const windowRow = (axis, fixed, from, to, face, seed) => {
      const W1 = 3.2,
        gap = 0.9,
        y0 = L2 + 1.9,
        h = 2.6,
        vm = new THREE.MeshBasicMaterial({ map: view(seed), fog: false });
      for (let p = from + gap; p + W1 <= to - gap + 0.01; p += W1 + gap) {
        const c = p + W1 / 2;
        const v = new THREE.Mesh(new THREE.PlaneGeometry(W1, h), vm);
        if (axis === 'z') v.position.set(fixed + face * 0.02, y0 + h / 2, c);
        else v.position.set(c, y0 + h / 2, fixed + face * 0.02);
        v.rotation.y = axis === 'z' ? (face > 0 ? Math.PI / 2 : -Math.PI / 2) : face > 0 ? 0 : Math.PI;
        root.add(v);
        const fr = (w, hh, d, x, y, z) => B(w, hh, d, frameM, x, y, z);
        if (axis === 'z') {
          fr(0.12, h + 0.2, 0.12, fixed + face * 0.06, y0 + h / 2, p);
          fr(0.12, h + 0.2, 0.12, fixed + face * 0.06, y0 + h / 2, p + W1);
          fr(0.08, 0.08, W1, fixed + face * 0.06, y0 + h / 2 + 0.2, c);
          fr(0.12, 0.12, W1 + 0.2, fixed + face * 0.06, y0 + h + 0.06, c);
          fr(0.3, 0.08, W1 + 0.3, fixed + face * 0.15, y0 - 0.04, c);
        } else {
          fr(0.12, h + 0.2, 0.12, p, y0 + h / 2, fixed + face * 0.06);
          fr(0.12, h + 0.2, 0.12, p + W1, y0 + h / 2, fixed + face * 0.06);
          fr(W1, 0.08, 0.08, c, y0 + h / 2 + 0.2, fixed + face * 0.06);
          fr(W1 + 0.2, 0.12, 0.12, c, y0 + h + 0.06, fixed + face * 0.06);
          fr(W1 + 0.3, 0.08, 0.3, c, y0 - 0.04, fixed + face * 0.15);
        }
      }
    };
    windowRow('x', M.z1, -21, 21, 1, 7); // north wall, looking toward Alpha Rd
    windowRow('z', M.x1, -33, -1, 1, 19); // west wall, toward the Tollway
    windowRow('z', M.x2, -33.5, -19.5, -1, 31); // east wall above the stair top
  }

  // ---------- level-2 books: low shelves under the windows, rows, a kids' corner, reading chairs ----------
  sc = g2;
  const lowShelf = (ax, cx, cz, L) => {
    shelf(ax, cx, cz, L, 1.6, 0.55);
  };
  for (let x = -20.5; x < 20; x += 4.2) if (Math.abs(x + 2) > 2.8) lowShelf('x', x + 2, M.z1 + 0.3, 4.1);
  for (let z = -33; z < -1.5; z += 4.2) lowShelf('z', M.x1 + 0.3, z + 2, 4.1);
  [
    [-17, 'COOKING'],
    [-8, 'TRAVEL'],
    [8, 'ART & DESIGN'],
    [17, 'POETRY'],
  ].forEach(([x, t]) => depSign(t, x, M.z1 + 0.32, 0));
  [
    [-29, 'SCIENCE'],
    [-17, 'PHILOSOPHY'],
    [-5, 'MAGAZINES'],
  ].forEach(([z, t]) => depSign(t, M.x1 + 0.32, z, Math.PI / 2, 4.4));
  for (const z of [-30.2, -27]) {
    shelf('x', -13, z, 10, 1.7, 0.9, true);
    shelf('x', 13, z, 10, 1.7, 0.9, true);
  }
  for (const x of [-18.5, -14.8, -11.1]) shelf('z', x, -17, 9, 1.7, 0.9, true);
  // kids' corner on the east strip: low colourful shelves, small tables, a rug
  {
    const rugT = tex(128, 128, (g, w, h) => {
      g.fillStyle = '#e8c35a';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#3d7fb8';
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.arc(w / 2, h / 2, 60 - i * 10, 0, 7);
        g.fill();
        g.fillStyle = i % 2 ? '#3d7fb8' : '#e8c35a';
      }
    });
    flat(9, 16, -22.5, -12, 0.02, decal(lam(0xffffff, { map: rugT }), 3), 0, g2);
    const kidsCol = [0xe85d4a, 0x3d7fb8, 0x5fb36b, 0xe8c35a, 0x9b6bc4];
    for (let k = 0; k < 5; k++) {
      const x = 7 + k * 2.4;
      B(2.2, 1.1, 0.5, lam(kidsCol[k]), x, 0.55, -23.4, 1);
      for (let q = 0; q < 8; q++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.04), lam(pick(kidsCol)));
        b.position.set(x - 0.9 + q * 0.25, 1.25, -23.4);
        b.rotation.x = -0.15;
        g2.add(b);
      }
    }
    for (const [x, z] of [
      [11, -16.5],
      [14.5, -16.5],
    ]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 20), lam(0xf1ebde));
      t.position.set(x, 0.5, z);
      g2.add(t);
      B(0.08, 0.48, 0.08, wood, x, 0.24, z);
      push({ x1: x - 0.65, x2: x + 0.65, z1: z - 0.65, z2: z + 0.65 });
      for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 12), lam(pick(kidsCol)));
        s.position.set(x + Math.cos(a) * 0.9, 0.15, z + Math.sin(a) * 0.9);
        g2.add(s);
      }
    }
    depSign('KIDS', 12, -23.9, 0, 3.2);
  }
  // reading nook by the front windows: armchairs and side tables
  {
    const chairM = lam(0x7a2430);
    for (const [x, z, r] of [
      [-15, -4.2, Math.PI],
      [-12.5, -4.2, Math.PI],
      [12.5, -4.2, Math.PI],
      [15, -4.2, Math.PI],
    ]) {
      B(0.9, 0.45, 0.85, chairM, x, 0.23, z);
      B(0.9, 0.6, 0.18, chairM, x, 0.7, z - 0.35 * Math.cos(r));
      for (const s of [-1, 1]) B(0.16, 0.25, 0.85, chairM, x + s * 0.4, 0.55, z);
      push({ x1: x - 0.5, x2: x + 0.5, z1: z - 0.5, z2: z + 0.5 });
    }
    for (const x of [-13.75, 13.75]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), wood);
      t.position.set(x, 0.55, -4.2);
      g2.add(t);
      B(0.06, 0.53, 0.06, dark, x, 0.27, -4.2);
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 14, 1, true), brass);
      lamp.position.set(x, 1.0, -4.2);
      g2.add(lamp);
      B(0.02, 0.4, 0.02, brass, x, 0.75, -4.2);
    }
  }
  // welcome sign facing the upper-walkway entrances
  {
    const wT = textTex(1024, 128, (g, W2, H) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, W2, H);
      g.fillStyle = '#efe6d2';
      g.font = '600 60px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '8px';
      } catch (e) {}
      g.fillText('BARNES & NOBLE · LEVEL 2', W2 / 2, H / 2 + 3);
    });
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.88), new THREE.MeshBasicMaterial({ map: wT }));
    ws.position.set(0, 3.3, -0.35);
    ws.rotation.y = Math.PI;
    g2.add(ws);
  }
  // level-2 browsers
  for (const p of [
    { ax: 'z', c: 1.6, a: -33, b: -25 },
    { ax: 'x', c: -16.8, a: -21, b: -7 },
    { ax: 'x', c: -2.8, a: -20, b: 18 },
    { ax: 'z', c: -9.4, a: -24, b: -11 },
    { ax: 'x', c: -28.6, a: -20, b: 20 },
  ]) {
    const h = mkH1();
    g2.add(h.g);
    npcs.push({ h, ...p, y: 0, t: rand(p.a, p.b), dir: Math.random() < 0.5 ? 1 : -1, spd: rand(0.5, 0.9) });
  }
  for (const [x, z, r] of [
    [-16.5, -32.6, 0],
    [-9.4, -26.4, Math.PI],
    [-19.8, -21, Math.PI / 2],
    [12.5, -4.2, 0],
  ]) {
    const h = mkH1();
    h.g.position.set(x, 0, z);
    h.g.rotation.y = r;
    if (x === 12.5) {
      h.g.position.y = -0.3;
      h.legL.rotation.x = h.legR.rotation.x = -1.45;
      h.armL.rotation.x = h.armR.rotation.x = -0.9;
    } else h.armR.rotation.x = -0.8;
    g2.add(h.g);
  }

  // ---------- floors, labels ----------
  const inR = (x, z, [x1, x2, z1, z2]) => x >= x1 && x <= x2 && z >= z1 && z <= z2;
  const floorsAt = (x, wz) => {
    const z = wz - BZ,
      out = [];
    if (z > 0.6 || x < M.x1 - 0.5 || x > M.x2 + 0.5) return out;
    out.push(0);
    for (const r of FLOOR2) if (inR(x, z, r)) out.push(L2);
    if (x >= ST.x1 - 0.05 && x <= ST.x2 && z <= ST.zb + 0.3 && z >= ST.zt - 0.05)
      out.push(L2 * clamp((ST.zb - z) / (ST.zb - ST.zt), 0, 1));
    return out;
  };
  const labelAt = (p) => {
    const z = p.z - BZ;
    if (p.y > 4) {
      if (p.x > 6 && z < -12 && z > -24) return ['Barnes & Noble · Level 2', 'Kids', 'Galleria Dallas'];
      if (z > -7)
        return ['Barnes & Noble · Level 2', 'Reading nook · upper walkway entrances', 'Galleria Dallas'];
      return ['Barnes & Noble · Level 2', 'Books · window views', 'Galleria Dallas'];
    }
    if (p.y > 0.4 && p.x > ST.x1 - 0.1) return ['Barnes & Noble', 'Staircase to level 2', 'Galleria Dallas'];
    if (p.x > 6.5 && z < -20.5) return ['Barnes & Noble · Café', 'Seated café', 'Galleria Dallas'];
    if (p.x > 4 && z > -7.5) return ['Barnes & Noble', 'Checkout · stairs to level 2', 'Galleria Dallas'];
    return ['Barnes & Noble', 'Books · Level 1', 'Galleria Dallas'];
  };
  Object.assign(ctx, { bnFloorsAt: floorsAt, bnLabelAt: labelAt, BN: { ...M, BZ, L2, H2, ST, FLOOR2 } });
}
