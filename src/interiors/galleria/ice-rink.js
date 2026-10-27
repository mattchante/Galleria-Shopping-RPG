// Ice rink: boards, gates, the Christmas tree, plus level-1 columns, planters, benches and the directory.
import * as THREE from 'three';
import { decal, lam, pick, rand, scaleUV, tex } from '../../core/helpers.js';
import { flat } from '../../core/materials.js';
import { signPlane, textTex } from '../../world/signals.js';

export function buildIceRink(ctx) {
  const { B, BI, L2, S_, dark, glassM, sc, stone, wood } = ctx;
  // ---- ice rink on level 1, under the vault
  const RINK = [-6.5, 6.5, -45, -27],
    RINKX = {};
  {
    const iceT = tex(
      256,
      256,
      (g, w, h) => {
        g.fillStyle = '#eef7fb';
        g.fillRect(0, 0, w, h);
        for (let i = 0; i < 220; i++) {
          g.strokeStyle = `rgba(150,180,200,${Math.random() * 0.25})`;
          g.beginPath();
          const x = Math.random() * w,
            y = Math.random() * h;
          g.moveTo(x, y);
          g.quadraticCurveTo(x + rand(-40, 40), y + rand(-40, 40), x + rand(-60, 60), y + rand(-60, 60));
          g.stroke();
        }
        g.fillStyle = 'rgba(200,40,50,.5)';
        g.fillRect(0, h / 2 - 3, w, 6);
        g.fillStyle = 'rgba(40,90,180,.4)';
        g.fillRect(0, h * 0.3, w, 5);
        g.fillRect(0, h * 0.7, w, 5);
      },
      false,
    );
    const ice = new THREE.Mesh(
      new THREE.BoxGeometry(13, 0.12, 18),
      new THREE.MeshPhongMaterial({ map: iceT, specular: 0xffffff, shininess: 140 }),
    );
    ice.position.set(0, 0.06, -36);
    sc.add(ice);
    const [x1, x2, z1, z2] = RINK,
      GZ = -36,
      GH = 1.1;
    const boardT = tex(64, 64, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#bfe6fa');
      gr.addColorStop(1, '#7cc3ea');
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.55)';
      g.fillRect(0, h - 7, w, 3);
      g.fillStyle = '#4f9fd1';
      g.fillRect(0, 0, 1, h);
    });
    const boardM = lam(0xffffff, { map: boardT }),
      capW = lam(0xffffff),
      capB = lam(0x1f6fc2),
      kick = lam(0x1f6fc2),
      postM = lam(0x1f6fc2);
    const wallSeg = (ax, c, a, b, side) => {
      const L = b - a,
        m = (a + b) / 2,
        X = ax === 'x' ? m : c,
        Z = ax === 'x' ? c : m,
        w = ax === 'x' ? L : 0.18,
        d = ax === 'x' ? 0.18 : L;
      const wm = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(w, 1.05, d), Math.max(1, L / 1.6), 1), boardM);
      wm.position.set(X, 0.525, Z);
      sc.add(wm);
      B(ax === 'x' ? L : 0.24, 0.16, ax === 'x' ? 0.24 : L, kick, X, 0.08, Z);
      B(ax === 'x' ? L + 0.1 : 0.3, 0.07, ax === 'x' ? 0.3 : L + 0.1, capW, X, 1.085, Z);
      B(ax === 'x' ? L + 0.1 : 0.1, 0.05, ax === 'x' ? 0.1 : L + 0.1, capB, X, 1.14, Z);
      const gp = new THREE.Mesh(
        new THREE.BoxGeometry(ax === 'x' ? L : 0.03, 0.9, ax === 'x' ? 0.03 : L),
        glassM,
      );
      gp.position.set(X, 1.6, Z);
      sc.add(gp);
      S_(X - w / 2 - 0.05, X + w / 2 + 0.05, Z - d / 2 - 0.05, Z + d / 2 + 0.05, 0, 2.1);
    };
    wallSeg('x', z1 - 0.09, x1 - 0.18, x2 + 0.18);
    wallSeg('x', z2 + 0.09, x1 - 0.18, x2 + 0.18);
    const gates = [];
    for (const sx of [-1, 1]) {
      const xw = sx < 0 ? x1 - 0.09 : x2 + 0.09;
      wallSeg('z', xw, z1, GZ - GH);
      wallSeg('z', xw, GZ + GH, z2);
      for (const gz of [GZ - GH, GZ + GH]) {
        B(0.22, 2.6, 0.22, postM, xw, 1.3, gz);
        S_(xw - 0.15, xw + 0.15, gz - 0.15, gz + 0.15, 0, 2.6);
      }
      B(0.22, 0.22, 2 * GH + 0.22, postM, xw, 2.6, GZ);
      const gt = textTex(512, 96, (g, w, h) => {
        g.fillStyle = '#1f6fc2';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#ffffff';
        g.font = '800 56px Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        try {
          g.letterSpacing = '10px';
        } catch (e) {}
        g.fillText('SKATE', w / 2 + 5, h / 2 + 3);
      });
      const gs = signPlane(gt, 1.9, 0.36);
      gs.position.set(xw, 2.95, GZ);
      gs.rotation.y = Math.PI / 2;
      sc.add(gs);
      for (const hz of [-1, 1]) {
        const piv = new THREE.Group();
        piv.position.set(xw, 0, GZ + hz * GH);
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, GH - 0.08), boardM);
        leaf.position.set(0, 0.6, -hz * (GH / 2));
        piv.add(leaf);
        const lc = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, GH - 0.08), capW);
        lc.position.set(0, 1.13, -hz * (GH / 2));
        piv.add(lc);
        sc.add(piv);
        gates.push({
          piv,
          hz,
          sx,
          open: 0,
          box: {
            x1: xw - 0.1,
            x2: xw + 0.1,
            z1: Math.min(GZ, GZ + hz * GH),
            z2: Math.max(GZ, GZ + hz * GH),
            y0: 0,
            y1: 1.3,
          },
        });
      }
    }
    RINKX.gates = gates;
    // mats to step from the floor onto the ice
    for (const sx of [-1, 1]) {
      const xw = sx < 0 ? x1 : x2;
      flat(
        Math.min(xw, xw + sx * 2.2),
        Math.max(xw, xw + sx * 2.2),
        GZ - GH,
        GZ + GH,
        0.015,
        decal(lam(0x2b2e33), 3),
        0,
        sc,
      );
    }
    // Christmas tree at center ice
    {
      const tx = 0,
        tz = -36,
        g = new THREE.Group();
      g.position.set(tx, 0.12, tz);
      sc.add(g);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.35, 24), lam(0xb8202a));
      base.position.y = 0.18;
      g.add(base);
      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.06, 24), lam(0xf4f2ed));
      skirt.position.y = 0.37;
      g.add(skirt);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1, 10), lam(0x5a3e28));
      trunk.position.y = 0.8;
      g.add(trunk);
      const greens = [0x1f5a32, 0x24663a, 0x2b7442, 0x1d5230];
      const tiers = [
        [2.3, 2.4, 1.2],
        [1.9, 2.1, 2.4],
        [1.5, 1.9, 3.5],
        [1.1, 1.7, 4.5],
        [0.7, 1.4, 5.4],
      ];
      tiers.forEach(([r, h, y], i) => {
        const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 20), lam(greens[i % 4]));
        c.position.y = y;
        c.castShadow = true;
        g.add(c);
      });
      const orn = [0xc8202a, 0xf2c230, 0x1f6fc2, 0xe8e4da, 0xb84a7a];
      const bulbs = [];
      tiers.forEach(([r, h, y]) => {
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2 + y,
            rr = r * 0.78,
            yy = y - h * 0.3;
          const o = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), lam(pick(orn)));
          o.position.set(Math.cos(a) * rr, yy, Math.sin(a) * rr);
          g.add(o);
          const bm = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), bm);
          const a2 = a + 0.26;
          b.position.set(Math.cos(a2) * (rr + 0.12), yy + 0.35, Math.sin(a2) * (rr + 0.12));
          g.add(b);
          bulbs.push({ m: bm, ph: rand(0, 6) });
        }
      });
      const starS = new THREE.Shape();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 ? 0.18 : 0.42,
          a = (k / 10) * Math.PI * 2 + Math.PI / 2;
        k ? starS.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starS.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      const star = new THREE.Mesh(
        new THREE.ExtrudeGeometry(starS, { depth: 0.08, bevelEnabled: false }),
        new THREE.MeshBasicMaterial({ color: 0xffd34a }),
      );
      star.position.y = 6.35;
      g.add(star);
      const tl = new THREE.PointLight(0xffd9a0, 0.55, 14);
      tl.position.y = 4;
      g.add(tl);
      const gifts = [
        [1.9, 0, 0.6, 0xc8202a],
        [-1.7, 0.9, 0.5, 0x1f6fc2],
        [0.4, -1.95, 0.45, 0xf2c230],
        [-1.2, -1.6, 0.55, 0x2f6b4e],
        [1.3, 1.6, 0.4, 0xe8e4da],
      ];
      for (const [x, z, sz, c] of gifts) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(sz, sz * 0.8, sz), lam(c));
        b.position.set(x, sz * 0.4, z);
        b.rotation.y = rand(0, 1);
        g.add(b);
        const rb = new THREE.Mesh(
          new THREE.BoxGeometry(sz + 0.02, sz * 0.82, 0.08),
          lam(c === 0xe8e4da ? 0xc8202a : 0xf4f2ed),
        );
        rb.position.copy(b.position);
        rb.rotation.y = b.rotation.y;
        g.add(rb);
      }
      S_(tx - 2.1, tx + 2.1, tz - 2.1, tz + 2.1, 0, 7);
      RINKX.tree = { star, bulbs };
    }
  }
  for (const s of [-1, 1])
    for (const z of [-64, -56, -40, -30, -1]) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, L2, 14), stone);
      c.position.set(s * BI, L2 / 2, z);
      sc.add(c);
      S_(s * BI - 0.35, s * BI + 0.35, z - 0.35, z + 0.35, 0, L2);
    }
  for (const s of [-1, 1])
    for (const z of [-60, -46, -30, -14, 0]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 0.7, 16), dark);
      p.position.set(s * 9.3, 0.35, z);
      sc.add(p);
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), lam(0x4f7a3a));
      f.position.set(s * 9.3, 1.2, z);
      f.scale.y = 1.3;
      sc.add(f);
      S_(s * 9.3 - 0.65, s * 9.3 + 0.65, z - 0.65, z + 0.65, 0, 2);
    }
  for (const s of [-1, 1])
    for (const z of [-52, -22, -7]) {
      B(0.6, 0.45, 2, wood, s * 9.3, 0.42, z);
      B(0.5, 0.4, 0.08, dark, s * 9.3, 0.2, z - 0.8);
      B(0.5, 0.4, 0.08, dark, s * 9.3, 0.2, z + 0.8);
      S_(s * 9.3 - 0.35, s * 9.3 + 0.35, z - 1.05, z + 1.05, 0, 1);
    }
  {
    const dT = textTex(
      256,
      512,
      (g, w, h) => {
        g.fillStyle = '#1b1d20';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#f2b33d';
        g.font = '800 30px Overpass, Arial, sans-serif';
        g.textAlign = 'center';
        g.fillText('DIRECTORY', w / 2, 48);
        g.font = '600 19px Overpass, Arial, sans-serif';
        g.fillStyle = '#e9e6df';
        g.textAlign = 'left';
        [
          'LEVEL 1',
          'Barnes & Noble · N',
          'Apple · W',
          'Tech flagship · E',
          'Ice rink · center',
          '',
          'LEVEL 2',
          'Food court · E & W',
          'Terrace seating',
          'Escalators · center',
        ].forEach((t, k) => {
          g.fillStyle = t.startsWith('LEVEL') ? '#f2b33d' : '#e9e6df';
          g.fillText(t, 24, 100 + k * 40);
        });
      },
      false,
    );
    B(1.3, 2.1, 0.4, dark, -4.5, 1.05, -58);
    const sP = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.8), new THREE.MeshBasicMaterial({ map: dT }));
    sP.position.set(-4.5, 1.15, -57.79);
    sc.add(sP);
    S_(-5.2, -3.8, -58.25, -57.75, 0, 2.2);
  }
  Object.assign(ctx, { RINK, RINKX });
}
