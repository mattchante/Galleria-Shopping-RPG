// Level-2 food court: counters, open kitchens, food models, cooks, and the terrace seating.
import { SKINS, human } from '../../life/people.js';
import { T, flat } from '../../core/materials.js';
import * as THREE from 'three';
import { decal, lam, pick, rand, scaleUV, speckle, tex } from '../../core/helpers.js';
import { signPlane, textTex } from '../../world/signals.js';

export function buildFoodCourt(ctx) {
  const { B, L2, S_, W, dark, face, glassM, mkH, npcs, sc, stone, zs } = ctx;
  // ---- level 2: food court with open kitchens behind the counters
  const FOOD = {
    1: [
      {
        n: 'NOODLE BAR',
        eq: 'wok',
        f: ['bowl', 'drink'],
        m: ['Dan dan noodles', 'Pork bao (2)', 'Jasmine tea'],
      },
      {
        n: 'TACO STAND',
        eq: 'griddle',
        f: ['taco', 'drink'],
        m: ['Street tacos (3)', 'Queso & chips', 'Horchata'],
      },
      {
        n: 'PIZZA SLICE',
        eq: 'oven',
        f: ['pizza', 'drink'],
        m: ['Pepperoni slice', 'Garlic knots', 'Fountain drink'],
      },
      {
        n: 'BURGER GRILL',
        eq: 'grill',
        f: ['burger', 'fries'],
        m: ['Double smash', 'Crinkle fries', 'Shake'],
      },
      {
        n: 'SUSHI GO',
        eq: 'cold',
        f: ['sushi', 'drink'],
        m: ['California roll', 'Salmon nigiri', 'Miso soup'],
      },
      {
        n: 'SMOOTHIE BAR',
        eq: 'blend',
        f: ['smoothie', 'smoothie'],
        m: ['Berry blast', 'Green machine', 'Acai bowl'],
      },
    ],
    '-1': [
      { n: 'GYRO HOUSE', eq: 'gyro', f: ['gyro', 'drink'], m: ['Chicken gyro', 'Hummus plate', 'Baklava'] },
      { n: 'RAMEN YA', eq: 'pots', f: ['bowl', 'drink'], m: ['Tonkotsu ramen', 'Gyoza (5)', 'Matcha'] },
      { n: 'BBQ PIT', eq: 'smoker', f: ['bbq', 'drink'], m: ['Brisket plate', 'Mac & cheese', 'Sweet tea'] },
      {
        n: 'WAFFLE & CO',
        eq: 'waffle',
        f: ['waffle', 'drink'],
        m: ['Chicken & waffle', 'Belgian waffle', 'Cold brew'],
      },
      {
        n: 'GREEN BOWL',
        eq: 'saladbar',
        f: ['salad', 'drink'],
        m: ['Harvest salad', 'Grain bowl', 'Lemonade'],
      },
      {
        n: 'PRETZEL TWIST',
        eq: 'warmer',
        f: ['pretzel', 'drink'],
        m: ['Butter pretzel', 'Cheese dip', 'Iced tea'],
      },
    ],
  };
  const PRICES = ['$8.95', '$6.50', '$3.25', '$11.49', '$4.99', '$5.75', '$9.25', '$7.10', '$2.95'];
  const ALLFOOD = Object.values(FOOD).flat();
  // simple food models
  const FM = {
    bun: lam(0xd29a52),
    patty: lam(0x4a2e1f),
    cheese: lam(0xf2c230),
    crust: lam(0xd9a45a),
    sauce: lam(0xc0392b),
    noodle: lam(0xf0d9a0),
    broth: lam(0xc98f4a),
    rice: lam(0xf5f3ee),
    fish: lam(0xf08a6a),
    nori: lam(0x1f2a22),
    cup: lam(0xf2efe8),
    lid: lam(0xe0dbd2),
    fry: lam(0xf2c14e),
    taco: lam(0xe6b85c),
    meat: lam(0x7a4a2a),
    waffle: lam(0xc98a3a),
    green: lam(0x6b9a45),
    tomato: lam(0xd2412f),
    pretzel: lam(0x9a5a28),
    bowl: lam(0xffffff, { side: THREE.DoubleSide }),
    pink: lam(0xb84a7a),
    slate: lam(0x2a2a2a),
    plate: lam(0xf7f5f0),
  };
  const food = (kind) => {
    const g = new THREE.Group(),
      A = (geo, m, x, y, z) => {
        const o = new THREE.Mesh(geo, m);
        o.position.set(x, y, z);
        g.add(o);
        return o;
      };
    if (kind === 'burger') {
      A(new THREE.CylinderGeometry(0.09, 0.1, 0.05, 12), FM.bun, 0, 0.025, 0);
      A(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), FM.patty, 0, 0.065, 0);
      A(new THREE.CylinderGeometry(0.105, 0.105, 0.01, 12), FM.cheese, 0, 0.085, 0);
      A(new THREE.SphereGeometry(0.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), FM.bun, 0, 0.09, 0);
    } else if (kind === 'fries') {
      A(new THREE.BoxGeometry(0.09, 0.1, 0.05), FM.sauce, 0, 0.05, 0);
      for (let i = 0; i < 7; i++)
        A(new THREE.BoxGeometry(0.012, 0.09, 0.012), FM.fry, -0.035 + i * 0.012, 0.13, rand(-0.015, 0.015));
    } else if (kind === 'pizza') {
      A(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 24, 1, false, 0, Math.PI / 3), FM.crust, 0, 0.01, 0);
      A(new THREE.CylinderGeometry(0.2, 0.2, 0.022, 24, 1, false, 0, Math.PI / 3), FM.cheese, 0, 0.012, 0);
      for (let i = 0; i < 3; i++)
        A(
          new THREE.CylinderGeometry(0.02, 0.02, 0.025, 10),
          FM.sauce,
          Math.sin(0.5) * (0.06 + i * 0.045),
          0.014,
          Math.cos(0.5) * (0.06 + i * 0.045),
        );
    } else if (kind === 'bowl' || kind === 'salad') {
      A(new THREE.SphereGeometry(0.12, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), FM.bowl, 0, 0.12, 0);
      A(new THREE.CylinderGeometry(0.11, 0.11, 0.01, 14), kind === 'bowl' ? FM.broth : FM.green, 0, 0.1, 0);
      for (let i = 0; i < 5; i++) {
        if (kind === 'bowl') {
          const t = A(
            new THREE.TorusGeometry(0.035, 0.008, 4, 10),
            FM.noodle,
            rand(-0.04, 0.04),
            0.106,
            rand(-0.04, 0.04),
          );
          t.rotation.x = Math.PI / 2;
        } else
          A(
            new THREE.SphereGeometry(0.022, 6, 4),
            i % 2 ? FM.tomato : FM.green,
            rand(-0.05, 0.05),
            0.11,
            rand(-0.05, 0.05),
          );
      }
    } else if (kind === 'sushi') {
      A(new THREE.BoxGeometry(0.32, 0.02, 0.12), FM.slate, 0, 0.01, 0);
      for (let i = 0; i < 5; i++) {
        A(new THREE.CylinderGeometry(0.026, 0.026, 0.035, 10), FM.nori, -0.12 + i * 0.06, 0.037, 0);
        A(new THREE.CylinderGeometry(0.021, 0.021, 0.037, 10), FM.rice, -0.12 + i * 0.06, 0.038, 0);
        A(new THREE.CylinderGeometry(0.009, 0.009, 0.039, 8), FM.fish, -0.12 + i * 0.06, 0.039, 0);
      }
    } else if (kind === 'taco' || kind === 'gyro') {
      for (let i = 0; i < 2; i++) {
        A(
          new THREE.CylinderGeometry(0.07, 0.07, 0.16, 14, 1, true, 0, Math.PI)
            .rotateZ(-Math.PI / 2)
            .rotateY(Math.PI / 2),
          kind === 'taco' ? FM.taco : FM.bun,
          0,
          0.075,
          i * 0.1 - 0.05,
        ).material.side = THREE.DoubleSide;
        A(
          new THREE.BoxGeometry(0.05, 0.03, 0.14),
          kind === 'taco' ? FM.meat : FM.green,
          0,
          0.06,
          i * 0.1 - 0.05,
        );
      }
    } else if (kind === 'drink' || kind === 'smoothie') {
      A(new THREE.CylinderGeometry(0.045, 0.035, 0.16, 12), kind === 'drink' ? FM.cup : FM.pink, 0, 0.08, 0);
      A(new THREE.CylinderGeometry(0.047, 0.047, 0.01, 12), FM.lid, 0, 0.165, 0);
      A(new THREE.CylinderGeometry(0.004, 0.004, 0.1, 6), FM.sauce, 0.01, 0.21, 0);
    } else if (kind === 'waffle') {
      A(new THREE.CylinderGeometry(0.13, 0.13, 0.01, 16), FM.plate, 0, 0.005, 0);
      A(new THREE.BoxGeometry(0.15, 0.03, 0.15), FM.waffle, 0, 0.025, 0);
      A(new THREE.BoxGeometry(0.06, 0.02, 0.06), FM.cheese, 0, 0.05, 0);
    } else if (kind === 'bbq') {
      A(new THREE.CylinderGeometry(0.14, 0.14, 0.01, 16), FM.plate, 0, 0.005, 0);
      for (let i = 0; i < 3; i++)
        A(new THREE.BoxGeometry(0.08, 0.03, 0.04), FM.meat, -0.04, 0.025, -0.05 + i * 0.05);
      A(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), FM.cheese, 0.06, 0.02, 0);
    } else if (kind === 'pretzel') {
      const t = A(new THREE.TorusGeometry(0.06, 0.02, 6, 16), FM.pretzel, 0, 0.02, 0);
      t.rotation.x = Math.PI / 2;
    }
    return g;
  };
  const tray = (kinds) => {
    const g = new THREE.Group();
    const t = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.02, 0.34),
      lam(pick([0xb8322a, 0x2b5d8a, 0x2f6b4e, 0x3a3836])),
    );
    t.position.y = 0.01;
    g.add(t);
    kinds.forEach((k, i) => {
      const f = food(k);
      f.position.set(-0.1 + i * 0.2, 0.02, 0);
      g.add(f);
    });
    return g;
  };
  // kitchen materials
  const qT = tex(64, 64, (g, w, h) => {
    g.fillStyle = '#9c4a32';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#8a3f2a';
    g.fillRect(0, 0, 32, 32);
    g.fillRect(32, 32, 32, 32);
    g.fillStyle = '#6e3222';
    g.fillRect(0, 0, w, 1);
    g.fillRect(0, 0, 1, h);
    g.fillRect(0, 31, w, 1);
    g.fillRect(31, 0, 1, h);
    speckle(g, w, h, 200, 0.1, '0,0,0');
  });
  const qM = decal(lam(0xffffff, { map: qT }), 2);
  const subT = tex(64, 64, (g, w, h) => {
    g.fillStyle = '#f3f3f0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d2d2cc';
    for (let y = 0; y < h; y += 16) {
      g.fillRect(0, y, w, 1);
      for (let x = ((y / 16) % 2) * 16; x < w; x += 32) g.fillRect(x, y, 1, 16);
    }
  });
  const subM = new THREE.MeshBasicMaterial({ map: subT, color: 0xe9e8e3 });
  const steel = new THREE.MeshPhongMaterial({ color: 0xc4c8cc, specular: 0xffffff, shininess: 60 });
  const glowM = new THREE.MeshBasicMaterial({ color: 0xff7a1a }),
    flameM = new THREE.MeshBasicMaterial({ color: 0xff9a2a, transparent: true, opacity: 0.85 });
  const fxA = { flames: [], spin: [] };
  const equip = (t, s, zc) => {
    const X = (v) => s * v,
      top = L2 + 0.92,
      ex = X(17.25);
    const flame = (x, z) => {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 10), flameM);
      f.position.set(x, top + 0.16, z);
      sc.add(f);
      fxA.flames.push(f);
    };
    if (t === 'wok' || t === 'pots') {
      for (const dz of [-3, 0, 3]) {
        B(0.5, 0.06, 0.5, dark, ex, top + 0.03, zc + dz);
        flame(ex, zc + dz);
        if (t === 'wok') {
          const w = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
            lam(0x2a2a2a, { side: THREE.DoubleSide }),
          );
          w.position.set(ex, top + 0.5, zc + dz);
          sc.add(w);
        } else {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 16), steel);
          p.position.set(ex, top + 0.42, zc + dz);
          sc.add(p);
        }
      }
    }
    if (t === 'griddle' || t === 'grill') {
      B(1, 0.08, 4.6, dark, ex, top + 0.04, zc - 1.6);
      B(0.05, 0.06, 4.6, glowM, X(16.72), top + 0.05, zc - 1.6);
      for (let k = 0; k < 6; k++) {
        const c = new THREE.Mesh(
          new THREE.CylinderGeometry(t === 'grill' ? 0.09 : 0.12, t === 'grill' ? 0.09 : 0.12, 0.02, 12),
          t === 'grill' ? FM.patty : FM.taco,
        );
        c.position.set(ex + rand(-0.3, 0.3), top + 0.09, zc - 3.4 + k * 0.7);
        sc.add(c);
      }
      if (t === 'grill') {
        B(1, 0.12, 1.6, steel, ex, top + 0.06, zc + 2.4);
        for (const dz of [-0.4, 0.4]) {
          B(0.4, 0.02, 0.5, FM.fry, ex, top + 0.13, zc + 2.4 + dz);
          B(0.04, 0.04, 0.4, dark, X(16.7), top + 0.25, zc + 2.4 + dz);
        }
      }
    }
    if (t === 'oven') {
      B(1.4, 1.6, 2.8, lam(0xa45a3c, { map: T.brick }), X(17.1), top + 0.8, zc + 1.2);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.55), glowM);
      m.position.set(X(16.39), top + 0.7, zc + 1.2);
      face(m, s);
      B(0.9, 0.02, 0.04, steel, X(15.6), top + 0.2, zc - 2.5);
      for (let k = 0; k < 2; k++) {
        const p = food('pizza');
        p.scale.setScalar(2.2);
        p.position.set(ex, top + 0.01, zc - 3 + k * 1.4);
        sc.add(p);
      }
    }
    if (t === 'cold') {
      B(0.7, 0.45, 8.4, glassM, X(12.45), L2 + 1.32, zc);
      for (let k = 0; k < 12; k++)
        B(
          0.25,
          0.06,
          0.4,
          k % 3 ? FM.fish : FM.rice,
          X(12.45) + rand(-0.15, 0.15),
          L2 + 1.13,
          zc - 3.8 + k * 0.68,
        );
      for (const dz of [-2, 0, 2]) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16), steel);
        c.position.set(ex, top + 0.2, zc + dz);
        sc.add(c);
      }
    }
    if (t === 'blend') {
      for (let k = 0; k < 4; k++) {
        const z = zc - 2.4 + k * 1.6;
        B(0.25, 0.25, 0.25, dark, ex, top + 0.12, z);
        const j = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.35, 12), glassM);
        j.position.set(ex, top + 0.42, z);
        sc.add(j);
        const c = new THREE.Mesh(
          new THREE.CylinderGeometry(0.085, 0.075, 0.2, 12),
          lam(pick([0xb84a7a, 0x6aa84f, 0xe08a2a, 0x7a3a8a])),
        );
        c.position.set(ex, top + 0.35, z);
        sc.add(c);
      }
      for (let k = 0; k < 14; k++) {
        const f = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 6),
          lam(pick([0xd2412f, 0xf2c230, 0x6aa84f, 0xe08a2a, 0x7a3a8a])),
        );
        f.position.set(X(14.9) + rand(-0.25, 0.25), L2 + 0.98, zc - 2.4 + rand(0, 2.4));
        sc.add(f);
      }
    }
    if (t === 'gyro') {
      for (const dz of [-1.6, 1.6]) {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.75, 14), FM.meat);
        c.position.set(X(16.9), top + 0.45, zc + dz);
        sc.add(c);
        fxA.spin.push(c);
        B(0.08, 0.06, 0.06, steel, X(16.9), top + 0.86, zc + dz);
        B(0.06, 0.85, 0.5, glowM, X(17.45), top + 0.45, zc + dz);
      }
    }
    if (t === 'smoker') {
      const c = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 2.4, 18).rotateX(Math.PI / 2),
        lam(0x1d1d1d),
      );
      c.position.set(X(17.0), top + 0.55, zc + 1);
      sc.add(c);
      const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 10), lam(0x1d1d1d));
      ch.position.set(X(17.2), top + 1.4, zc + 2);
      sc.add(ch);
      B(0.04, 0.15, 0.5, glowM, X(16.55), top + 0.35, zc + 1);
      for (let k = 0; k < 3; k++) B(0.35, 0.12, 0.25, FM.meat, X(15), top + 0.04, zc - 2.4 + k * 0.5);
    }
    if (t === 'waffle') {
      for (const dz of [-3, -1.6, -0.2]) {
        B(0.5, 0.16, 0.5, dark, ex, top + 0.08, zc + dz);
        B(0.5, 0.06, 0.06, dark, X(16.85), top + 0.18, zc + dz);
        B(0.42, 0.02, 0.42, glowM, ex, top + 0.161, zc + dz);
      }
    }
    if (t === 'saladbar') {
      for (let k = 0; k < 9; k++)
        B(
          0.5,
          0.08,
          0.75,
          lam(pick([0x6aa84f, 0xd2412f, 0xf2c230, 0xe8e2d0, 0x7a3a8a, 0x4f7a3a])),
          X(12.45),
          L2 + 1.12,
          zc - 3.6 + k * 0.9,
        );
    }
    if (t === 'warmer') {
      B(0.7, 0.65, 1.8, glassM, X(12.45), L2 + 1.42, zc + 1.2);
      B(0.62, 0.03, 1.7, glowM, X(12.45), L2 + 1.73, zc + 1.2);
      for (let k = 0; k < 6; k++) {
        const p = food('pretzel');
        p.scale.setScalar(1.3);
        p.position.set(
          X(12.45) + rand(-0.15, 0.15),
          L2 + 1.12 + (k > 2 ? 0.25 : 0),
          zc + 0.6 + (k % 3) * 0.55,
        );
        sc.add(p);
      }
    }
  };
  for (const s of [-1, 1]) {
    const kx = (v) => s * v,
      fx = s * W;
    B(0.6, 4.2, 82, stone, s * 18.3, L2 + 2.1, -28);
    B(6, 0.2, 80, lam(0x8c8d8a), s * 15, L2 + 3.9, -28);
    B(0.3, 11 - (L2 + 3.8), 80, stone, s * 12.15, (L2 + 3.8 + 11) / 2, -28);
    B(6, 0.5, 80, stone, s * 15, L2 - 0.25, -28);
    for (const z of [-56, -30, -4]) {
      const kl = new THREE.PointLight(0xffe2b8, 0.45, 22);
      kl.position.set(s * 15, L2 + 3.3, z);
      sc.add(kl);
    }
    for (let z = -66; z <= 6; z += 12) {
      B(0.5, 3.8, 1.4, stone, fx - s * 0.25, L2 + 1.9, z);
      B(6, 3.8, 0.25, lam(0xe9e6df), s * 15, L2 + 1.9, z);
    }
    FOOD[s].forEach((st, i) => {
      const zc = zs[i],
        hue = (i * 61 + (s > 0 ? 20 : 200)) % 360,
        css = `hsl(${hue},55%,42%)`,
        col = new THREE.Color(css);
      flat(Math.min(kx(12), kx(18)), Math.max(kx(12), kx(18)), zc - 5.85, zc + 5.85, L2 + 0.02, qM, 1.2, sc);
      face(new THREE.Mesh(scaleUV(new THREE.PlaneGeometry(11.7, 3.8), 11.7, 3.8), subM), s).position.set(
        kx(17.98),
        L2 + 1.9,
        zc,
      );
      const fT = textTex(1024, 150, (g, w, h) => {
        g.fillStyle = '#17191b';
        g.fillRect(0, 0, w, h);
        g.fillStyle = css;
        g.fillRect(0, 0, 380, h);
        g.fillStyle = '#fff';
        g.font = '800 46px Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(st.n, 190, h / 2 + 3);
        g.textAlign = 'left';
        g.font = '600 30px Overpass, Arial, sans-serif';
        st.m.forEach((it, k) => {
          g.fillStyle = '#ece8df';
          g.textAlign = 'left';
          g.fillText(it, 410, 32 + k * 44);
          g.textAlign = 'right';
          g.fillStyle = '#f2b33d';
          g.fillText(PRICES[(i * 3 + k) % PRICES.length], w - 26, 32 + k * 44);
        });
      });
      face(
        new THREE.Mesh(new THREE.PlaneGeometry(11.6, 1.7), new THREE.MeshBasicMaterial({ map: fT })),
        s,
      ).position.set(kx(11.98), L2 + 4.65, zc);
      B(0.9, 1.05, 9.6, lam(col.getHex()), kx(12.45), L2 + 0.52, zc);
      B(1, 0.05, 9.8, steel, kx(12.45), L2 + 1.07, zc);
      if (st.eq !== 'cold' && st.eq !== 'saladbar') {
        B(0.04, 0.45, 8.6, glassM, kx(12.08), L2 + 1.33, zc);
        B(0.5, 0.03, 8.6, glassM, kx(12.3), L2 + 1.56, zc);
      }
      B(0.35, 0.25, 0.4, dark, kx(12.5), L2 + 1.22, zc + 4.3);
      B(0.03, 0.2, 0.3, new THREE.MeshBasicMaterial({ color: 0x7fd1ff }), kx(12.32), L2 + 1.42, zc + 4.3);
      if (st.eq !== 'cold' && st.eq !== 'saladbar')
        for (let k = 0; k < 5; k++) {
          const it = food(st.f[k % st.f.length]);
          it.position.set(kx(12.5), L2 + 1.1, zc - 3.4 + k * 1.5);
          it.rotation.y = rand(0, 6);
          sc.add(it);
        }
      B(0.25, 0.08, 8.6, dark, kx(12.5), L2 + 2.3, zc);
      B(0.15, 0.02, 8.4, new THREE.MeshBasicMaterial({ color: 0xffb35a }), kx(12.5), L2 + 2.25, zc);
      B(1.1, 0.92, 9.4, steel, kx(17.25), L2 + 0.46, zc);
      B(1.6, 0.6, 9.6, steel, kx(17), L2 + 3.3, zc);
      B(0.05, 0.02, 9, new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), kx(16.25), L2 + 2.99, zc);
      B(0.8, 0.9, 3.6, steel, kx(14.9), L2 + 0.45, zc - 1);
      B(0.5, 0.03, 0.35, lam(0xe9e1cf), kx(14.9), L2 + 0.915, zc - 1.4);
      B(1.2, 2.1, 1, steel, kx(17.2), L2 + 1.05, zc - 5.2);
      B(0.03, 1.6, 0.06, dark, kx(16.58), L2 + 1.15, zc - 4.85);
      equip(st.eq, s, zc);
      for (const c0 of [13.5, 16.1]) {
        const h = human({
          skin: pick(SKINS),
          shirt: css,
          pants: '#1f2125',
          shoe: '#1b1b1b',
          hair: pick(['#1b1410', '#3a2a1e', '#6b4a2a']),
        });
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.165, 0.165, 0.09, 14),
          lam(col.clone().multiplyScalar(0.55).getHex()),
        );
        cap.position.y = 1.86;
        h.g.add(cap);
        const ap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 0.02), lam(0xf4f2ed));
        ap.position.set(0, 1.05, 0.15);
        h.g.add(ap);
        sc.add(h.g);
        npcs.push({
          h,
          ax: 'z',
          c: kx(c0),
          a: zc - 3.4,
          b: zc + 3,
          y: L2,
          t: rand(zc - 3, zc + 3),
          dir: Math.random() < 0.5 ? 1 : -1,
          spd: rand(0.45, 0.8),
        });
      }
      const nq = [2, 1, 0, 2, 1, 0][i];
      for (let q = 0; q < nq; q++) {
        const h = mkH();
        h.g.position.set(kx(10.8 - q * 0.95), L2, zc - 1 + q * 0.35);
        h.g.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2;
        sc.add(h.g);
      }
    });
  }
  // ---- terrace seating
  const chairM = lam(0x2e2c2a),
    topM = lam(0xf1ede6);
  const seated = [];
  for (const [x, z] of [
    [-3.6, -15.6],
    [0, -15.6],
    [3.6, -15.6],
    [-3.6, -11.2],
    [0, -11.2],
    [3.6, -11.2],
    [-3.6, -6.8],
    [0, -6.8],
    [3.6, -6.8],
    [-4.4, -21],
    [4.4, -21],
  ]) {
    const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 20), topM);
    tp.position.set(x, L2 + 0.76, z);
    sc.add(tp);
    B(0.08, 0.74, 0.08, dark, x, L2 + 0.37, z);
    for (const [dx, dz] of [
      [0.85, 0],
      [-0.85, 0],
      [0, 0.85],
      [0, -0.85],
    ]) {
      B(0.42, 0.06, 0.42, chairM, x + dx, L2 + 0.46, z + dz);
      B(dx ? 0.06 : 0.42, 0.5, dx ? 0.42 : 0.06, chairM, x + dx * 1.25, L2 + 0.72, z + dz * 1.25);
    }
    S_(x - 1.2, x + 1.2, z - 1.2, z + 1.2, L2 - 0.1, L2 + 1.2);
    const sit = Math.random() < 0.6;
    if (sit) seated.push([x, z]);
    if (sit || Math.random() < 0.4) {
      const st = pick(ALLFOOD),
        tr = tray(st.f);
      tr.position.set(x + (sit ? 0.22 : 0), L2 + 0.79, z + rand(-0.12, 0.12));
      tr.rotation.y = sit ? Math.PI / 2 : rand(0, 6);
      sc.add(tr);
    }
  }
  {
    const fcT = textTex(1024, 192, (g, w, h) => {
      g.fillStyle = '#17191b';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#f2b33d';
      g.lineWidth = 6;
      g.strokeRect(14, 14, w - 28, h - 28);
      g.fillStyle = '#f2b33d';
      g.font = '800 104px Overpass, Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '18px';
      } catch (e) {}
      g.fillText('FOOD COURT', w / 2 + 9, h / 2 + 6);
    });
    const fs = signPlane(fcT, 6.4, 1.2);
    fs.position.set(0, L2 + 5.6, -13);
    sc.add(fs);
    B(6.5, 1.3, 0.1, dark, 0, L2 + 5.6, -13);
    for (const x of [-3, 3]) B(0.02, 6, 0.02, dark, x, L2 + 9.2, -13);
  }
  {
    B(2.2, 0.95, 0.6, lam(0x3a3836), 0, L2 + 0.48, -23.25);
    B(2.2, 0.04, 0.64, steel, 0, L2 + 0.97, -23.25);
    for (const x of [-0.6, 0, 0.6]) B(0.18, 0.22, 0.14, lam(0xe9e4da), x, L2 + 1.1, -23.25);
    S_(-1.15, 1.15, -23.6, -22.9, L2 - 0.1, L2 + 1.2);
    for (const [x, c] of [
      [-2.2, 0x3a3836],
      [-1.6, 0x2b5d8a],
      [1.6, 0x2f6b4e],
      [2.2, 0x3a3836],
    ]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.9, 14), lam(c));
      b.position.set(x, L2 + 0.45, -23.3);
      sc.add(b);
      S_(x - 0.28, x + 0.28, -23.6, -23, L2 - 0.1, L2 + 1);
    }
  }
  {
    const ar = (t) =>
      textTex(256, 128, (g, w, h) => {
        g.fillStyle = '#17191b';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#f2b33d';
        g.font = '800 64px Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(t, w / 2, h / 2 + 4);
      });
    const up = signPlane(ar('UP ▲'), 1.1, 0.55);
    up.position.set(7, 2.3, -4.2);
    sc.add(up);
    B(0.06, 2, 0.06, dark, 8.05, 1, -4.2);
    const dn = signPlane(ar('DOWN ▼'), 1.1, 0.55);
    dn.position.set(-7, L2 + 2.3, -19.3);
    sc.add(dn);
    B(0.06, 2, 0.06, dark, -8.05, L2 + 1, -19.3);
  }
  for (const [x, z] of [
    [-5.2, -4.6],
    [5.2, -4.6],
    [-7.4, -23.4],
    [7.4, -23.4],
  ]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.6, 14), dark);
    p.position.set(x, L2 + 0.3, z);
    sc.add(p);
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 1), lam(0x4f7a3a));
    f.position.set(x, L2 + 1, z);
    sc.add(f);
    S_(x - 0.5, x + 0.5, z - 0.5, z + 0.5, L2 - 0.1, L2 + 1.4);
  }
  {
    const pm = new THREE.MeshBasicMaterial({ color: 0xfff1d2 });
    for (const [x, z] of [
      [-3.6, -15.6],
      [3.6, -15.6],
      [0, -11.2],
      [-3.6, -6.8],
      [3.6, -6.8],
    ]) {
      B(0.02, 4.2, 0.02, dark, x, L2 + 5.2, z);
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 16, 1, true), dark);
      sh.position.set(x, L2 + 3.05, z);
      sc.add(sh);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), pm);
      b.position.set(x, L2 + 2.92, z);
      sc.add(b);
    }
  }
  Object.assign(ctx, { fxA, glowM, seated });
}
