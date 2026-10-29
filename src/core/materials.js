// Facade textures, shared materials, and flat/box/ribbon mesh builders.
import * as THREE from 'three';
import { scene } from './renderer.js';
import { MAPDRAW, SHAD, decal, lam, scaleUV, segAt, speckle, tex } from './helpers.js';

// minimap ops

/* ---------- textures & materials ---------- */
const T = {};
T.glass = tex(64, 64, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h * 0.78);
  gr.addColorStop(0, '#f4f7f9');
  gr.addColorStop(1, '#a8b2b9');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h * 0.78);
  g.fillStyle = '#7c858b';
  g.fillRect(0, h * 0.78, w, h * 0.22);
  g.fillStyle = '#545b60';
  g.fillRect(0, 0, 2, h);
  g.fillRect(0, h * 0.78, w, 2);
});
function aptTex(brick) {
  return tex(128, 128, (g, w, h) => {
    g.fillStyle = '#ececec';
    g.fillRect(0, 0, w, h);
    if (brick) {
      g.fillStyle = '#d2d2d2';
      for (let y = 0; y < h; y += 8) {
        g.fillRect(0, y, w, 1);
        for (let x = ((y / 8) % 2) * 8; x < w; x += 16) g.fillRect(x, y, 1, 8);
      }
    }
    speckle(g, w, h, 500, 0.12, '0,0,0');
    g.fillStyle = '#c9c9c9';
    g.fillRect(26, 18, 76, 76);
    const gr = g.createLinearGradient(30, 22, 98, 90);
    gr.addColorStop(0, '#5c6874');
    gr.addColorStop(0.5, '#2c343d');
    gr.addColorStop(1, '#3d4752');
    g.fillStyle = gr;
    g.fillRect(30, 22, 68, 68);
    g.fillStyle = '#c9c9c9';
    g.fillRect(62, 22, 3, 68);
    g.fillStyle = '#b4b4b4';
    g.fillRect(22, 94, 84, 6);
  });
}
T.apt = aptTex(false);
T.brick = aptTex(true);
T.stone = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#f2eee6';
  g.fillRect(0, 0, w, h);
  speckle(g, w, h, 700, 0.08, '60,40,20');
  g.fillStyle = '#d6cfc2';
  for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 2);
  g.fillRect(63, 0, 2, h);
  g.fillStyle = '#e2dbcf';
  g.fillRect(0, 96, w, 6);
});
T.garage = tex(128, 64, (g, w, h) => {
  g.fillStyle = '#d9d7d2';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2c2f33';
  g.fillRect(10, 22, 108, 42);
  g.fillStyle = '#bfbcb6';
  g.fillRect(0, 0, 10, h);
  g.fillRect(118, 0, 10, h);
  speckle(g, w, h, 300, 0.12, '0,0,0');
});
T.store = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#ebe6dc';
  g.fillRect(0, 0, w, h);
  speckle(g, w, h, 400, 0.1, '0,0,0');
  const gr = g.createLinearGradient(0, 70, 0, 128);
  gr.addColorStop(0, '#55636e');
  gr.addColorStop(1, '#26303a');
  g.fillStyle = gr;
  g.fillRect(6, 70, 116, 58);
  g.fillStyle = '#d9d4ca';
  g.fillRect(62, 70, 4, 58);
  g.fillStyle = '#b8b2a6';
  g.fillRect(0, 62, w, 6);
});
// plain stucco/EIFS wall with faint panel joints (big-box stores, fast food; windows are added per store)
T.blank = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#efeeea';
  g.fillRect(0, 0, w, h);
  speckle(g, w, h, 900, 0.06, '0,0,0');
  g.fillStyle = 'rgba(0,0,0,.08)';
  g.fillRect(0, 0, w, 1);
  g.fillRect(0, 0, 1, h);
});
const TEXCFG = {
  glass: { t: T.glass, bw: 3, fh: 4, phong: true },
  apt: { t: T.apt, bw: 3.6, fh: 3.3 },
  brick: { t: T.brick, bw: 3.6, fh: 3.3 },
  stone: { t: T.stone, bw: 9, fh: 5 },
  garage: { t: T.garage, bw: 9, fh: 3.2 },
  store: { t: T.store, bw: 7, fh: 0 },
  blank: { t: T.blank, bw: 6, fh: 6 },
};
const matCache = {};
function bmat(type, tint) {
  const k = type + tint;
  if (matCache[k]) return matCache[k];
  const c = TEXCFG[type];
  matCache[k] = c.phong
    ? new THREE.MeshPhongMaterial({ map: c.t, color: tint, specular: 0x5a6670, shininess: 70 })
    : lam(tint, { map: c.t });
  return matCache[k];
}
const ROOF = lam(0x8b8c88);
const concreteT = tex(64, 64, (g, w, h) => {
  g.fillStyle = '#c6c1b6';
  g.fillRect(0, 0, w, h);
  speckle(g, w, h, 500, 0.12, '0,0,0');
  g.fillStyle = '#a8a398';
  g.fillRect(0, 0, w, 1);
  g.fillRect(0, 0, 1, h);
});
const MAT = {
  sidewalk: decal(lam(0xffffff, { map: concreteT }), 4),
  pad: decal(lam(0xd8d3c8, { map: concreteT }), 1),
  grass: lam(0xffffff, {
    map: tex(128, 128, (g, w, h) => {
      g.fillStyle = '#7d8f4f';
      g.fillRect(0, 0, w, h);
      speckle(g, w, h, 2400, 0.25, '40,60,20');
      speckle(g, w, h, 900, 0.2, '200,190,120');
    }),
  }),
  asphalt: decal(
    lam(0xffffff, {
      map: tex(64, 64, (g, w, h) => {
        g.fillStyle = '#3d3f42';
        g.fillRect(0, 0, w, h);
        speckle(g, w, h, 700, 0.18, '255,255,255');
        speckle(g, w, h, 500, 0.25, '0,0,0');
      }),
    }),
    6,
  ),
  deck: lam(0xb9b4aa),
  barrier: lam(0xd2cec5),
  dark: lam(0x2b2e31),
  pole: lam(0x5f6468),
  trunk: lam(0x5a4532),
  canopy: lam(0xffffff),
};
function roadMat(r) {
  const W = Math.round(r.w * 8);
  const t = tex(W, 96, (g, w, h) => {
    g.fillStyle = '#3a3c3f';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1400, 0.16, '255,255,255');
    speckle(g, w, h, 1000, 0.25, '0,0,0');
    for (const L of r.lines) {
      const x = ((L.o + r.w / 2) / r.w) * w;
      if (L.s === 'y2') {
        g.fillStyle = '#e0b23a';
        g.fillRect(x - 3, 0, 2, h);
        g.fillRect(x + 1, 0, 2, h);
      } else if (L.s === 'y') {
        g.fillStyle = '#e0b23a';
        g.fillRect(x - 1, 0, 2, h);
      } else if (L.s === 'w') {
        g.fillStyle = '#e9e8e1';
        g.fillRect(x - 1, 0, 2, h);
      } else {
        g.fillStyle = '#e9e8e1';
        g.fillRect(x - 1, 0, 2, h * 0.25);
      }
    }
  });
  return decal(lam(0xffffff, { map: t }), r.horiz ? 2 : 3);
}
function flat(x1, x2, z1, z2, y, mat, tile, parent = scene) {
  const w = x2 - x1,
    d = z2 - z1;
  const geo = new THREE.PlaneGeometry(w, d);
  if (tile) scaleUV(geo, w / tile, d / tile);
  geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, mat);
  m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function box(w, h, d, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  SHAD(m);
  parent.add(m);
  return m;
}
function mapRect(x1, x2, z1, z2, col) {
  MAPDRAW.push({ k: 'r', x1, x2, z1, z2, col });
}
// A band that follows a road's polyline between offsets o0<o1, mitred at bends.
function ribbon(r, sa, sb, o0, o1, y, mat, mode) {
  const pts = [{ s: sa }];
  for (const g of r.segs) {
    if (g.s0 > sa && g.s0 < sb) pts.push({ s: g.s0, joint: true });
  }
  pts.push({ s: sb });
  const pos = [],
    uv = [],
    idx = [];
  pts.forEach((p, i) => {
    let g = segAt(r, p.s + (i === pts.length - 1 ? -1e-6 : 1e-6)),
      n = g.rt,
      m = 1;
    if (p.joint) {
      const gi = r.segs.indexOf(g),
        pg = r.segs[gi - 1] || g;
      n = [pg.rt[0] + g.rt[0], pg.rt[1] + g.rt[1]];
      const l = Math.hypot(n[0], n[1]) || 1;
      n = [n[0] / l, n[1] / l];
      m = 1 / Math.max(0.5, n[0] * g.rt[0] + n[1] * g.rt[1]);
    }
    const t = p.s - g.s0,
      bx = g.a[0] + g.d[0] * t,
      bz = g.a[1] + g.d[1] * t;
    for (const o of [o0, o1]) {
      pos.push(bx + n[0] * o * m, y, bz + n[1] * o * m);
      if (mode === 'road') uv.push((o - o0) / (o1 - o0), p.s / 12);
      else uv.push(o / 2, p.s / 2);
    }
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

export { MAT, ROOF, T, TEXCFG, bmat, box, flat, mapRect, ribbon, roadMat };
