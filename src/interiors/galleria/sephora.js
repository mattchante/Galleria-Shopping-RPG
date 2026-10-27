// Sephora: walk-in beauty store on the west side of level 1, between the Apple store and the food-court escalators.
// Makeup wall, fragrance wall, skincare wall, tester islands, a beauty studio and checkout.
// Store name in plain type only; no logo, mark or signature lettering.
import { SKINS, human } from '../../life/people.js';
import * as THREE from 'three';
import { decal, lam, pick, rand, speckle, tex } from '../../core/helpers.js';
import { flat } from '../../core/materials.js';
import { signPlane, textTex } from '../../world/signals.js';

export function buildSephora(ctx) {
  const { B, S_, W, mkH, npcs, sc } = ctx;
  const SE = { x1: -24, x2: -W, z1: -29.6, z2: -18.4, h: 4.9, ez1: -25.6, ez2: -22.4 };
  const xc = (SE.x1 + SE.x2) / 2,
    zc = (SE.z1 + SE.z2) / 2,
    WD = SE.x2 - SE.x1,
    DP = SE.z2 - SE.z1;
  const black = new THREE.MeshPhongMaterial({ color: 0x111113, specular: 0x555555, shininess: 60 });
  const white = lam(0xf7f6f4),
    gold = new THREE.MeshPhongMaterial({ color: 0xc9a45a, specular: 0xffe8b0, shininess: 90 }),
    chrome = new THREE.MeshPhongMaterial({ color: 0xd5d8dc, specular: 0xffffff, shininess: 110 }),
    lightM = new THREE.MeshBasicMaterial({ color: 0xfffbf2 });
  const word = (t, w, h, fs, bg = '#111113', fg = '#ffffff') =>
    textTex(w, h, (g, W2, H) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, W2, H);
      g.fillStyle = fg;
      g.font = `600 ${fs}px Overpass, "Helvetica Neue", Arial, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = Math.round(fs * 0.32) + 'px';
      } catch (e) {}
      g.fillText(t, W2 / 2 + fs * 0.16, H / 2 + 3);
    });

  // ---- floor, shell, ceiling
  const floorT = tex(128, 128, (g, w, h) => {
    g.fillStyle = '#f3f2f0';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 300, 0.04, '80,80,80');
    g.fillStyle = '#dcdad6';
    g.fillRect(0, 0, w, 1.5);
    g.fillRect(0, 0, 1.5, h);
  });
  flat(
    SE.x1,
    SE.x2,
    SE.z1,
    SE.z2,
    0.006,
    decal(new THREE.MeshPhongMaterial({ map: floorT, specular: 0x666666, shininess: 70 }), 2),
    1.4,
    sc,
  );
  // a black runway from the door to the fragrance wall
  flat(SE.x1 + 0.6, SE.x2, -24.6, -23.4, 0.008, decal(lam(0x1b1b1d), 3), 0, sc);
  B(WD + 0.4, SE.h, 0.3, white, xc, SE.h / 2, SE.z1 - 0.15, true);
  B(WD + 0.4, SE.h, 0.3, white, xc, SE.h / 2, SE.z2 + 0.15, true);
  B(0.3, SE.h, DP, white, SE.x1 - 0.15, SE.h / 2, zc, true);
  B(WD, 0.1, DP, lam(0x161618), xc, SE.h + 0.05, zc, true);
  S_(SE.x1 - 0.3, SE.x2, SE.z1 - 0.3, SE.z1, 0, SE.h);
  S_(SE.x1 - 0.3, SE.x2, SE.z2, SE.z2 + 0.3, 0, SE.h);
  S_(SE.x1 - 0.3, SE.x1, SE.z1, SE.z2, 0, SE.h);
  for (let x = SE.x1 + 1; x < SE.x2; x += 2)
    for (let z = SE.z1 + 1; z < SE.z2; z += 2) B(0.34, 0.03, 0.34, lightM, x, SE.h - 0.01, z);
  for (const z of [-27, -21]) {
    const pl = new THREE.PointLight(0xfff6ea, 0.4, 14);
    pl.position.set(-18, 4.2, z);
    sc.add(pl);
  }

  // ---- storefront: glass either side of a wide open entrance, black fascia with the name
  const glassF = new THREE.MeshPhongMaterial({
    color: 0xdff0f8,
    transparent: true,
    opacity: 0.18,
    specular: 0xffffff,
    shininess: 120,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  for (const [z1, z2] of [
    [SE.z1, SE.ez1],
    [SE.ez2, SE.z2],
  ]) {
    B(0.04, SE.h - 0.9, z2 - z1, glassF, SE.x2 - 0.02, (SE.h - 0.9) / 2, (z1 + z2) / 2);
    B(0.08, SE.h - 0.9, 0.06, black, SE.x2 - 0.02, (SE.h - 0.9) / 2, z1 + 0.03);
    B(0.08, SE.h - 0.9, 0.06, black, SE.x2 - 0.02, (SE.h - 0.9) / 2, z2 - 0.03);
    S_(SE.x2 - 0.15, SE.x2 + 0.1, z1, z2, 0, SE.h);
  }
  B(0.3, 0.9, DP + 0.3, black, SE.x2 - 0.05, SE.h - 0.45, zc);
  {
    const nm = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 0.62),
      new THREE.MeshBasicMaterial({ map: word('SEPHORA', 1024, 112, 84) }),
    );
    nm.position.set(SE.x2 + 0.11, SE.h - 0.45, zc);
    nm.rotation.y = Math.PI / 2;
    sc.add(nm);
  }

  // ---- wall merchandising (canvas textures, lit shelf edges)
  const makeupT = tex(512, 256, (g, w, h) => {
    g.fillStyle = '#141416';
    g.fillRect(0, 0, w, h);
    for (let r = 0; r < 5; r++) {
      const y = 14 + r * 48;
      g.fillStyle = '#fffaf0';
      g.fillRect(0, y + 38, w, 3);
      let x = 6;
      while (x < w - 10) {
        const kind = Math.random();
        if (kind < 0.4) {
          // lipsticks
          for (let k = 0; k < 4; k++) {
            g.fillStyle = '#2a2a2c';
            g.fillRect(x + k * 6, y + 22, 4, 16);
            g.fillStyle = pick(['#b3122e', '#d2416b', '#8c1f3c', '#e86a7c', '#c4553a', '#6b1730', '#f09aa8']);
            g.fillRect(x + k * 6, y + 14, 4, 8);
          }
          x += 28;
        } else if (kind < 0.7) {
          // palettes
          g.fillStyle = pick(['#1d1d1f', '#e8d9c8', '#d7b98f', '#2b2b2e']);
          g.fillRect(x, y + 20, 26, 18);
          for (let k = 0; k < 6; k++) {
            g.fillStyle = pick([
              '#c98a6b',
              '#8a5a44',
              '#e3b8a0',
              '#6e4a3a',
              '#b7795b',
              '#d9a0a8',
              '#a37f6a',
              '#f0d0b8',
            ]);
            g.fillRect(x + 2 + (k % 3) * 8, y + 22 + Math.floor(k / 3) * 8, 6, 6);
          }
          x += 32;
        } else {
          // foundation bottles in a shade run
          for (let k = 0; k < 5; k++) {
            g.fillStyle = `hsl(${24 + k * 2},${40 + k * 4}%,${78 - k * 9}%)`;
            g.fillRect(x + k * 7, y + 16, 6, 22);
            g.fillStyle = '#1d1d1f';
            g.fillRect(x + k * 7 + 1, y + 11, 4, 5);
          }
          x += 40;
        }
      }
    }
  });
  const skinT = tex(512, 256, (g, w, h) => {
    g.fillStyle = '#f6f4f1';
    g.fillRect(0, 0, w, h);
    for (let r = 0; r < 5; r++) {
      const y = 14 + r * 48;
      g.fillStyle = '#d9d5cf';
      g.fillRect(0, y + 38, w, 3);
      let x = 6;
      while (x < w - 16) {
        const c = pick(['#ffffff', '#e9f1ee', '#f3e3dc', '#dfe7f3', '#f6efd9', '#e7e0f2', '#cfe3d6']);
        const tall = Math.random() < 0.5;
        g.fillStyle = c;
        g.fillRect(x, y + (tall ? 8 : 20), 12, tall ? 30 : 18);
        g.fillStyle = pick(['#b9b4ab', '#8fa39a', '#c9a45a', '#9a8f86']);
        g.fillRect(x + 2, y + (tall ? 4 : 16), 8, 4);
        x += 16;
      }
    }
  });
  const wallPanel = (t, w, h, x, y, z, ry, rep) => {
    t.repeat.set(rep, 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam(0xffffff, { map: t }));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    sc.add(m);
  };
  // makeup: the north wall, full width; header sign above
  B(WD - 0.3, 2.9, 0.4, black, xc, 1.45, SE.z1 + 0.2, true);
  S_(SE.x1, SE.x2 - 0.15, SE.z1, SE.z1 + 0.42, 0, 3);
  wallPanel(makeupT, WD - 0.5, 2.5, xc, 1.5, SE.z1 + 0.41, 0, 3);
  B(WD - 0.3, 0.04, 0.05, lightM, xc, 2.92, SE.z1 + 0.42);
  {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.36),
      new THREE.MeshBasicMaterial({ map: word('MAKEUP', 512, 72, 46) }),
    );
    s.position.set(xc, 3.45, SE.z1 + 0.05);
    sc.add(s);
  }
  // skincare: the south wall, west of checkout
  B(6.2, 2.9, 0.4, white, -20.8, 1.45, SE.z2 - 0.2, true);
  S_(-23.9, -17.7, SE.z2 - 0.42, SE.z2, 0, 3);
  wallPanel(skinT, 6, 2.5, -20.8, 1.5, SE.z2 - 0.41, Math.PI, 2);
  {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.36),
      new THREE.MeshBasicMaterial({ map: word('SKINCARE', 512, 72, 46) }),
    );
    s.position.set(-20.8, 3.45, SE.z2 - 0.05);
    s.rotation.y = Math.PI;
    sc.add(s);
  }

  // ---- fragrance wall (west): black shelving with real glass bottles
  {
    const fx = SE.x1 + 0.35;
    B(0.6, 3.1, DP - 1.2, black, fx, 1.55, zc, true);
    S_(SE.x1, fx + 0.42, SE.z1, SE.z2, 0, 3.2);
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 0.36),
      new THREE.MeshBasicMaterial({ map: word('FRAGRANCE', 512, 72, 46) }),
    );
    s.position.set(SE.x1 + 0.05, 3.55, zc);
    s.rotation.y = Math.PI / 2;
    sc.add(s);
    const tints = [0xf3c98b, 0xf7e3c3, 0xe7b3c2, 0xbfd9e8, 0xd9c2f0, 0xf1f1ee, 0xd6e8c4, 0x6b2234, 0x1d1d1f];
    const shapes = [
      () => new THREE.BoxGeometry(0.07, 0.12, 0.07),
      () => new THREE.CylinderGeometry(0.04, 0.045, 0.13, 14),
      () => new THREE.SphereGeometry(0.06, 14, 10),
      () => new THREE.BoxGeometry(0.1, 0.09, 0.04),
      () => new THREE.CylinderGeometry(0.05, 0.035, 0.11, 6),
    ];
    for (let r = 0; r < 4; r++) {
      const y = 0.55 + r * 0.62;
      B(0.5, 0.025, DP - 1.3, lightM, fx + 0.31, y, zc);
      for (let z = SE.z1 + 0.85; z < SE.z2 - 0.8; z += 0.2) {
        if (Math.random() < 0.15) continue;
        const shape = Math.floor(Math.random() * shapes.length);
        const m = new THREE.Mesh(
          shapes[shape](),
          new THREE.MeshPhongMaterial({
            color: pick(tints),
            transparent: true,
            opacity: 0.82,
            specular: 0xffffff,
            shininess: 120,
          }),
        );
        const hh = shape === 2 ? 0.06 : 0.065;
        m.position.set(fx + 0.38, y + 0.013 + hh, z);
        sc.add(m);
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 0.035, 10),
          Math.random() < 0.6 ? gold : black,
        );
        cap.position.set(fx + 0.38, y + 0.013 + hh * 2 + 0.017, z);
        sc.add(cap);
      }
    }
  }

  // ---- tester islands: black base, white top, mirrors, testers
  const testerKinds = (x, z, kind) => {
    for (let k = 0; k < 9; k++) {
      const tx = x - 1.7 + k * 0.42;
      for (const side of [-1, 1]) {
        const tz = z + side * 0.3;
        if (kind === 'makeup') {
          if (k % 3 === 0) {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.11), black);
            p.position.set(tx, 0.92, tz);
            sc.add(p);
            for (let q = 0; q < 6; q++) {
              const d = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.015, 0.006, 8),
                lam(pick([0xc98a6b, 0x8a5a44, 0xe3b8a0, 0xb7795b, 0xd9a0a8, 0x6e4a3a])),
              );
              d.position.set(tx - 0.05 + (q % 3) * 0.05, 0.93, tz - 0.025 + Math.floor(q / 3) * 0.05);
              sc.add(d);
            }
          } else
            for (let q = 0; q < 5; q++) {
              const l = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.07, 8), black);
              l.position.set(tx - 0.08 + q * 0.04, 0.95, tz);
              sc.add(l);
              const tip = new THREE.Mesh(
                new THREE.CylinderGeometry(0.008, 0.009, 0.02, 8),
                lam(pick([0xb3122e, 0xd2416b, 0x8c1f3c, 0xe86a7c, 0xc4553a, 0xf09aa8])),
              );
              tip.position.set(tx - 0.08 + q * 0.04, 0.995, tz);
              sc.add(tip);
            }
        } else {
          const b = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.04, 0.12, 12),
            new THREE.MeshPhongMaterial({
              color: pick([0xf3c98b, 0xe7b3c2, 0xbfd9e8, 0xf1f1ee, 0xd9c2f0]),
              transparent: true,
              opacity: 0.85,
              specular: 0xffffff,
              shininess: 120,
            }),
          );
          b.position.set(tx, 0.97, tz);
          sc.add(b);
          const c = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 10), gold);
          c.position.set(tx, 1.045, tz);
          sc.add(c);
          if (k % 3 === 1) {
            const card = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.06), white);
            card.position.set(tx + 0.12, 0.96, tz);
            sc.add(card);
          }
        }
      }
    }
  };
  for (const [z, kind] of [
    [-26.9, 'makeup'],
    [-21.1, 'fragrance'],
  ]) {
    const x = -19.6;
    B(4.1, 0.82, 1, black, x, 0.41, z);
    B(4.2, 0.06, 1.1, white, x, 0.85, z);
    S_(x - 2.1, x + 2.1, z - 0.55, z + 0.55, 0, 1.2);
    testerKinds(x, z, kind);
    for (const dx of [-1.5, 1.5]) {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), chrome);
      st.position.set(x + dx, 1.05, z);
      sc.add(st);
      const mir = new THREE.Mesh(
        new THREE.CircleGeometry(0.16, 24),
        new THREE.MeshPhongMaterial({
          color: 0xdfe8ee,
          specular: 0xffffff,
          shininess: 140,
          side: THREE.DoubleSide,
        }),
      );
      mir.position.set(x + dx, 1.3, z);
      sc.add(mir);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 6, 24), black);
      rim.position.copy(mir.position);
      sc.add(rim);
    }
    const t = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.24),
      new THREE.MeshBasicMaterial({ map: word(kind === 'makeup' ? 'TRY ME' : 'TESTERS', 384, 64, 34) }),
    );
    t.position.set(x + 2.06, 0.62, z);
    t.rotation.y = Math.PI / 2;
    sc.add(t);
  }

  // ---- beauty studio (northeast corner): two chairs at lit vanities
  for (const x of [-15.6, -13.6]) {
    const z = SE.z1 + 2.2;
    B(1.5, 0.05, 0.5, white, x, 0.95, z - 1.05);
    B(1.5, 0.9, 0.08, black, x, 0.5, z - 1.25);
    S_(x - 0.75, x + 0.75, z - 1.35, z - 0.8, 0, 1.2);
    const mir = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.1),
      new THREE.MeshPhongMaterial({ color: 0xe6eef2, specular: 0xffffff, shininess: 140 }),
    );
    mir.position.set(x, 1.75, SE.z1 + 0.62);
    sc.add(mir);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), lightM);
      b.position.set(x + Math.cos(a) * 0.6, 1.75 + Math.sin(a) * 0.65, SE.z1 + 0.66);
      sc.add(b);
    }
    // salon chair
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 18), chrome);
    base.position.set(x, 0.03, z);
    sc.add(base);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 10), chrome);
    post.position.set(x, 0.27, z);
    sc.add(post);
    B(0.52, 0.1, 0.5, black, x, 0.55, z);
    B(0.52, 0.6, 0.08, black, x, 0.88, z + 0.25);
    S_(x - 0.32, x + 0.32, z - 0.3, z + 0.32, 0, 1.2);
  }
  {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.32),
      new THREE.MeshBasicMaterial({ map: word('BEAUTY STUDIO', 512, 64, 34) }),
    );
    s.position.set(-14.6, 2.6, SE.z1 + 0.62);
    sc.add(s);
  }

  // ---- checkout (southeast): black counter, registers, a queue rail with minis
  {
    const cx = -14.8,
      cz = SE.z2 - 1.3;
    B(3.2, 1, 0.8, black, cx, 0.5, cz);
    B(3.3, 0.05, 0.9, white, cx, 1.02, cz);
    S_(cx - 1.65, cx + 1.65, cz - 0.45, cz + 0.45, 0, 1.2);
    for (const dx of [-0.8, 0.8]) {
      B(0.35, 0.25, 0.3, lam(0x2b2b2d), cx + dx, 1.17, cz);
      B(0.3, 0.02, 0.22, new THREE.MeshBasicMaterial({ color: 0x8fd0ff }), cx + dx, 1.31, cz - 0.02);
    }
    // queue rail lined with mini-size bins
    B(3.6, 0.9, 0.35, white, -17, 0.45, cz - 1.6);
    S_(-18.8, -15.2, cz - 1.8, cz - 1.4, 0, 1.2);
    for (let k = 0; k < 8; k++) {
      const bin = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.26), black);
      bin.position.set(-18.55 + k * 0.44, 0.94, cz - 1.6);
      sc.add(bin);
      for (let q = 0; q < 4; q++) {
        const mini = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.08, 0.05),
          lam(pick([0xd2416b, 0xf3c98b, 0xbfd9e8, 0x1d1d1f, 0xe7b3c2, 0xf6efd9])),
        );
        mini.position.set(-18.68 + k * 0.44 + q * 0.08, 1.0, cz - 1.6 + rand(-0.06, 0.06));
        sc.add(mini);
      }
    }
    const ck = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.3),
      new THREE.MeshBasicMaterial({ map: word('CHECKOUT', 384, 64, 34) }),
    );
    ck.position.set(cx, 2.5, cz - 0.01);
    ck.rotation.y = Math.PI;
    sc.add(ck);
    for (const dx of [-0.7, 0.7]) B(0.02, 2.4, 0.02, black, cx + dx, 3.7, cz);
  }

  // ---- people: cast members in black, a few shoppers testing products
  const cast = (x, z, r) => {
    const h = human({
      skin: pick(SKINS),
      shirt: '#121214',
      pants: '#121214',
      shoe: '#121214',
      hair: pick(['#1b1410', '#3a2a1e', '#c9a46a', '#6b4a2a']),
    });
    h.g.position.set(x, 0, z);
    h.g.rotation.y = r;
    sc.add(h.g);
    return h;
  };
  cast(-14.8, SE.z2 - 0.55, Math.PI);
  cast(-17.3, -24, Math.PI / 2);
  cast(-14.6, SE.z1 + 1.4, 0);
  // seated client in the beauty studio
  {
    const h = mkH();
    h.g.position.set(-15.6, 0.18, SE.z1 + 2.2);
    h.g.rotation.y = Math.PI;
    h.legL.rotation.x = h.legR.rotation.x = -1.45;
    sc.add(h.g);
  }
  for (const [x, z, r] of [
    [-19.8, -25.95, Math.PI],
    [-18.6, -22.05, 0],
    [-21.4, -27.85, 0],
    [-22.6, -24.6, -Math.PI / 2],
  ]) {
    const h = mkH();
    h.g.position.set(x, 0, z);
    h.g.rotation.y = r;
    h.armR.rotation.x = -0.9;
    sc.add(h.g);
  }
  {
    const h = mkH();
    sc.add(h.g);
    npcs.push({ h, ax: 'x', c: -24, a: -22.5, b: -13.2, y: 0, t: rand(-22, -14), dir: 1, spd: 0.7 });
  }

  const area = (p) =>
    p.z < -26.2 && p.x > -17
      ? 'Beauty studio'
      : p.x < -22
        ? 'Fragrance'
        : p.z < -25.4
          ? 'Makeup'
          : p.z > -20.4 && p.x > -17.6
            ? 'Checkout'
            : p.z > -20.4
              ? 'Skincare'
              : 'Store · Level 1';
  Object.assign(ctx, { SE, sephoraArea: area });
}
