// Apple store: walk-in storefront on the west side of level 1, product tables and links.
import { SKINS, human } from '../../life/people.js';
import * as THREE from 'three';
import { decal, lam, pick, rand, scaleUV, speckle, tex } from '../../core/helpers.js';
import { flat } from '../../core/materials.js';
import { signPlane, textTex } from '../../world/signals.js';

export function buildAppleStore(ctx) {
  const { B, RINKX, S_, W, mkH, npcs, sc, sol } = ctx;
  // ---- Apple store: double-width storefront on the west side of level 1, walk straight in
  const AP = { x1: -24, x2: -W, z1: -66, z2: -42, h: 4.9, ez1: -55.6, ez2: -52.4 };
  const PRODUCTS = [];
  {
    const stoneT = tex(128, 128, (g, w, h) => {
      g.fillStyle = '#d9d7d2';
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 900, 0.06, '60,60,60');
      speckle(g, w, h, 300, 0.05, '255,255,255');
      g.fillStyle = '#c9c6bf';
      g.fillRect(0, 0, w, 1.5);
      g.fillRect(0, 0, 1.5, h);
    });
    flat(AP.x1, AP.x2, AP.z1, AP.z2, 0.006, decal(lam(0xffffff, { map: stoneT }), 2), 1.6, sc);
    const wallW = lam(0xeeece7),
      oak = lam(0xc9a477),
      oakD = lam(0xb38c5e),
      alu = new THREE.MeshPhongMaterial({ color: 0xd5d8dc, specular: 0xffffff, shininess: 90 }),
      gray = new THREE.MeshPhongMaterial({ color: 0x6b6e73, specular: 0xcccccc, shininess: 70 }),
      black = lam(0x0e0e10);
    // shell
    B(AP.x2 - AP.x1 + 0.4, AP.h, 0.3, wallW, (AP.x1 + AP.x2) / 2, AP.h / 2, AP.z1 - 0.15, true);
    B(AP.x2 - AP.x1 + 0.4, AP.h, 0.3, wallW, (AP.x1 + AP.x2) / 2, AP.h / 2, AP.z2 + 0.15, true);
    B(0.3, AP.h, AP.z2 - AP.z1, wallW, AP.x1 - 0.15, AP.h / 2, (AP.z1 + AP.z2) / 2, true);
    // shell walls are solid (the room clamp only covers the doorway band)
    S_(AP.x1 - 0.3, AP.x2, AP.z1 - 0.3, AP.z1, 0, AP.h);
    S_(AP.x1 - 0.3, AP.x2, AP.z2, AP.z2 + 0.3, 0, AP.h);
    S_(AP.x1 - 0.3, AP.x1, AP.z1, AP.z2, 0, AP.h);
    const ceil = B(
      AP.x2 - AP.x1,
      0.1,
      AP.z2 - AP.z1,
      new THREE.MeshBasicMaterial({ color: 0xfbfaf6 }),
      (AP.x1 + AP.x2) / 2,
      AP.h + 0.05,
      (AP.z1 + AP.z2) / 2,
      true,
    );
    const gridT = tex(64, 64, (g, w, h) => {
      g.fillStyle = '#fffdf8';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#e6e3dc';
      g.fillRect(0, 0, w, 1);
      g.fillRect(0, 0, 1, h);
    });
    const lb = new THREE.Mesh(
      scaleUV(new THREE.PlaneGeometry(AP.x2 - AP.x1 - 0.2, AP.z2 - AP.z1 - 0.2), 10, 20).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: gridT }),
    );
    lb.position.set((AP.x1 + AP.x2) / 2, AP.h - 0.01, (AP.z1 + AP.z2) / 2);
    sc.add(lb);
    for (const z of [-60, -54, -48]) {
      const pl = new THREE.PointLight(0xffffff, 0.42, 16);
      pl.position.set(-18, 4.2, z);
      sc.add(pl);
    }
    // storefront: full-height glass with an open entrance in the middle, white fascia above
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
      [AP.z1, AP.ez1],
      [AP.ez2, AP.z2],
    ]) {
      const L = z2 - z1,
        zc = (z1 + z2) / 2;
      B(0.04, AP.h - 0.5, L, glassF, AP.x2 - 0.02, (AP.h - 0.5) / 2, zc);
      for (let z = z1; z <= z2 + 1e-6; z += L / 3)
        B(0.06, AP.h - 0.5, 0.04, lam(0xcfd2d6), AP.x2 - 0.02, (AP.h - 0.5) / 2, z);
      S_(AP.x2 - 0.15, AP.x2 + 0.1, z1, z2, 0, AP.h);
    }
    B(0.3, 0.6, AP.z2 - AP.z1 + 0.3, wallW, AP.x2 - 0.05, AP.h - 0.2, (AP.z1 + AP.z2) / 2);
    const brand = textTex(1024, 192, (g, w, h) => {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#1d1d1f';
      g.font = '600 112px Overpass, "Helvetica Neue", Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '4px';
      } catch (e) {}
      g.fillText('Apple', w / 2, h / 2 + 8);
    });
    const bs = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 0.82),
      new THREE.MeshBasicMaterial({ map: brand }),
    );
    bs.position.set(AP.x2 + 0.12, AP.h - 0.2, -54);
    bs.rotation.y = Math.PI / 2;
    sc.add(bs);
    // video wall at the back, with forum cubes facing it
    const vidT = tex(
      512,
      192,
      (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, w, h);
        gr.addColorStop(0, '#1a0f3a');
        gr.addColorStop(0.35, '#3b2a8f');
        gr.addColorStop(0.6, '#c2449b');
        gr.addColorStop(0.85, '#f08a4b');
        gr.addColorStop(1, '#1a0f3a');
        g.fillStyle = gr;
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 30; i++) {
          g.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
          g.beginPath();
          g.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 60, 0, 7);
          g.fill();
        }
        g.fillStyle = '#ffffff';
        g.font = '700 34px Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.fillText('Today at the Galleria', w / 2, h / 2 - 6);
        g.font = '500 20px Overpass, Arial, sans-serif';
        g.fillText('Free sessions · Photo walks · Coding basics', w / 2, h / 2 + 28);
      },
      true,
    );
    const vw = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.1), new THREE.MeshBasicMaterial({ map: vidT }));
    vw.position.set(AP.x1 + 0.14, 2.35, -54);
    vw.rotation.y = Math.PI / 2;
    sc.add(vw);
    B(0.12, 3.3, 9.2, black, AP.x1 + 0.06, 2.35, -54);
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 5; k++) {
        const x = AP.x1 + 2.2 + r * 0.9,
          z = -56.4 + k * 1.2;
        B(0.45, 0.45, 0.45, oakD, x, 0.225, z);
        S_(x - 0.24, x + 0.24, z - 0.24, z + 0.24, 0, 0.5);
      }
    // accessory bays on the side walls
    const accT = () =>
      tex(
        256,
        128,
        (g, w, h) => {
          g.fillStyle = '#f2f1ee';
          g.fillRect(0, 0, w, h);
          for (let r = 0; r < 3; r++) {
            const y = r * 42;
            g.fillStyle = '#d8d5ce';
            g.fillRect(0, y + 38, w, 3);
            for (let x = 8; x < w - 20; x += 22) {
              g.fillStyle = pick([
                '#1d1d1f',
                '#f5f5f7',
                '#e3d6c6',
                '#a7c4e0',
                '#f0b8c8',
                '#c9e4c5',
                '#ffd36e',
                '#9aa0a6',
              ]);
              g.fillRect(x, y + 12, 15, 25);
            }
          }
        },
        true,
      );
    for (const z of [AP.z1 + 0.02, AP.z2 - 0.02]) {
      const t = accT();
      t.repeat.set(3, 1);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), lam(0xffffff, { map: t }));
      m.position.set(-17.8, 1.5, z);
      m.rotation.y = z < -54 ? 0 : Math.PI;
      sc.add(m);
    }
    // ficus trees in round planters near the back
    for (const z of [-63.6, -44.4]) {
      const x = -22.2;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.7, 0.5, 24), oakD);
      p.position.set(x, 0.25, z);
      sc.add(p);
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.4, 8), lam(0x6b5440));
      tr.position.set(x, 1.6, z);
      sc.add(tr);
      for (let k = 0; k < 6; k++) {
        const c = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.55, 1),
          lam(pick([0x4f7a3a, 0x5b8a42, 0x466e33])),
        );
        c.position.set(x + rand(-0.5, 0.5), 2.6 + rand(-0.3, 0.5), z + rand(-0.5, 0.5));
        sc.add(c);
      }
      S_(x - 0.8, x + 0.8, z - 0.8, z + 0.8, 0, 3.5);
    }
    // devices
    const scrT = [
      ['#0b1a4a', '#3a63d8', '#9fc5ff'],
      ['#2a0a3a', '#9b3ccf', '#ff9ad5'],
      ['#04261f', '#1f9e7a', '#b8f5d8'],
      ['#3a1205', '#e0632a', '#ffd38a'],
      ['#0c0c10', '#3a3f52', '#b9c3e0'],
    ]
      .map(([a, b, c]) =>
        tex(
          256,
          170,
          (g, w, h) => {
            const gr = g.createRadialGradient(w * 0.35, h * 0.3, 10, w * 0.5, h * 0.5, w * 0.75);
            gr.addColorStop(0, c);
            gr.addColorStop(0.45, b);
            gr.addColorStop(1, a);
            g.fillStyle = gr;
            g.fillRect(0, 0, w, h);
            g.fillStyle = 'rgba(255,255,255,.18)';
            g.fillRect(0, 0, w, 7);
          },
          false,
        ),
      )
      .map((t) => new THREE.MeshBasicMaterial({ map: t }));
    const macbook = (pro, col) => {
      const g = new THREE.Group(),
        w = pro ? 0.36 : 0.31,
        d = pro ? 0.25 : 0.22,
        m = col === 'g' ? gray : alu;
      const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.014, d), m);
      base.position.y = 0.007;
      g.add(base);
      const kb = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.002, d * 0.42), black);
      kb.position.set(0, 0.015, -d * 0.08);
      g.add(kb);
      const tp = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.42, 0.002, d * 0.3),
        lam(col === 'g' ? 0x5d6065 : 0xc4c7cb),
      );
      tp.position.set(0, 0.015, d * 0.3);
      g.add(tp);
      const lid = new THREE.Group();
      lid.position.set(0, 0.014, -d / 2);
      lid.rotation.x = -0.32;
      g.add(lid);
      const back = new THREE.Mesh(new THREE.BoxGeometry(w, d * 0.98, 0.006), m);
      back.position.set(0, d * 0.49, -0.003);
      lid.add(back);
      const bz = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, d * 0.95), black);
      bz.position.set(0, d * 0.49, 0.0005);
      lid.add(bz);
      const sc2 = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.93, d * 0.86), pick(scrT));
      sc2.position.set(0, d * 0.5, 0.001);
      lid.add(sc2);
      return g;
    };
    const ipad = () => {
      const g = new THREE.Group();
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.08), alu);
      st.position.y = 0.01;
      g.add(st);
      const piv = new THREE.Group();
      piv.position.set(0, 0.02, -0.03);
      piv.rotation.x = -0.42;
      g.add(piv);
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.18, 0.007),
        pick([alu, gray, lam(0xb8c8e6), lam(0xe6c8d6)]),
      );
      body.position.y = 0.09;
      piv.add(body);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.235, 0.165), pick(scrT));
      s.position.set(0, 0.09, 0.0045);
      piv.add(s);
      return g;
    };
    const iphone = () => {
      const g = new THREE.Group();
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.05), alu);
      st.position.y = 0.008;
      g.add(st);
      const piv = new THREE.Group();
      piv.position.set(0, 0.015, -0.015);
      piv.rotation.x = -0.5;
      g.add(piv);
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.072, 0.15, 0.008),
        lam(pick([0x1d1d1f, 0xe9e4dc, 0x9fb4c9, 0xe3c9cf, 0xc9d9c2, 0x55606b])),
      );
      body.position.y = 0.075;
      piv.add(body);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.143), pick(scrT));
      s.position.set(0, 0.075, 0.0045);
      piv.add(s);
      const cam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.004), black);
      cam.position.set(-0.018, 0.125, -0.006);
      piv.add(cam);
      return g;
    };
    const TABLES = [
      {
        z: -61.5,
        n: 'iPhone',
        icon: 'phone',
        sub: 'Pick one up and try it',
        url: 'https://www.apple.com/iphone/',
        mk: () => iphone(),
        step: 0.42,
      },
      {
        z: -57.2,
        n: 'iPad',
        icon: 'tablet',
        sub: 'Every size, on display',
        url: 'https://www.apple.com/ipad/',
        mk: () => ipad(),
        step: 0.62,
      },
      {
        z: -50.8,
        n: 'MacBook Air',
        icon: 'laptop',
        sub: 'Silver and space gray on the table',
        url: 'https://www.apple.com/macbook-air/',
        mk: () => macbook(false, Math.random() < 0.5 ? 's' : 'g'),
        step: 0.72,
      },
      {
        z: -46.5,
        n: 'MacBook Pro',
        icon: 'laptop',
        sub: 'Open, powered on, ready to try',
        url: 'https://www.apple.com/macbook-pro/',
        mk: () => macbook(true, Math.random() < 0.5 ? 's' : 'g'),
        step: 0.78,
      },
    ];
    const tx1 = -20.8,
      tx2 = -15.2,
      tw = 1.15;
    for (const T of TABLES) {
      const xc = (tx1 + tx2) / 2,
        L = tx2 - tx1;
      B(L, 0.06, tw, oak, xc, 0.88, T.z);
      B(L - 0.3, 0.8, tw - 0.35, oakD, xc, 0.43, T.z);
      sol.push({ x1: tx1, x2: tx2, z1: T.z - tw / 2, z2: T.z + tw / 2, y0: 0, y1: 1.1 });
      for (const side of [-1, 1])
        for (let x = tx1 + 0.45; x < tx2 - 0.3; x += T.step) {
          const d = T.mk();
          d.position.set(x, 0.91, T.z + side * 0.32);
          d.rotation.y = side > 0 ? 0 : Math.PI;
          sc.add(d);
        }
      const card = textTex(256, 128, (g, w, h) => {
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#1d1d1f';
        g.font = '600 44px Overpass, "Helvetica Neue", Arial, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(T.n, w / 2, h / 2 - 6);
        g.font = '500 18px Overpass, Arial, sans-serif';
        g.fillStyle = '#6e6e73';
        g.fillText('Try it here', w / 2, h / 2 + 34);
      });
      const cd = signPlane(card, 0.42, 0.21);
      cd.position.set(tx2 - 0.18, 1.02, T.z);
      cd.rotation.y = Math.PI / 2;
      sc.add(cd);
      const lt = textTex(512, 128, (g, w, h) => {
        g.fillStyle = '#ffffff';
        g.font = '600 76px -apple-system, "Helvetica Neue", Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.shadowColor = 'rgba(0,0,0,.35)';
        g.shadowBlur = 14;
        g.fillText(T.n, w / 2, h / 2);
      });
      const sp = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: lt, transparent: true, opacity: 0, depthWrite: false }),
      );
      sp.scale.set(1.9, 0.48, 1);
      sp.position.set((tx1 + tx2) / 2, 2.05, T.z);
      sc.add(sp);
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(L + 0.3, tw + 0.3).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0x8ec5ff, transparent: true, opacity: 0, depthWrite: false }),
      );
      glow.position.set(xc, 0.012, T.z);
      sc.add(glow);
      PRODUCTS.push({
        n: T.n,
        sub: T.sub,
        icon: T.icon,
        url: T.url,
        x1: tx1,
        x2: tx2,
        z1: T.z - tw / 2,
        z2: T.z + tw / 2,
        sp,
        glow,
        lit: 0,
      });
    }
    // a Genius-style pickup counter near the front
    B(0.7, 1, 3, oak, -13.9, 0.5, -63.6);
    S_(-14.3, -13.5, -65.2, -62, 0, 1.2);
    // staff and shoppers in the store
    for (const [x, z, r] of [
      [-16.6, -60.6, Math.PI],
      [-19, -49.9, 0],
      [-14.8, -63.6, -Math.PI / 2],
    ]) {
      const h = human({
        skin: pick(SKINS),
        shirt: '#1f4fa3',
        pants: '#2b2f3a',
        shoe: '#e9e9e6',
        hair: pick(['#1b1410', '#3a2a1e', '#c9a46a']),
      });
      h.g.position.set(x, 0, z);
      h.g.rotation.y = r;
      sc.add(h.g);
    }
    for (const T of TABLES)
      for (let k = 0; k < 2; k++)
        if (Math.random() < 0.75) {
          const h = mkH();
          const side = k ? 1 : -1;
          h.g.position.set(rand(tx1 + 0.6, tx2 - 0.6), 0, T.z + side * 1.02);
          h.g.rotation.y = side > 0 ? Math.PI : 0;
          h.armL.rotation.x = h.armR.rotation.x = -0.55;
          sc.add(h.g);
        }
    for (const p of [
      { ax: 'x', c: -53.2, a: -21.5, b: -12.8 },
      { ax: 'z', c: -14, a: -60, b: -44 },
    ]) {
      const h = mkH();
      sc.add(h.g);
      npcs.push({ h, ...p, y: 0, t: rand(p.a, p.b), dir: 1, spd: rand(0.6, 0.9) });
    }
    RINKX.vid = vidT;
  }
  Object.assign(ctx, { AP, PRODUCTS });
}
