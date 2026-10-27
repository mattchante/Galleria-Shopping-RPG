// Storefront helpers and the level-1 shops, including the east-side tech flagship.
import * as THREE from 'three';
import { lam, tex } from '../../core/helpers.js';
import { rrect, textTex } from '../../world/signals.js';

export function buildShops(ctx) {
  const { B, L2, W, metal, sc, stone, white } = ctx;
  // ---- storefront helpers
  const shopTex = (hue) =>
    tex(
      256,
      192,
      (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, `hsl(${hue},25%,88%)`);
        gr.addColorStop(0.7, `hsl(${hue},30%,72%)`);
        gr.addColorStop(1, `hsl(${hue},20%,55%)`);
        g.fillStyle = gr;
        g.fillRect(0, 0, w, h);
        g.fillStyle = `hsl(${hue},20%,62%)`;
        for (let y = 46; y < 130; y += 26) g.fillRect(16, y, w - 32, 4);
        for (let i = 0; i < 46; i++) {
          g.fillStyle = `hsl(${(hue + Math.random() * 80 + 320) % 360},${(40 + Math.random() * 40) | 0}%,${(35 + Math.random() * 35) | 0}%)`;
          g.fillRect(
            20 + Math.random() * (w - 46),
            28 + Math.floor(Math.random() * 3) * 26,
            6 + Math.random() * 10,
            18,
          );
        }
        g.fillStyle = 'rgba(40,40,40,.5)';
        for (const x of [56, 128, 200]) {
          g.beginPath();
          g.arc(x, 124, 7, 0, 7);
          g.fill();
          g.fillRect(x - 7, 132, 14, 40);
        }
        g.fillStyle = 'rgba(255,255,255,.18)';
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(70, 0);
        g.lineTo(0, 130);
        g.fill();
      },
      false,
    );
  const STY = [
    { bg: '#1e1c1a', fg: '#d9b46a', f: '600 40px "Cormorant Garamond", Georgia, serif' },
    { bg: '#f4f1ea', fg: '#22201d', f: '800 34px Overpass, Arial, sans-serif' },
    { bg: '#2c4a3e', fg: '#f4f1ea', f: '800 34px Overpass, Arial, sans-serif' },
    { bg: '#7a2430', fg: '#f6eee2', f: '600 40px "Cormorant Garamond", Georgia, serif' },
    { bg: '#24364f', fg: '#f4f1ea', f: '600 40px "Cormorant Garamond", Georgia, serif' },
  ];
  const sign = (t, st, w) =>
    textTex(512, 64, (g, W2, H) => {
      g.fillStyle = st.bg;
      g.fillRect(0, 0, W2, H);
      g.fillStyle = st.fg;
      g.font = st.f;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '4px';
      } catch (e) {}
      g.fillText(t, W2 / 2, H / 2 + 2);
    });
  const face = (m, s) => {
    m.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2;
    sc.add(m);
    return m;
  };
  const zs = [-60, -48, -36, -24, -12, 0];
  // ---- level 1: shops, with one double-width tech flagship on the east side facing the rink
  const L1 = {
    // east z -18..6 is the walk-in pet store (pet-store.js); west z -12 is plain wall
    1: ['SOLE DISTRICT', 'ATELIER NOIR', null, null, null, null],
    '-1': [null, null, 'PARLOR SWEETS', null, null, null],
  };
  for (const s of [-1, 1]) {
    const fx = s * W;
    L1[s].forEach((nm, i) => {
      if (!nm) return;
      const zc = zs[i],
        st = STY[(i + (s > 0 ? 0 : 2)) % STY.length];
      face(
        new THREE.Mesh(
          new THREE.PlaneGeometry(10.6, 3.9),
          new THREE.MeshBasicMaterial({ map: shopTex((i * 53 + (s > 0 ? 0 : 180)) % 360) }),
        ),
        s,
      ).position.set(fx - s * 0.03, 2.05, zc);
      face(
        new THREE.Mesh(new THREE.PlaneGeometry(9, 1), new THREE.MeshBasicMaterial({ map: sign(nm, st) })),
        s,
      ).position.set(fx - s * 0.05, 4.55, zc);
      for (const dz of [-5.3, -1.8, 1.8, 5.3]) B(0.08, 3.9, 0.08, metal, fx - s * 0.08, 2.05, zc + dz);
      B(0.08, 0.08, 10.6, metal, fx - s * 0.08, 4.02, zc);
    });
    for (let z = -66; z <= 6; z += 12) {
      if ((s > 0 && (z === -30 || z === -6)) || (s < 0 && z < -40)) continue;
      B(0.5, L2 - 0.02, 1.4, stone, fx - s * 0.25, L2 / 2, z);
    }
  }
  {
    // tech flagship: white, full-height glass, long wood tables
    const techT = tex(
      512,
      192,
      (g, w, h) => {
        g.fillStyle = '#fbfbfa';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#eeeeec';
        g.fillRect(0, 0, w, 26);
        g.fillStyle = '#ffffff';
        for (let x = 20; x < w; x += 70) g.fillRect(x, 6, 46, 8);
        g.fillStyle = '#e6e4df';
        g.fillRect(0, 40, w, 70);
        g.fillStyle = '#d9d7d2';
        for (let x = 30; x < w; x += 96) {
          g.fillRect(x, 52, 60, 40);
        }
        g.fillStyle = '#b98f5e';
        for (const x of [40, 200, 360]) {
          g.fillRect(x, 128, 120, 10);
          g.fillStyle = '#8f6d47';
          g.fillRect(x + 8, 138, 6, 40);
          g.fillRect(x + 106, 138, 6, 40);
          g.fillStyle = '#b98f5e';
        }
        g.fillStyle = '#26292d';
        for (const x of [40, 200, 360]) for (let k = 0; k < 5; k++) g.fillRect(x + 8 + k * 23, 118, 12, 9);
        g.fillStyle = 'rgba(30,30,32,.45)';
        for (const x of [120, 290, 450]) {
          g.beginPath();
          g.arc(x, 104, 7, 0, 7);
          g.fill();
          g.fillRect(x - 7, 112, 14, 58);
        }
        g.fillStyle = 'rgba(255,255,255,.22)';
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(90, 0);
        g.lineTo(0, 150);
        g.fill();
      },
      false,
    );
    const zc = -30,
      fx = W;
    face(
      new THREE.Mesh(new THREE.PlaneGeometry(23.4, 5.2), new THREE.MeshBasicMaterial({ map: techT })),
      1,
    ).position.set(fx - 0.03, 2.6, zc);
    for (const dz of [-11.7, -7.8, -3.9, 0, 3.9, 7.8, 11.7])
      B(0.05, 5.2, 0.05, lam(0xdfe3e6), fx - 0.06, 2.6, zc + dz);
    B(0.4, L2, 1, white, fx - 0.2, L2 / 2, zc - 12.2);
    B(0.4, L2, 1, white, fx - 0.2, L2 / 2, zc + 12.2);
    const markT = textTex(256, 256, (g, w, h) => {
      g.fillStyle = '#ffffff';
      rrect(g, 16, 16, 224, 224, 48);
      g.fill();
      g.strokeStyle = '#c9ccd0';
      g.lineWidth = 14;
      g.beginPath();
      g.arc(128, 128, 62, 0, 7);
      g.stroke();
      g.fillStyle = '#c9ccd0';
      g.beginPath();
      g.arc(128, 128, 20, 0, 7);
      g.fill();
    });
    face(
      new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 1.4),
        new THREE.MeshBasicMaterial({ map: markT, transparent: true }),
      ),
      1,
    ).position.set(fx - 0.08, 4.6, zc);
  }
  Object.assign(ctx, { face, zs });
}
