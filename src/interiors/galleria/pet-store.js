// Diamond’s Dogs: walk-in pet store on the east side of level 1 (where Bloom Beauty and Meridian Watch were).
// A cat adoption wall of cubbies on the back wall, a puppy playpen with toys and puppies that run around,
// shelves of toys and treats, and a checkout counter by the door.
import * as THREE from 'three';
import { lam, rand, speckle, tex } from '../../core/helpers.js';
import { flat } from '../../core/materials.js';
import { textTex } from '../../world/signals.js';
import { PANTS, SHIRTS, SKINS, human } from '../../life/people.js';

export function buildPetStore(ctx) {
  const { B, S_, W, L2, sc, face, glassM, metal } = ctx;
  // store shell: from the mall's east wall (x = W) back to x2; z1..z2 is the frontage between two pillars
  const PS = { x1: W, x2: 28, z1: -17.3, z2: 5.3, h: L2 - 0.05, ez1: -13, ez2: 1 };
  const PEN = { x1: 17, x2: 26.4, z1: -3.4, z2: 5.3 }; // its south side is the store wall
  const xc = (PS.x1 + PS.x2) / 2,
    zc = (PS.z1 + PS.z2) / 2,
    WD = PS.x2 - PS.x1,
    DP = PS.z2 - PS.z1;
  const wallM = lam(0xf6f1e7),
    teal = lam(0x2f8f8a),
    oak = lam(0xc39463),
    darkWood = lam(0x6b4a2e),
    lightM = new THREE.MeshBasicMaterial({ color: 0xfffbf0 });
  const sign = (txt, w, h, bg, fg, font) =>
    textTex(w, h, (g, W2, H) => {
      g.fillStyle = bg;
      g.fillRect(0, 0, W2, H);
      g.fillStyle = fg;
      g.font = font;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '4px';
      } catch (e) {}
      g.fillText(txt, W2 / 2, H / 2 + 2);
    });

  // ---- floor (warm plank vinyl), walls, ceiling and lights
  const plankT = tex(256, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 32) {
      g.fillStyle = `hsl(32,${32 + Math.random() * 10}%,${66 + Math.random() * 8}%)`;
      g.fillRect(0, y, w, 31);
      g.fillStyle = 'rgba(90,60,30,.35)';
      g.fillRect(0, y + 31, w, 1);
      g.fillRect(((y * 53) % w) | 0, y, 1, 31);
    }
    speckle(g, w, h, 500, 0.06, '80,50,20');
  });
  flat(PS.x1, PS.x2, PS.z1, PS.z2, 0.005, lam(0xffffff, { map: plankT }), 3, sc);
  B(WD, L2, 0.3, wallM, xc, L2 / 2, PS.z1 - 0.15, true);
  B(WD, L2, 0.3, wallM, xc, L2 / 2, PS.z2 + 0.15, true);
  B(0.3, L2, DP + 0.6, wallM, PS.x2 + 0.15, L2 / 2, zc, true);
  S_(PS.x1, PS.x2, PS.z1 - 0.3, PS.z1, 0, PS.h);
  S_(PS.x1, PS.x2, PS.z2, PS.z2 + 0.3, 0, PS.h);
  S_(PS.x2, PS.x2 + 0.3, PS.z1, PS.z2, 0, PS.h);
  // teal stripe round the walls
  B(WD, 0.35, 0.04, teal, xc, 3.1, PS.z1 + 0.02);
  B(WD, 0.35, 0.04, teal, xc, 3.1, PS.z2 - 0.02);
  B(0.04, 0.35, DP, teal, PS.x2 - 0.02, 3.1, zc);
  B(WD, 0.2, DP, wallM, xc, PS.h, zc, true);
  for (let x = PS.x1 + 2.5; x < PS.x2 - 1; x += 4)
    for (const z of [-13, -6, 1]) B(2.2, 0.05, 0.9, lightM, x, PS.h - 0.12, z);
  const pl = new THREE.PointLight(0xfff1dc, 0.45, 26);
  pl.position.set(xc, 4.6, zc);
  sc.add(pl);

  // ---- storefront: sign over the opening, glass display windows either side of the entrance
  face(
    new THREE.Mesh(
      new THREE.PlaneGeometry(12, 1.15),
      new THREE.MeshBasicMaterial({
        map: sign('DIAMOND’S DOGS', 1024, 96, '#2f8f8a', '#fff8ec', '800 54px Overpass, Arial, sans-serif'),
      }),
    ),
    1,
  ).position.set(W - 0.06, 4.6, (PS.ez1 + PS.ez2) / 2);
  for (const [z1, z2] of [
    [PS.z1, PS.ez1],
    [PS.ez2, PS.z2],
  ]) {
    B(0.06, 3.9, z2 - z1, glassM, W, 2.05, (z1 + z2) / 2);
    B(0.1, 0.1, z2 - z1, metal, W, 4.02, (z1 + z2) / 2);
    B(0.1, 0.1, z2 - z1, metal, W, 0.06, (z1 + z2) / 2);
    S_(W - 0.1, W + 0.1, z1, z2, 0, PS.h);
  }
  for (const z of [PS.ez1, PS.ez2]) B(0.12, 3.9, 0.12, metal, W, 2.05, z);
  B(0.12, 0.12, PS.ez2 - PS.ez1, metal, W, 4.02, (PS.ez1 + PS.ez2) / 2);

  // ---- animals
  const furM = {};
  const fur = (c) => (furM[c] = furM[c] || lam(c));
  const eyeM = lam(0x111111),
    noseM = lam(0x2a1a1a),
    pinkM = lam(0xe9a3a8);
  const ball = (r, w = 12) => new THREE.SphereGeometry(r, w, Math.max(6, w - 4));
  function cat(col, sitting) {
    const g = new THREE.Group(),
      m = fur(col);
    const body = new THREE.Mesh(ball(1), m);
    body.scale.set(0.15, 0.14, 0.26);
    body.position.set(0, 0.15, 0);
    if (sitting) {
      body.rotation.x = -0.9;
      body.position.set(0, 0.2, -0.04);
    }
    const head = new THREE.Mesh(ball(0.11), m);
    head.position.set(0, sitting ? 0.42 : 0.26, sitting ? 0.06 : 0.25);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), m);
      ear.position.set(s * 0.06, 0.09, -0.01);
      head.add(ear);
      const eye = new THREE.Mesh(ball(0.015, 6), lam(0x9bc23c));
      eye.position.set(s * 0.04, 0.02, 0.095);
      head.add(eye);
    }
    const nose = new THREE.Mesh(ball(0.012, 6), pinkM);
    nose.position.set(0, -0.01, 0.11);
    head.add(nose);
    const tail = new THREE.Group();
    tail.position.set(0, 0.12, -0.22);
    const tm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.32, 6), m);
    tm.position.y = 0.16;
    tail.add(tm);
    tail.rotation.x = sitting ? -0.4 : -1.1;
    g.add(body, head, tail);
    return { g, head, tail, ph: rand(0, 6) };
  }
  function puppy(col, spot, sc0) {
    const g = new THREE.Group(),
      m = fur(col),
      m2 = fur(spot || col);
    const body = new THREE.Mesh(ball(1), m);
    body.scale.set(0.17, 0.15, 0.27);
    body.position.y = 0.3;
    const head = new THREE.Group();
    head.position.set(0, 0.45, 0.25);
    const skull = new THREE.Mesh(ball(0.14), m);
    const snout = new THREE.Mesh(ball(0.07, 8), m2);
    snout.scale.set(1, 0.8, 1.2);
    snout.position.set(0, -0.04, 0.12);
    const nose = new THREE.Mesh(ball(0.025, 6), noseM);
    nose.position.set(0, -0.02, 0.2);
    head.add(skull, snout, nose);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.09), m2);
      ear.position.set(s * 0.13, -0.02, -0.01);
      ear.rotation.z = s * 0.25;
      head.add(ear);
      const eye = new THREE.Mesh(ball(0.018, 6), eyeM);
      eye.position.set(s * 0.055, 0.04, 0.12);
      head.add(eye);
    }
    const legs = [];
    for (const [lx, lz] of [
      [-0.09, 0.14],
      [0.09, 0.14],
      [-0.09, -0.14],
      [0.09, -0.14],
    ]) {
      const piv = new THREE.Group();
      piv.position.set(lx, 0.24, lz);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.24, 6), m2);
      leg.position.y = -0.12;
      piv.add(leg);
      g.add(piv);
      legs.push(piv);
    }
    const tail = new THREE.Group();
    tail.position.set(0, 0.36, -0.25);
    const tm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.18, 6), m);
    tm.position.y = 0.09;
    tail.add(tm);
    tail.rotation.x = -0.6;
    g.add(body, head, tail);
    g.scale.setScalar(sc0);
    return { g, head, tail, legs };
  }

  // ---- cat adoption wall: 5 x 3 cubbies with wire fronts on the back wall
  const CW = { z1: -15.6, z2: -3.6, x: PS.x2 - 0.9, rows: [0.35, 1.2, 2.05], rh: 0.78 };
  const cubbyM = lam(0xfbf8f1),
    wireM = lam(0x9aa0a6),
    padM = [lam(0xd96c5f), lam(0x6fa3c9), lam(0xe0b84f), lam(0x86b06a)];
  const nCol = 5,
    cwW = (CW.z2 - CW.z1) / nCol;
  // open wooden frame: back panel, top, ends and dividers (the cubbies sit inside it)
  {
    const zm = (CW.z1 + CW.z2) / 2,
      len = CW.z2 - CW.z1 + 0.2;
    B(0.06, 2.95, len, darkWood, PS.x2 - 0.03, 1.475, zm, true);
    B(0.95, 0.12, len, darkWood, PS.x2 - 0.475, 2.95, zm);
    B(0.95, 0.35, len, darkWood, PS.x2 - 0.475, 0.175, zm);
    for (let c = 0; c <= nCol; c++) B(0.95, 2.95, 0.06, darkWood, PS.x2 - 0.475, 1.475, CW.z1 + c * cwW);
  }
  S_(PS.x2 - 0.95, PS.x2, CW.z1 - 0.1, CW.z2 + 0.1, 0, 3);
  const CATS = [];
  const catCols = [0xe0a050, 0x2b2b2b, 0xd8d4cc, 0x8c8c90, 0xb5784a, 0xf2efe8, 0x5b4636];
  let ci = 0;
  for (let c = 0; c < nCol; c++)
    for (const y0 of CW.rows) {
      const z = CW.z1 + cwW * (c + 0.5),
        x = PS.x2 - 0.92;
      // white cubby with a coloured cushion, then a wire door (vertical bars) on the front
      B(0.04, CW.rh, cwW - 0.1, cubbyM, x + 0.86, y0 + CW.rh / 2, z);
      B(0.82, 0.04, cwW - 0.1, cubbyM, x + 0.45, y0 + 0.02, z);
      B(0.6, 0.06, cwW - 0.5, padM[(c + ci) % padM.length], x + 0.5, y0 + 0.07, z);
      for (let k = -4; k <= 4; k++)
        B(0.02, CW.rh - 0.06, 0.02, wireM, x + 0.02, y0 + CW.rh / 2, z + k * 0.24);
      B(0.03, 0.03, cwW - 0.1, wireM, x + 0.02, y0 + CW.rh - 0.04, z);
      B(0.03, 0.03, cwW - 0.1, wireM, x + 0.02, y0 + 0.06, z);
      if (ci++ % 4 === 3) continue; // a few empty cubbies
      const k = cat(catCols[ci % catCols.length], Math.random() < 0.5);
      k.g.position.set(x + 0.45, y0 + 0.1, z + rand(-0.4, 0.4));
      k.g.rotation.y = -Math.PI / 2 + rand(-0.6, 0.6);
      sc.add(k.g);
      CATS.push(k);
    }
  face(
    new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 0.7),
      new THREE.MeshBasicMaterial({
        map: sign(
          'CATS · MEET YOUR NEW FRIEND',
          1024,
          112,
          '#fff8ec',
          '#2f8f8a',
          '800 52px Overpass, Arial, sans-serif',
        ),
      }),
    ),
    1,
  ).position.set(PS.x2 - 0.05, 3.55, (CW.z1 + CW.z2) / 2);
  // a cat tree beside the wall with one cat on top
  {
    const tx = PS.x2 - 1.1,
      tz = 1.5;
    const carpet = lam(0xcbb79a);
    B(0.9, 0.08, 0.9, carpet, tx, 0.04, tz);
    B(0.16, 1.9, 0.16, lam(0xb89c72), tx, 0.95, tz);
    B(0.6, 0.06, 0.6, carpet, tx, 1.0, tz);
    B(0.7, 0.06, 0.7, carpet, tx, 1.9, tz);
    S_(tx - 0.45, tx + 0.45, tz - 0.45, tz + 0.45, 0, 2);
    const k = cat(0xe0a050, false);
    k.g.position.set(tx, 1.93, tz);
    k.g.rotation.y = -2.2;
    sc.add(k.g);
    CATS.push(k);
  }

  // ---- puppy playpen: white fence, turf mat, beds, bowls and toys
  const turfT = tex(64, 64, (g, w, h) => {
    g.fillStyle = '#6fa356';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 900, 0.3, '30,70,20');
    speckle(g, w, h, 400, 0.3, '170,210,120');
  });
  flat(PEN.x1, PEN.x2, PEN.z1, PEN.z2, 0.02, lam(0xffffff, { map: turfT }), 1.5, sc);
  const fenceM = lam(0xfdfcf8);
  const fence = (x1, x2, z1, z2) => {
    const len = Math.max(x2 - x1, z2 - z1),
      alongX = x2 - x1 > z2 - z1;
    B(alongX ? len : 0.08, 0.08, alongX ? 0.08 : len, fenceM, (x1 + x2) / 2, 0.92, (z1 + z2) / 2);
    B(alongX ? len : 0.08, 0.06, alongX ? 0.06 : len, fenceM, (x1 + x2) / 2, 0.15, (z1 + z2) / 2);
    B(alongX ? len : 0.02, 0.72, alongX ? 0.02 : len, glassM, (x1 + x2) / 2, 0.52, (z1 + z2) / 2);
    for (let t = 0; t <= len + 1e-6; t += 0.9)
      B(0.07, 0.96, 0.07, fenceM, alongX ? x1 + t : x1, 0.48, alongX ? z1 : z1 + t);
    S_(x1 - 0.06, x2 + 0.06, z1 - 0.06, z2 + 0.06, 0, 1);
  };
  fence(PEN.x1, PEN.x2, PEN.z1, PEN.z1);
  fence(PEN.x1, PEN.x1, PEN.z1, PEN.z2);
  fence(PEN.x2, PEN.x2, PEN.z1, PEN.z2);
  face(
    new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.55),
      new THREE.MeshBasicMaterial({
        map: sign('PUPPY PLAYPEN', 512, 84, '#2f8f8a', '#fff8ec', '800 44px Overpass, Arial, sans-serif'),
      }),
    ),
    1,
  ).position.set(PEN.x1 - 0.06, 1.35, (PEN.z1 + PEN.z2) / 2);
  B(0.06, 0.6, 0.06, fenceM, PEN.x1, 1.1, (PEN.z1 + PEN.z2) / 2 - 1.6);
  B(0.06, 0.6, 0.06, fenceM, PEN.x1, 1.1, (PEN.z1 + PEN.z2) / 2 + 1.6);
  // dog beds, water bowls
  for (const [x, z, col] of [
    [25.4, 3.6, 0x8a5a9e],
    [18.2, 3.7, 0xc9563f],
  ]) {
    const bed = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.2, 20), lam(col));
    bed.position.set(x, 0.12, z);
    sc.add(bed);
    const cush = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20), lam(0xf1e6d3));
    cush.position.set(x, 0.2, z);
    sc.add(cush);
  }
  for (const z of [-2.8, -2.2]) {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.09, 14), lam(0x3b74c2));
    bowl.position.set(25.9, 0.07, z);
    sc.add(bowl);
  }
  // toys: balls, bones, a rope tug and a squeaky ring
  const TOYS = [];
  const toyCols = [0xf2c230, 0xe2483b, 0x3c8fd9, 0x4fb35a, 0xf08a2a, 0xd65ab5];
  for (let i = 0; i < 7; i++) {
    const b = new THREE.Mesh(ball(0.09, 10), lam(toyCols[i % toyCols.length]));
    b.position.set(rand(PEN.x1 + 0.6, PEN.x2 - 0.6), 0.11, rand(PEN.z1 + 0.6, PEN.z2 - 0.6));
    sc.add(b);
    TOYS.push(b);
  }
  const boneM = lam(0xf4ead2);
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8).rotateZ(Math.PI / 2),
      boneM,
    );
    g.add(shaft);
    for (const s of [-1, 1])
      for (const t of [-1, 1]) {
        const k = new THREE.Mesh(ball(0.05, 8), boneM);
        k.position.set(s * 0.15, 0, t * 0.04);
        g.add(k);
      }
    g.position.set(rand(PEN.x1 + 0.6, PEN.x2 - 0.6), 0.07, rand(PEN.z1 + 0.6, PEN.z2 - 0.6));
    g.rotation.y = rand(0, 3);
    sc.add(g);
  }
  {
    const rope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8).rotateZ(Math.PI / 2),
      lam(0xd8443a, {
        map: tex(16, 64, (g, w, h) => {
          for (let y = 0; y < h; y += 8) {
            g.fillStyle = (y / 8) % 2 ? '#e8e2d2' : '#c8372e';
            g.fillRect(0, y, w, 8);
          }
        }),
      }),
    );
    rope.position.set(21.5, 0.07, 1.2);
    rope.rotation.y = 0.5;
    sc.add(rope);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.04, 8, 20).rotateX(Math.PI / 2),
      lam(0x3c8fd9),
    );
    ring.position.set(19.4, 0.06, -1.6);
    sc.add(ring);
  }
  // the puppies: they trot between random spots in the pen, stop to sniff, and wag
  const PUPS = [];
  for (const [col, spot, s] of [
    [0xd9a55a, 0xe8c48a, 1],
    [0x2a2420, 0x6b4a32, 0.9],
    [0xf1ece2, 0x3a2e28, 0.85],
    [0x8a5a34, 0xd9b48a, 1.05],
    [0xb9b3aa, 0xf1ece2, 0.8],
    [0xe8d2a6, 0xe8d2a6, 0.95],
  ]) {
    const p = puppy(col, spot, s);
    p.x = rand(PEN.x1 + 0.6, PEN.x2 - 0.6);
    p.z = rand(PEN.z1 + 0.6, PEN.z2 - 0.6);
    p.tx = p.x;
    p.tz = p.z;
    p.wait = rand(0, 2);
    p.spd = rand(0.9, 1.6);
    p.ph = rand(0, 6);
    p.g.position.set(p.x, 0.02, p.z);
    sc.add(p.g);
    PUPS.push(p);
  }

  // ---- shelves of toys and treats along the north wall, a toy gondola, and the checkout counter
  const shelfM = lam(0xe9e4da);
  const prodT = (hue) =>
    tex(
      256,
      128,
      (g, w, h) => {
        g.fillStyle = '#e9e4da';
        g.fillRect(0, 0, w, h);
        for (let row = 0; row < 3; row++)
          for (let x = 4; x < w - 10;) {
            const bw = 10 + Math.random() * 18,
              bh = 16 + Math.random() * 18;
            g.fillStyle = `hsl(${(hue + Math.random() * 120) % 360},${55 + Math.random() * 30}%,${40 + Math.random() * 25}%)`;
            g.fillRect(x, (row + 1) * 42 - bh - 2, bw, bh);
            x += bw + 3;
          }
        g.fillStyle = '#b8b2a6';
        for (let row = 1; row <= 3; row++) g.fillRect(0, row * 42 - 2, w, 3);
      },
      false,
    );
  {
    const x1 = 18.2,
      x2 = 26.3,
      z = PS.z1 + 0.35;
    B(x2 - x1, 2.3, 0.6, shelfM, (x1 + x2) / 2, 1.15, z, true);
    const front = new THREE.Mesh(
      new THREE.PlaneGeometry(x2 - x1 - 0.2, 2.1),
      new THREE.MeshBasicMaterial({ map: prodT(20) }),
    );
    front.position.set((x1 + x2) / 2, 1.1, z + 0.31);
    sc.add(front);
    S_(x1, x2, PS.z1, z + 0.3, 0, 2.3);
    const t = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.5),
      new THREE.MeshBasicMaterial({
        map: sign('TOYS & TREATS', 512, 72, '#fff8ec', '#2f8f8a', '800 40px Overpass, Arial, sans-serif'),
      }),
    );
    t.position.set((x1 + x2) / 2, 2.75, z + 0.31);
    sc.add(t);
  }
  {
    // double-sided toy gondola with a bin of tennis balls at one end
    const x1 = 17.4,
      x2 = 22.6,
      z = -8.6;
    B(x2 - x1, 1.5, 0.9, shelfM, (x1 + x2) / 2, 0.75, z, true);
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(x2 - x1 - 0.2, 1.35),
        new THREE.MeshBasicMaterial({ map: prodT(s > 0 ? 180 : 60) }),
      );
      m.position.set((x1 + x2) / 2, 0.75, z + s * 0.46);
      if (s < 0) m.rotation.y = Math.PI;
      sc.add(m);
    }
    S_(x1, x2 + 1, z - 0.45, z + 0.45, 0, 1.5);
    const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.8, 16, 1, true), lam(0x2f8f8a));
    bin.material.side = THREE.DoubleSide;
    bin.position.set(x2 + 0.5, 0.4, z);
    sc.add(bin);
    const tb = lam(0xd8e34a);
    for (let i = 0; i < 14; i++) {
      const b = new THREE.Mesh(ball(0.07, 8), tb);
      b.position.set(x2 + 0.5 + rand(-0.25, 0.25), 0.72 + rand(0, 0.12), z + rand(-0.25, 0.25));
      sc.add(b);
    }
  }
  {
    // checkout counter just inside the door on the north side, with a clerk
    const x = 14.6,
      z = -15.2;
    B(1.0, 1.05, 2.6, oak, x, 0.525, z, true);
    B(1.1, 0.06, 2.7, lam(0xf3efe7), x, 1.08, z);
    B(0.35, 0.28, 0.3, lam(0x2b2e31), x, 1.25, z - 0.6);
    S_(x - 0.55, x + 0.55, z - 1.35, z + 1.35, 0, 1.1);
    const clerk = human({
      skin: SKINS[1],
      shirt: '#2f8f8a',
      pants: PANTS[0],
      shoe: '#1b1b1b',
      hair: '#3a2a1e',
    });
    clerk.g.position.set(x + 1.1, 0, z);
    clerk.g.rotation.y = -Math.PI / 2;
    sc.add(clerk.g);
    // treat jars on the counter
    for (const [dz, c] of [
      [0.3, 0xc98a4a],
      [0.75, 0xe2b26a],
    ]) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 12), glassM);
      jar.position.set(x, 1.24, z + dz);
      sc.add(jar);
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.16, 12), lam(c));
      fill.position.set(x, 1.19, z + dz);
      sc.add(fill);
    }
  }
  // shoppers watching the puppies and the cats
  for (const [x, z, r] of [
    [16.4, 0.4, Math.PI / 2],
    [16.3, -1.6, Math.PI / 2 - 0.3],
    [25.6, -6.4, Math.PI / 2],
  ]) {
    const h = human({
      skin: SKINS[(Math.random() * SKINS.length) | 0],
      shirt: SHIRTS[(Math.random() * SHIRTS.length) | 0],
      pants: PANTS[(Math.random() * PANTS.length) | 0],
      shoe: '#e9e9e6',
      hair: '#3a2a1e',
    });
    h.g.position.set(x, 0, z);
    h.g.rotation.y = r;
    sc.add(h.g);
  }

  // ---- animation, called from the Galleria's update
  const petUpdate = (dt) => {
    const t = performance.now() * 0.001;
    for (const p of PUPS) {
      const dx = p.tx - p.x,
        dz = p.tz - p.z,
        d = Math.hypot(dx, dz);
      let moving = false;
      if (p.wait > 0) p.wait -= dt;
      else if (d < 0.08) {
        p.tx = rand(PEN.x1 + 0.5, PEN.x2 - 0.5);
        p.tz = rand(PEN.z1 + 0.5, PEN.z2 - 0.5);
        p.wait = Math.random() < 0.5 ? rand(0.4, 2.5) : 0;
      } else {
        const step = Math.min(d, p.spd * dt);
        p.x += (dx / d) * step;
        p.z += (dz / d) * step;
        const want = Math.atan2(dx, dz);
        let da = want - p.g.rotation.y;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        p.g.rotation.y += da * Math.min(1, dt * 8);
        moving = true;
      }
      const run = t * 14 + p.ph;
      p.g.position.set(p.x, 0.02 + (moving ? Math.abs(Math.sin(run)) * 0.06 : 0), p.z);
      p.legs.forEach(
        (l, i) => (l.rotation.x = moving ? Math.sin(run + (i % 2 ? Math.PI : 0) + (i > 1 ? 1 : 0)) * 0.6 : 0),
      );
      p.tail.rotation.z = Math.sin(t * (moving ? 16 : 9) + p.ph) * 0.6;
      p.head.rotation.x = moving ? 0 : Math.sin(t * 2 + p.ph) * 0.15 + 0.15;
    }
    for (const k of CATS) {
      k.tail.rotation.z = Math.sin(t * 1.3 + k.ph) * 0.35;
      k.head.rotation.y = Math.sin(t * 0.4 + k.ph) * 0.4;
    }
  };
  const area = (p) =>
    p.x > PEN.x1 - 0.8 && p.z > PEN.z1 - 1.6
      ? 'Puppy playpen'
      : p.x > PS.x2 - 3
        ? 'Cat adoption wall'
        : p.z < -11
          ? 'Toys & treats · checkout'
          : 'Toys & treats';
  Object.assign(ctx, { PS, PEN, petArea: area, petUpdate });
}
