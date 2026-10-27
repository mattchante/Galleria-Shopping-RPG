// Galleria interior: two levels, shops, Apple store, ice rink, food court and escalators.
import { P } from '../../player/avatar.js';
import { PANTS, SHIRTS, SKINS, human } from '../../life/people.js';
import { T, flat } from '../../core/materials.js';
import * as THREE from 'three';
import { clamp, decal, lam, pick, rand, speckle, tex } from '../../core/helpers.js';
import { marker } from '../../world/mall-exterior.js';
import { signPlane, textTex } from '../../world/signals.js';
import { buildEscalators } from './escalators.js';
import { buildShops } from './shops.js';
import { buildFoodCourt } from './food-court.js';
import { buildIceRink } from './ice-rink.js';
import { buildAppleStore } from './apple-store.js';
import { buildSephora } from './sephora.js';
import { buildCcrGallery } from './ccr-gallery.js';
import { buildBookstore, BZ } from './bookstore.js';
/* ---------- Galleria interior: two levels under a glass barrel vault ---------- */

function buildGalleria() {
  const ctx = {};
  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0xbcd6ec);
  const W = 12,
    BI = 8,
    L2 = 5.5,
    M = { x1: -W, x2: W, z1: -68, z2: 12, h: 22 },
    blk = [],
    sol = [];
  sc.add(new THREE.AmbientLight(0xffffff, 0.42));
  sc.add(new THREE.HemisphereLight(0xe6f1ff, 0xb9a888, 0.5));
  const dl = new THREE.DirectionalLight(0xfff3dc, 0.5);
  dl.position.set(-4, 20, 6);
  sc.add(dl);
  for (const z of [-56, -32, -8]) {
    const pl = new THREE.PointLight(0xffe9c8, 0.35, 40);
    pl.position.set(0, 9, z);
    sc.add(pl);
  }
  const B = (w, h, d, m, x, y, z, block) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    sc.add(b);
    if (block) blk.push(b);
    return b;
  };
  const S_ = (x1, x2, z1, z2, y0, y1) => sol.push({ x1, x2, z1, z2, y0, y1 });
  const npcs = [],
    mkH = () =>
      human({
        skin: pick(SKINS),
        shirt: pick(SHIRTS),
        pants: pick(PANTS),
        shoe: pick(['#e9e9e6', '#1b1b1b']),
        hair: pick(['#1b1410', '#3a2a1e', '#6b4a2a', '#c9a46a']),
      });
  const floorT = tex(128, 128, (g, w, h) => {
    g.fillStyle = '#ece5d8';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e1d6c3';
    g.fillRect(0, 0, 64, 64);
    g.fillRect(64, 64, 64, 64);
    speckle(g, w, h, 600, 0.06, '90,70,40');
    g.fillStyle = '#cdbfa8';
    g.fillRect(0, 0, w, 1.5);
    g.fillRect(0, 0, 1.5, h);
    g.fillRect(0, 63, w, 1);
    g.fillRect(63, 0, 1, h);
  });
  const deckT = tex(128, 128, (g, w, h) => {
    for (let y = 0; y < h; y += 16) {
      g.fillStyle = `hsl(30,${30 + Math.random() * 10}%,${42 + Math.random() * 8}%)`;
      g.fillRect(0, y, w, 15);
      g.fillStyle = '#5a4128';
      g.fillRect(0, y + 15, w, 1);
      g.fillRect((y * 37) % w, y, 1, 15);
    }
    speckle(g, w, h, 400, 0.08, '0,0,0');
  });
  const floorM = lam(0xffffff, { map: floorT }),
    deckM = decal(lam(0xffffff, { map: deckT }), 2);
  const stone = lam(0xe9e1d2, { map: T.stone }),
    dark = lam(0x2b2a28),
    white = lam(0xf7f6f3),
    wood = lam(0xb08a5e),
    metal = new THREE.MeshPhongMaterial({ color: 0xb9bdc2, specular: 0xffffff, shininess: 90 }),
    glassM = new THREE.MeshPhongMaterial({
      color: 0xcfe6f2,
      transparent: true,
      opacity: 0.28,
      specular: 0xffffff,
      shininess: 100,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  flat(M.x1, M.x2, M.z1, M.z2, 0, floorM, 2.4, sc);
  // ---- level 2: side walkways, two bridges, and the food-court terrace at the top of the escalators
  const TER = [
    [-BI, BI, -24, -18],
    [-5.8, 5.8, -18, -4],
  ];
  const L2R = [[-W, -BI, -68, 8], [BI, W, -68, 8], [-BI, BI, -50, -46], [-BI, BI, 2, 6], ...TER];
  L2R.forEach((r, i) => {
    const [x1, x2, z1, z2] = r;
    B(x2 - x1, 0.5, z2 - z1, stone, (x1 + x2) / 2, L2 - 0.25, (z1 + z2) / 2, true);
    flat(x1, x2, z1, z2, L2 + 0.02, i >= 4 ? deckM : floorM, 2.4, sc);
  });
  const rail = (x1, x2, z1, z2) => {
    const cx = (x1 + x2) / 2,
      cz = (z1 + z2) / 2;
    B(x2 - x1, 1.05, z2 - z1, glassM, cx, L2 + 0.55, cz);
    B(x2 - x1 + 0.04, 0.07, z2 - z1 + 0.04, metal, cx, L2 + 1.1, cz);
    S_(x1, x2, z1, z2, L2 - 0.1, L2 + 1.3);
  };
  for (const s of [-1, 1]) {
    const x = s * BI;
    for (const [a, b] of [
      [-68, -50],
      [-46, -24],
      [-18, 2],
      [6, 8],
    ])
      rail(x - 0.06, x + 0.06, a, b);
    rail(Math.min(s * BI, s * W), Math.max(s * BI, s * W), 7.94, 8.06);
    rail(s * 5.8 - 0.06, s * 5.8 + 0.06, -18, -4);
  }
  for (const z of [-50, -46, 2, 6]) rail(-BI, BI, z - 0.06, z + 0.06);
  rail(-BI, BI, -24.06, -23.94);
  rail(-5.8, 5.8, -4.06, -3.94);
  for (const [x, z] of [
    [-3, -20],
    [3, -20],
    [-3, -8],
    [3, -8],
  ]) {
    B(0.6, L2, 0.6, stone, x, L2 / 2, z);
    S_(x - 0.3, x + 0.3, z - 0.3, z + 0.3, 0, L2);
  }
  Object.assign(ctx, { sc, W, BI, L2, sol, B, S_, npcs, mkH, stone, dark, white, wood, metal, glassM });
  buildEscalators(ctx);
  const { RAMPS, stepT, stepTW } = ctx;
  buildShops(ctx);
  buildFoodCourt(ctx);
  const { fxA, glowM, seated } = ctx;
  // ---- walls, anchor, entrance, vault
  for (const s of [-1, 1]) {
    if (s > 0) B(0.6, L2, 82, stone, s * (W + 0.3), L2 / 2, -28, true);
    else {
      B(0.6, L2, 2.6, stone, -(W + 0.3), L2 / 2, -67.7, true);
      B(0.6, L2, 12, stone, -(W + 0.3), L2 / 2, -35.6, true);
      B(0.6, L2, 12.8, stone, -(W + 0.3), L2 / 2, -12, true);
      B(0.6, L2, 7.4, stone, -(W + 0.3), L2 / 2, 9.3, true);
    }
    B(4, 0.3, 76, stone, s * 10, 11.15, -30);
  }
  {
    // north wall with a walk-in doorway on level 1 and two level-2 openings (one off each upper walkway)
    const NZ = -68.3,
      piece = (x1, x2, y0, y1) => {
        B(x2 - x1, y1 - y0, 0.6, stone, (x1 + x2) / 2, (y0 + y1) / 2, NZ, true);
        S_(x1, x2, NZ - 0.3, NZ + 0.3, y0 - 0.05, y1);
      };
    piece(-22.3, -1.45, 0, L2 - 0.5);
    piece(1.45, 22.3, 0, L2 - 0.5);
    piece(-1.45, 1.45, 3.3, L2 - 0.5);
    piece(-22.3, 22.3, L2 - 0.5, L2);
    piece(-22.3, -W, L2, 10.5);
    piece(-BI, BI, L2, 10.5);
    piece(W, 22.3, L2, 10.5);
    for (const s of [-1, 1]) piece(s > 0 ? BI : -W, s > 0 ? W : -BI, L2 + 3, 10.5);
    piece(-22.3, 22.3, 10.5, M.h);
    const lt = textTex(512, 96, (g, w, h) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#f1ead8';
      g.font = '600 42px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '6px';
      } catch (e) {}
      g.fillText('BARNES & NOBLE · L2', w / 2, h / 2 + 2);
    });
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.68), new THREE.MeshBasicMaterial({ map: lt }));
      m.position.set(s * 10, L2 + 3.5, NZ + 0.31);
      sc.add(m);
      for (const x of [s * BI, s * W]) B(0.14, 3, 0.2, lam(0x24382c), x, L2 + 1.5, NZ + 0.32);
    }
  }
  {
    const bnT = tex(
      512,
      192,
      (g, w, h) => {
        g.fillStyle = '#ece3cf';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#2e2017';
        g.fillRect(14, 20, w - 28, h - 20);
        const SP = [
          '#6b1f1f',
          '#1f3a5a',
          '#2f4a35',
          '#7a5a1e',
          '#4a2a4a',
          '#8c3b2a',
          '#2a5a6b',
          '#c9b48a',
          '#30406b',
          '#a8752e',
        ];
        for (let r = 0; r < 4; r++) {
          const y = 24 + r * 41;
          g.fillStyle = '#4a3424';
          g.fillRect(14, y + 36, w - 28, 4);
          let x = 16;
          while (x < w - 20) {
            const bw = 4 + Math.random() * 6,
              bh = 22 + Math.random() * 12;
            g.fillStyle = SP[(Math.random() * SP.length) | 0];
            g.fillRect(x, y + 36 - bh, bw - 0.8, bh);
            x += bw;
          }
        }
        g.fillStyle = 'rgba(30,30,30,.5)';
        for (const x of [90, 170, 340, 420]) {
          g.beginPath();
          g.arc(x, 118, 8, 0, 7);
          g.fill();
          g.fillRect(x - 8, 126, 16, 50);
        }
        g.fillStyle = 'rgba(255,255,255,.2)';
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(120, 0);
        g.lineTo(0, 170);
        g.fill();
      },
      false,
    );
    for (const sx of [-1, 1]) {
      const a1 = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.2), new THREE.MeshBasicMaterial({ map: bnT }));
      a1.position.set(sx * 4.7, 2.1, -67.97);
      sc.add(a1);
    }
    const a2 = new THREE.Mesh(new THREE.PlaneGeometry(16, 4.2), new THREE.MeshBasicMaterial({ map: bnT }));
    a2.position.set(0, L2 + 2.3, -67.97);
    sc.add(a2);
    const dg = new THREE.MeshPhongMaterial({
      color: 0x9fbccc,
      transparent: true,
      opacity: 0.55,
      specular: 0xffffff,
      shininess: 90,
    });
    B(2.8, 0.4, 0.3, lam(0x24382c), 0, 3.25, -67.85);
    for (const x of [-1.45, 1.45]) B(0.12, 3.2, 0.2, lam(0x24382c), x, 1.6, -67.85);
    B(16.4, 0.5, 0.4, lam(0x24382c), 0, 4.45, -67.8);
    const at = textTex(1024, 128, (g, w, h) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#f1ead8';
      g.font = '600 88px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '12px';
      } catch (e) {}
      g.fillText('BARNES & NOBLE', w / 2, h / 2 + 4);
    });
    const an = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.75), new THREE.MeshBasicMaterial({ map: at }));
    an.position.set(0, 10.1, -67.96);
    sc.add(an);
    const an2 = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.8), new THREE.MeshBasicMaterial({ map: at }));
    an2.position.set(0, 4.45, -67.59);
    sc.add(an2);
    const bsT = textTex(256, 256, (g, w, h) => {
      g.fillStyle = '#24382c';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#c9b48a';
      g.lineWidth = 6;
      g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = '#efe6d2';
      g.textAlign = 'center';
      g.font = '600 40px "Cormorant Garamond", Georgia, serif';
      g.fillText('BOOKS', w / 2, 80);
      g.fillText('CAFÉ', w / 2, 136);
      g.font = '600 26px Overpass, Arial, sans-serif';
      g.fillStyle = '#c9b48a';
      g.fillText('OPEN TIL 10 PM', w / 2, 196);
    });
    const stand = signPlane(bsT, 0.8, 0.8);
    stand.position.set(2.3, 1.2, -66.4);
    sc.add(stand);
    B(0.05, 0.8, 0.05, dark, 2.3, 0.4, -66.4);
    S_(2.1, 2.5, -66.6, -66.2, 0, 1.6);
  }
  B(37.2, M.h, 0.6, stone, 0, M.h / 2, 12.3, true);
  {
    const dg = new THREE.MeshPhongMaterial({
      color: 0x9fbccc,
      transparent: true,
      opacity: 0.6,
      specular: 0xffffff,
      shininess: 90,
    });
    for (const x of [-0.7, 0.7]) B(1.35, 2.9, 0.06, dg, x, 1.45, 11.98);
    B(2.9, 0.14, 0.2, dark, 0, 2.97, 11.95);
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
    es.position.set(0, 3.4, 11.96);
    es.rotation.y = Math.PI;
    sc.add(es);
  }
  {
    const vault = new THREE.Mesh(
      new THREE.CylinderGeometry(W, W, 80, 40, 1, true, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2),
      new THREE.MeshPhongMaterial({
        color: 0xd6ebf7,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
        specular: 0xffffff,
        shininess: 100,
      }),
    );
    vault.position.set(0, 11, -28);
    sc.add(vault);
    for (let z = -68; z <= 12; z += 5) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(W, 0.08, 6, 40, Math.PI), metal);
      rib.position.set(0, 11, z);
      sc.add(rib);
    }
    for (let k = 1; k < 6; k++) {
      const a = (k / 6) * Math.PI,
        p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 80), metal);
      p.position.set(Math.cos(a) * W, 11 + Math.sin(a) * W, -28);
      sc.add(p);
    }
  }
  buildIceRink(ctx);
  const { RINK, RINKX } = ctx;
  // ---- people: shoppers on both levels, diners on the terrace, skaters on the ice
  const paths = [
    { ax: 'z', c: 10.5, a: -64, b: 6, y: 0 },
    { ax: 'z', c: -10.5, a: -64, b: 6, y: 0 },
    { ax: 'x', c: -55, a: -10.5, b: 10.5, y: 0 },
    { ax: 'z', c: 10.6, a: -64, b: 6, y: 0 },
    { ax: 'z', c: 8.9, a: -66, b: 6, y: L2 },
    { ax: 'z', c: -8.9, a: -66, b: 6, y: L2 },
    { ax: 'x', c: -48, a: -11, b: 11, y: L2 },
    { ax: 'x', c: -20.6, a: -10, b: 10, y: L2 },
  ];
  for (let i = 0; i < 12; i++) {
    const p = paths[i % paths.length],
      h = mkH();
    sc.add(h.g);
    npcs.push({ h, ...p, t: rand(p.a, p.b), dir: Math.random() < 0.5 ? 1 : -1, spd: rand(0.9, 1.35) });
  }
  for (const [x, z] of seated) {
    const h = mkH();
    h.g.position.set(x + 0.85, L2 - 0.38, z);
    h.g.rotation.y = -Math.PI / 2;
    h.legL.rotation.x = h.legR.rotation.x = -1.45;
    h.armL.rotation.x = h.armR.rotation.x = -0.7;
    sc.add(h.g);
  }
  for (let i = 0; i < 7; i++) {
    const h = human({
      skin: pick(SKINS),
      shirt: pick(['#c23b33', '#2d5d8a', '#e8e4da', '#6d4a8a', '#d79a2b']),
      pants: pick(PANTS),
      shoe: '#f4f4f2',
      hair: pick(['#1b1410', '#6b4a2a', '#c9a46a']),
    });
    sc.add(h.g);
    npcs.push({
      h,
      ell: { cx: 0, cz: -36, rx: rand(3.6, 5.2), rz: rand(5.6, 7.6), r: 6 },
      t: (i / 7) * Math.PI * 2,
      spd: rand(2.2, 3.2),
      y: 0.12,
      ph: rand(0, 6),
    });
  }
  buildAppleStore(ctx);
  const { AP, PRODUCTS } = ctx;
  buildSephora(ctx);
  buildCcrGallery(ctx);
  ctx.blk = blk;
  buildBookstore(ctx);
  const { SE, sephoraArea, GA, ccrArea, ccrMobile, bnFloorsAt, bnLabelAt, BN } = ctx;
  for (let i = 0; i < 3; i++) {
    const h = mkH();
    sc.add(h.g);
    npcs.push({
      h,
      wp: [
        [7, -4.5],
        [7, -19.6],
        [-7, -19.6],
        [-7, -4.5],
      ],
      seg: i,
      t: rand(0, 0.8),
      y: i === 1 || i === 2 ? L2 : 0,
    });
  }
  const mk = marker(sc, 0, M.z2 - 0.9);
  const floorAt = (x, z, y) => {
    let best = 0;
    const c = [];
    for (const [x1, x2, z1, z2] of L2R) if (x >= x1 && x <= x2 && z >= z1 && z <= z2) c.push(L2);
    for (const r of RAMPS)
      if (x >= r.x1 - 0.05 && x <= r.x2 + 0.05 && z >= r.zt - 0.05 && z <= r.zb)
        c.push(L2 * clamp((r.zb - z) / (r.zb - r.zt), 0, 1));
    if (x > RINK[0] && x < RINK[1] && z > RINK[2] && z < RINK[3]) c.push(0.12);
    if (z < -67.6) c.push(...bnFloorsAt(x, z));
    for (const v of c) if (v <= y + 0.6 && v > best) best = v;
    return best;
  };
  const inR = (p, r) => p.x > r[0] && p.x < r[1] && p.z > r[2] && p.z < r[3];
  return {
    scene: sc,
    RM: M,
    door: { x: 0, z: M.z2 },
    spawn: { x: 0, z: 9 },
    blockers: blk,
    solids: sol,
    camMax: 7,
    mark: mk,
    npcs,
    floorAt,
    name: 'Galleria',
    exitText: 'Exit to Noel Rd',
    label: ['Galleria', 'Level 1', 'Galleria Dallas'],
    labelAt(p) {
      if (p.z < BZ) return bnLabelAt(p);
      if (p.y < 3 && p.x < -W && p.z > SE.z1 && p.z < SE.z2)
        return ['Sephora', sephoraArea(p), 'Galleria Dallas'];
      if (p.y < 3 && p.x < -9 && p.z > SE.z1 && p.z < SE.z2)
        return ['Galleria · Level 1', 'Sephora entrance', 'Galleria Dallas'];
      if (p.y < 3 && p.x < -W && p.z > GA.z1 && p.z < GA.z2)
        return ['CCR Gallery', ccrArea(p), 'Galleria Dallas'];
      if (p.y < 3 && p.x < -9 && p.z > GA.z1 && p.z < GA.z2)
        return ['Galleria · Level 1', 'CCR Gallery entrance', 'Galleria Dallas'];
      if (p.y < 3 && p.x < -W) {
        const q = this.productAt(p);
        return ['Apple', q ? q.n + ' table' : 'Store · Level 1', 'Galleria Dallas'];
      }
      if (p.y < 3 && p.x < -9 && p.z > AP.z1 && p.z < AP.z2)
        return ['Galleria · Level 1', 'Apple entrance', 'Galleria Dallas'];
      if (p.y < 3 && Math.abs(p.x) < 6 && p.z < -60)
        return ['Galleria · Level 1', 'Barnes & Noble entrance', 'Galleria Dallas'];
      if (p.y > 3 && p.z < -64 && Math.abs(p.x) > BI - 0.5)
        return ['Galleria · Level 2', 'Barnes & Noble level-2 entrance', 'Galleria Dallas'];
      if (p.y > 3)
        return TER.some((r) => inR(p, r))
          ? ['Galleria · Food court', 'Level 2 · terrace seating', 'Galleria Dallas']
          : ['Galleria · Food court', 'Level 2', 'Galleria Dallas'];
      if (p.x > 6 && p.z > -42 && p.z < -18)
        return ['Galleria · Level 1', 'Tech flagship', 'Galleria Dallas'];
      if (p.x > RINK[0] && p.x < RINK[1] && p.z > RINK[2] && p.z < RINK[3])
        return ['Galleria · Ice rink', 'On the ice', 'Galleria Dallas'];
      if (Math.abs(p.x) < 9 && p.z > -47 && p.z < -25)
        return ['Galleria · Level 1', 'Rinkside · gates east & west', 'Galleria Dallas'];
      return ['Galleria · Level 1', 'Shops', 'Galleria Dallas'];
    },
    camRM: { x1: -22, x2: 22, z1: BZ - 34, z2: M.z2, h: M.h },
    clampXZ(p, r) {
      if (p.y < 3 && p.x < -W + r && p.z > AP.z1 - 0.5 && p.z < AP.z2 + 0.5) {
        p.x = Math.max(p.x, AP.x1 + r);
        return;
      }
      if (p.y < 3 && p.x < -W + r && p.z > SE.z1 - 0.5 && p.z < SE.z2 + 0.5) {
        p.x = Math.max(p.x, SE.x1 + r);
        return;
      }
      if (p.y < 3 && p.x < -W + r && p.z > GA.z1 - 0.5 && p.z < GA.z2 + 0.5) {
        p.x = Math.max(p.x, GA.x1 + r);
        p.z = clamp(p.z, M.z1 + r, M.z2 - r);
        return;
      }
      // Barnes & Noble: through the level-1 doorway, the level-2 openings, or already inside
      const atDoor =
        p.z < M.z1 + r + 0.02 &&
        ((p.y < 1 && Math.abs(p.x) < 1.45 - r) ||
          (p.y > 4.5 && Math.abs(p.x) > BI + r && Math.abs(p.x) < W - r));
      if (p.z < BZ - 0.3 || atDoor) {
        p.x = clamp(p.x, -22 + r, 22 - r);
        p.z = Math.max(p.z, BZ - 34 + r);
        return;
      }
      p.x = clamp(p.x, M.x1 + r, M.x2 - r);
      p.z = clamp(p.z, M.z1 + r, M.z2 - r);
    },
    productAt(p) {
      if (p.y > 1) return null;
      for (const q of PRODUCTS) {
        const dx = Math.max(q.x1 - p.x, 0, p.x - q.x2),
          dz = Math.max(q.z1 - p.z, 0, p.z - q.z2);
        if (Math.hypot(dx, dz) < 1.3) return q;
      }
      return null;
    },
    onIce(p) {
      return (
        p.y < 0.5 &&
        p.x > RINK[0] + 0.05 &&
        p.x < RINK[1] - 0.05 &&
        p.z > RINK[2] + 0.05 &&
        p.z < RINK[3] - 0.05
      );
    },
    update(dt) {
      if (ccrMobile) ccrMobile.rotation.y += dt * 0.25;
      stepT.offset.y -= dt * 6;
      if (RINKX.vid) RINKX.vid.offset.x += dt * 0.02;
      {
        const cur = this.productAt(P.pos),
          inStore = P.pos.x < -W + 1 && P.pos.y < 3;
        for (const q of PRODUCTS) {
          const want = q === cur ? 1 : inStore ? 0.35 : 0;
          q.lit += (want - q.lit) * Math.min(1, dt * 5);
          q.sp.material.opacity = q.lit;
          q.sp.position.y = 2.05 + Math.sin(performance.now() * 0.0018) * 0.04 + (q === cur ? 0.08 : 0);
          q.glow.material.opacity = q === cur ? q.lit * 0.22 : 0;
        }
      }
      stepTW.offset.y += dt * 6;
      for (const gt of RINKX.gates) {
        const near = Math.hypot(P.pos.x - gt.box.x1, P.pos.z - -36) < 2.6 && P.pos.y < 1;
        gt.open += ((near ? 1 : 0) - gt.open) * Math.min(1, dt * 6);
        gt.piv.rotation.y = gt.hz * gt.sx * gt.open * 1.45;
        const i = sol.indexOf(gt.box);
        if (gt.open > 0.5 && i >= 0) sol.splice(i, 1);
        else if (gt.open <= 0.5 && i < 0) sol.push(gt.box);
      }
      if (RINKX.tree) {
        const t = performance.now() * 0.001;
        RINKX.tree.star.rotation.y = t * 0.6;
        for (const b of RINKX.tree.bulbs)
          b.m.color.setHSL(0.13, 1, 0.55 + 0.35 * Math.max(0, Math.sin(t * 2.2 + b.ph)));
      }
      for (const f of fxA.flames) {
        f.scale.set(0.85 + Math.random() * 0.3, 0.7 + Math.random() * 0.6, 0.85 + Math.random() * 0.3);
      }
      for (const c of fxA.spin) c.rotation.y += dt * 1.4;
      glowM.color.setHSL(0.07, 1, 0.5 + Math.sin(performance.now() * 0.004) * 0.06);
    },
    conveyor(p) {
      for (const r of RAMPS) {
        if (p.x < r.x1 - 0.1 || p.x > r.x2 + 0.1 || p.z < r.zt - 0.4 || p.z > r.zb + 0.4) continue;
        const h = L2 * clamp((r.zb - p.z) / (r.zb - r.zt), 0, 1);
        if (Math.abs(p.y - h) < 0.6) return r.dir * 2.4;
      }
      return 0;
    },
    plan(g, S) {
      const k = S / 88,
        X = (x) => S / 2 + x * k,
        cz = P.pos.z < -60 ? -80 : -28,
        Z = (z) => S / 2 + (z - cz) * k,
        up = P.pos.y > 3;
      g.fillStyle = '#231d17';
      g.fillRect(0, 0, S, S);
      g.fillStyle = up ? '#7a4f30' : '#6b5a46';
      g.fillRect(X(-24), Z(-68), (24 - W) * k, 80 * k);
      g.fillRect(X(W), Z(-68), (24 - W) * k, 80 * k);
      if (!up) {
        g.fillStyle = '#e8e8e6';
        g.fillRect(X(W), Z(-42), (24 - W) * k, 24 * k);
        g.fillRect(X(AP.x1), Z(AP.z1), (AP.x2 - AP.x1) * k, (AP.z2 - AP.z1) * k);
        g.fillStyle = '#1d1d1f';
        g.font = '700 18px Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.fillText('APPLE', X(-18), Z(-54));
        g.fillStyle = '#111113';
        g.fillRect(X(SE.x1), Z(SE.z1), (SE.x2 - SE.x1) * k, (SE.z2 - SE.z1) * k);
        g.fillStyle = '#ffffff';
        g.fillText('SEPHORA', X(-18), Z(-23.4));
        g.fillStyle = '#fbfaf8';
        g.fillRect(X(GA.x1), Z(GA.z1), (GA.x2 - GA.x1) * k, (GA.z2 - GA.z1) * k);
        g.fillStyle = '#141414';
        g.fillText('CCR GALLERY', X(-18), Z(0.6));
        g.fillStyle = '#c9a477';
        for (const q of PRODUCTS) g.fillRect(X(q.x1), Z(q.z1), (q.x2 - q.x1) * k, (q.z2 - q.z1) * k);
      }
      g.fillStyle = up ? '#4c6b56' : '#3d5546';
      g.fillRect(X(-22), Z(BZ - 34), 44 * k, 34 * k);
      g.fillStyle = up ? 'rgba(201,180,138,.35)' : '#d9b98c';
      if (up) g.fillRect(X(-6), Z(BZ - 24), 12 * k, 14 * k);
      else g.fillRect(X(-2.6), Z(BZ - 34), 5.2 * k, 34 * k);
      g.fillStyle = '#8d9196';
      g.fillRect(X(BN.ST.x1), Z(BZ + BN.ST.zt), (BN.ST.x2 - BN.ST.x1) * k, (BN.ST.zb - BN.ST.zt) * k);
      g.fillStyle = '#efe6d2';
      g.font = '700 16px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      g.fillText(up ? 'B&N · LEVEL 2' : 'BARNES & NOBLE', X(0), Z(BZ - 28));
      if (up) {
        g.fillStyle = '#3a3129';
        g.fillRect(X(-BI), Z(-68), 2 * BI * k, 76 * k);
        L2R.forEach((r, i) => {
          g.fillStyle = i >= 4 ? '#b08a5e' : '#e6dcc8';
          g.fillRect(X(r[0]), Z(r[2]), (r[1] - r[0]) * k, (r[3] - r[2]) * k);
        });
      } else {
        g.fillStyle = '#e6dcc8';
        g.fillRect(X(-W), Z(-68), 2 * W * k, 80 * k);
      }
      g.fillStyle = up ? 'rgba(191,227,242,.45)' : '#bfe3f2';
      g.fillRect(X(RINK[0]), Z(RINK[2]), 13 * k, 18 * k);
      if (!up) {
        g.strokeStyle = '#1f6fc2';
        g.lineWidth = 4;
        g.strokeRect(X(RINK[0]), Z(RINK[2]), 13 * k, 18 * k);
        g.fillStyle = '#bfe3f2';
        g.fillRect(X(RINK[0]) - 3, Z(-37.1), 6, 2.2 * k);
        g.fillRect(X(RINK[1]) - 3, Z(-37.1), 6, 2.2 * k);
      }
      g.fillStyle = '#2b7442';
      g.beginPath();
      g.arc(X(0), Z(-36), 2.1 * k, 0, 7);
      g.fill();
      g.fillStyle = '#8d9196';
      for (const r of RAMPS) g.fillRect(X(r.x1), Z(r.zt), (r.x2 - r.x1) * k, (r.zb - r.zt) * k);
      if (!up) {
        g.fillStyle = '#f2b33d';
        g.beginPath();
        g.arc(X(0), Z(11.1), 9, 0, 7);
        g.fill();
      }
      g.fillStyle = '#f4f1ea';
      g.font = '800 24px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(
        P.pos.z < BZ ? (up ? 'B&N · LEVEL 2' : 'B&N · LEVEL 1') : up ? 'LEVEL 2 · FOOD' : 'LEVEL 1',
        S / 2,
        S * 0.08 + 10,
      );
      g.save();
      g.translate(X(P.pos.x), Z(P.pos.z));
      g.rotate(Math.atan2(Math.cos(P.rot), Math.sin(P.rot)));
      g.fillStyle = '#fff';
      g.strokeStyle = '#0c1712';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(20, 0);
      g.lineTo(-12, -12);
      g.lineTo(-5, 0);
      g.lineTo(-12, 12);
      g.closePath();
      g.stroke();
      g.fill();
      g.restore();
    },
  };
}

export { buildGalleria };
