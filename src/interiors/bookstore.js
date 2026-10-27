// Barnes & Noble interior.
import * as THREE from 'three';
import { decal, lam, pick, rand, speckle, tex } from '../core/helpers.js';
import { flat } from '../core/materials.js';
import { signPlane, textTex } from '../world/signals.js';
import { marker } from '../world/mall-exterior.js';
import { PANTS, SHIRTS, SKINS, human } from '../life/people.js';

/* ---------- Barnes & Noble: bookstore anchor off the Galleria's north end ---------- */
function buildBookstore() {
  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0x111111);
  const M = { x1: -22, x2: 22, z1: -34, z2: 0, h: 7 },
    blk = [],
    sol = [],
    npcs = [];
  sc.add(new THREE.AmbientLight(0xffffff, 0.46));
  sc.add(new THREE.HemisphereLight(0xfff6e6, 0x6b5a44, 0.42));
  const dl = new THREE.DirectionalLight(0xfff0d8, 0.3);
  dl.position.set(-6, 10, 8);
  sc.add(dl);
  for (const [x, z] of [
    [-12, -26],
    [12, -26],
    [-12, -9],
    [12, -9],
    [0, -17],
  ]) {
    const pl = new THREE.PointLight(0xffe6c2, 0.3, 22);
    pl.position.set(x, 6, z);
    sc.add(pl);
  }
  const B = (w, h, d, m, x, y, z, solid, block) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    sc.add(b);
    if (solid) sol.push({ x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2 });
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
  // ceiling: coffered panels with downlights
  {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(44, 34).rotateX(Math.PI / 2), lam(0xf3efe6));
    c.position.set(0, M.h, -17);
    sc.add(c);
    const lm = new THREE.MeshBasicMaterial({ color: 0xfffbf0 });
    for (let x = -18; x <= 18; x += 6)
      for (let z = -30; z <= -4; z += 6.5) {
        B(1.4, 0.05, 1.4, lm, x, M.h - 0.03, z);
      }
    for (let x = -21; x <= 21; x += 6) B(0.25, 0.35, 34, cream, x, M.h - 0.18, -17);
    for (let z = -33; z <= -1; z += 6.5) B(44, 0.35, 0.25, cream, 0, M.h - 0.18, z);
    const chand = new THREE.Group();
    chand.position.set(0, M.h - 1.6, -17);
    sc.add(chand);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 8, 32), brass);
    ring.rotation.x = Math.PI / 2;
    chand.add(ring);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), lm);
      b.position.set(Math.cos(a) * 1.1, 0.08, Math.sin(a) * 1.1);
      chand.add(b);
    }
    B(0.03, 1.6, 0.03, brass, 0, M.h - 0.8, -17);
  }
  // walls
  const wallM = lam(0xe8e0cf);
  B(44.4, M.h, 0.2, wallM, 0, M.h / 2, M.z1 - 0.1, 0, 1);
  B(0.2, M.h, 34, wallM, M.x1 - 0.1, M.h / 2, -17, 0, 1);
  B(0.2, M.h, 34, wallM, M.x2 + 0.1, M.h / 2, -17, 0, 1);
  B(20.6, M.h, 0.2, wallM, -11.7, M.h / 2, M.z2 + 0.1, 0, 1);
  B(20.6, M.h, 0.2, wallM, 11.7, M.h / 2, M.z2 + 0.1, 0, 1);
  B(2.8, M.h - 3, 0.2, wallM, 0, 3 + (M.h - 3) / 2, M.z2 + 0.1, 0, 1);
  {
    const gl = new THREE.MeshPhongMaterial({
      color: 0x9fbccc,
      transparent: true,
      opacity: 0.5,
      specular: 0xffffff,
      shininess: 90,
    });
    for (const x of [-0.7, 0.7]) B(1.35, 2.9, 0.06, gl, x, 1.45, M.z2 + 0.02);
    B(2.9, 0.14, 0.26, wood, 0, 2.97, M.z2);
    for (const x of [-1.9, 1.9]) {
      B(0.12, 1.5, 0.5, lam(0xd8d8d6), x, 0.75, -1.2);
      sol.push({ x1: x - 0.1, x2: x + 0.1, z1: -1.45, z2: -0.95 });
    }
    const ex = textTex(256, 96, (g, w, h) => {
      g.fillStyle = '#f4f1ea';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#c7271f';
      g.font = '800 64px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('EXIT', w / 2, h / 2 + 4);
    });
    const es = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.26), new THREE.MeshBasicMaterial({ map: ex }));
    es.position.set(0, 3.4, M.z2 - 0.02);
    es.rotation.y = Math.PI;
    sc.add(es);
  }
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
    sol.push({
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
  [
    [-8.5, 'KIDS'],
    [-3, 'GAMES & PUZZLES'],
  ].forEach(([z, t]) => depSign(t, M.x2 - 0.32, z, -Math.PI / 2, 4.4));
  for (let z = -13; z < -1.5; z += 4.2) shelf('z', M.x2 - 0.3, z + 2, 4.1, 3.2, 0.55);
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
    B(1, M.h, 1, cream, x, M.h / 2, z, 1, 1);
    B(1.2, 0.3, 1.2, woodL, x, 0.15, z);
    B(1.2, 0.25, 1.2, cream, x, M.h - 0.5, z);
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
    sol.push({ x1: x - r, x2: x + r, z1: z - r, z2: z + r });
  };
  const sqTable = (x, z, w, d, sign) => {
    B(w, 0.06, d, wood, x, 0.82, z);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) B(0.08, 0.8, 0.08, wood, x + sx * (w / 2 - 0.1), 0.4, z + sz * (d / 2 - 0.1));
    B(w - 0.2, 0.05, d - 0.2, wood, x, 0.25, z);
    stacks(x, z, Math.min(w, d) * 0.9, 0.85, 6);
    sol.push({ x1: x - w / 2, x2: x + w / 2, z1: z - d / 2, z2: z + d / 2 });
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
      B(0.02, 3.4, 0.02, dark, x, 5.2, -31.4);
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
      sol.push({ x1: x - 1.15, x2: x + 1.15, z1: z - 0.6, z2: z + 0.6 });
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
    B(10, 1.05, 0.9, wood, 14.5, 0.52, -5.2, 1, 1);
    B(10.2, 0.06, 1.05, lam(0x2b2b2b), 14.5, 1.07, -5.2);
    for (const x of [11, 14.5, 18]) {
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
      b.position.set(10 + k * 2.2, 1.3, -4.85);
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
    sol.push({ x1: 4.6, x2: 8.7, z1: -3.5, z2: -3.3 });
    for (let q = 0; q < 2; q++) {
      const h = human({
        skin: pick(SKINS),
        shirt: pick(SHIRTS),
        pants: pick(PANTS),
        shoe: pick(['#e9e9e6', '#1b1b1b']),
        hair: pick(['#1b1410', '#6b4a2a', '#c9a46a']),
      });
      h.g.position.set(14.5 + q * 0.1, 0, -3.9 - q * 0.9);
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
    ckP.position.set(14.5, 3.2, -5.2);
    sc.add(ckP);
    for (const x of [13.2, 15.8]) B(0.02, 3.5, 0.02, dark, x, 5.2, -5.2);
  }
  // browsers
  const mkH = () =>
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
    { ax: 'x', c: -18.6, a: -20, b: 20 },
    { ax: 'x', c: -28.2, a: -19, b: -7 },
    { ax: 'x', c: -9.4, a: -19, b: -7 },
    { ax: 'z', c: -20, a: -30, b: -4 },
    { ax: 'x', c: -13.6, a: 3, b: 12 },
  ]) {
    const h = mkH();
    sc.add(h.g);
    npcs.push({ h, ...p, y: 0, t: rand(p.a, p.b), dir: Math.random() < 0.5 ? 1 : -1, spd: rand(0.6, 1.1) });
  }
  const mk = marker(sc, 0, M.z2 - 0.9);
  return {
    scene: sc,
    RM: M,
    door: { x: 0, z: M.z2 },
    spawn: { x: 0, z: -3.8 },
    blockers: blk,
    solids: sol,
    camMax: 6,
    mark: mk,
    npcs,
    name: 'Barnes & Noble',
    exitText: 'Exit to the mall',
    parent: 'galleria',
    back: { x: 0, z: -63.6, rot: 0 },
    labelAt(p) {
      if (p.x > 6.5 && p.z < -20.5)
        return ['Barnes & Noble · Café', 'Seated café', 'Galleria Dallas · Level 1'];
      if (p.x > 4 && p.z > -7.5) return ['Barnes & Noble', 'Checkout', 'Galleria Dallas · Level 1'];
      return ['Barnes & Noble', 'Books · Level 1', 'Galleria Dallas'];
    },
  };
}

export { buildBookstore };
