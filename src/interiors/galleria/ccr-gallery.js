// CCR Gallery: walk-in art gallery on the west side of level 1 (where The Denim Co. was).
// Terrazzo floor with a black inlay, white walls, track lighting, two framed photographs on the
// back wall, abstract canvases on the side walls, statues on plinths and a gallery bench.
import * as THREE from 'three';
import { decal, lam, rand, speckle, tex } from '../../core/helpers.js';
import { flat } from '../../core/materials.js';
import { textTex } from '../../world/signals.js';
import { PANTS, SHIRTS, SKINS, human } from '../../life/people.js';
import turkeyUrl from '../../assets/turkey-a-la-turkey.jpg';
import champUrl from '../../assets/the-champ.jpg';

export function buildCcrGallery(ctx) {
  const { B, S_, W, npcs, sc } = ctx;
  const GA = { x1: -24, x2: -W, z1: -5.6, z2: 5.6, h: 4.9, ez1: -1.6, ez2: 1.6 };
  const xc = (GA.x1 + GA.x2) / 2,
    WD = GA.x2 - GA.x1,
    DP = GA.z2 - GA.z1;
  const white = lam(0xfbfaf8),
    black = lam(0x141414),
    oak = lam(0xc9a477),
    lightM = new THREE.MeshBasicMaterial({ color: 0xfffdf6 });
  const label = (lines, w = 512, h = 192) =>
    textTex(w, h, (g, W2, H) => {
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, W2, H);
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      lines.forEach(([t, font, col], i) => {
        g.fillStyle = col || '#1a1a1a';
        g.font = font;
        g.fillText(t, 28, 62 + i * 52);
      });
    });

  // ---- floor: white terrazzo with a black inlay border and a pale oak runway through the middle
  const terrT = tex(256, 256, (g, w, h) => {
    g.fillStyle = '#efede9';
    g.fillRect(0, 0, w, h);
    const chips = ['#b9b4ab', '#8d8a85', '#d9cfc0', '#6f6d6a', '#c7b9a3', '#a9b3b0', '#e2d6c6'];
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = chips[i % chips.length];
      const s = 1 + Math.random() * 4;
      g.beginPath();
      g.ellipse(
        Math.random() * w,
        Math.random() * h,
        s,
        s * (0.5 + Math.random() * 0.6),
        Math.random() * 3,
        0,
        7,
      );
      g.fill();
    }
    speckle(g, w, h, 800, 0.05, '0,0,0');
  });
  flat(
    GA.x1,
    GA.x2,
    GA.z1,
    GA.z2,
    0.006,
    decal(new THREE.MeshPhongMaterial({ map: terrT, specular: 0x777777, shininess: 80 }), 2),
    2.6,
    sc,
  );
  const inlay = decal(lam(0x161616), 3);
  flat(GA.x1 + 0.6, GA.x2 - 0.6, GA.z1 + 0.6, GA.z1 + 0.72, 0.008, inlay, 0, sc);
  flat(GA.x1 + 0.6, GA.x2 - 0.6, GA.z2 - 0.72, GA.z2 - 0.6, 0.008, inlay, 0, sc);
  flat(GA.x1 + 0.6, GA.x1 + 0.72, GA.z1 + 0.6, GA.z2 - 0.6, 0.008, inlay, 0, sc);
  const oakFloorT = tex(64, 256, (g, w, h) => {
    g.fillStyle = '#cfae84';
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) {
      g.fillStyle = `rgba(90,60,30,${0.05 + Math.random() * 0.1})`;
      g.fillRect(x, 0, 1, h);
    }
  });
  flat(GA.x1 + 0.72, GA.x2, -0.9, 0.9, 0.009, decal(lam(0xffffff, { map: oakFloorT }), 4), 0, sc);

  // ---- shell: white walls, ceiling with track lighting, solid for the player
  B(WD + 0.4, GA.h, 0.3, white, xc, GA.h / 2, GA.z1 - 0.15, true);
  B(WD + 0.4, GA.h, 0.3, white, xc, GA.h / 2, GA.z2 + 0.15, true);
  B(0.3, GA.h, DP, white, GA.x1 - 0.15, GA.h / 2, 0, true);
  S_(GA.x1 - 0.3, GA.x2, GA.z1 - 0.3, GA.z1, 0, GA.h);
  S_(GA.x1 - 0.3, GA.x2, GA.z2, GA.z2 + 0.3, 0, GA.h);
  S_(GA.x1 - 0.3, GA.x1, GA.z1, GA.z2, 0, GA.h);
  B(WD, 0.1, DP, lam(0xf4f3f0), xc, GA.h + 0.05, 0, true);
  const track = (x1, z1, x2, z2, n, aim) => {
    const cx = (x1 + x2) / 2,
      cz = (z1 + z2) / 2;
    B(Math.max(x2 - x1, 0.05), 0.05, Math.max(z2 - z1, 0.05), black, cx, GA.h - 0.05, cz);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n,
        x = x1 + (x2 - x1) * t,
        z = z1 + (z2 - z1) * t;
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 12), black);
      can.position.set(x, GA.h - 0.2, z);
      can.lookAt(x + aim[0], GA.h - 0.2 - 0.8, z + aim[1]);
      can.rotateX(Math.PI / 2);
      sc.add(can);
    }
  };
  track(GA.x1 + 1.4, GA.z1 + 0.8, GA.x1 + 1.4, GA.z2 - 0.8, 4, [-1, 0]);
  track(GA.x1 + 1.5, GA.z1 + 1.4, GA.x2 - 1.2, GA.z1 + 1.4, 4, [0, -1]);
  track(GA.x1 + 1.5, GA.z2 - 1.4, GA.x2 - 1.2, GA.z2 - 1.4, 4, [0, 1]);
  {
    const pl = new THREE.PointLight(0xfff8ee, 0.45, 13);
    pl.position.set(-17, 4.2, 0);
    sc.add(pl);
  }

  // ---- storefront: glass either side of an open entrance, white fascia with the name
  const glassF = new THREE.MeshPhongMaterial({
    color: 0xe6f2f8,
    transparent: true,
    opacity: 0.16,
    specular: 0xffffff,
    shininess: 120,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  for (const [z1, z2] of [
    [GA.z1, GA.ez1],
    [GA.ez2, GA.z2],
  ]) {
    B(0.04, GA.h - 0.9, z2 - z1, glassF, GA.x2 - 0.02, (GA.h - 0.9) / 2, (z1 + z2) / 2);
    for (const z of [z1 + 0.03, z2 - 0.03])
      B(0.06, GA.h - 0.9, 0.05, black, GA.x2 - 0.02, (GA.h - 0.9) / 2, z);
    S_(GA.x2 - 0.15, GA.x2 + 0.1, z1, z2, 0, GA.h);
  }
  B(0.3, 0.9, DP + 0.3, white, GA.x2 - 0.05, GA.h - 0.45, 0);
  {
    const nameT = textTex(1024, 128, (g, W2, H) => {
      g.fillStyle = '#fbfaf8';
      g.fillRect(0, 0, W2, H);
      g.fillStyle = '#141414';
      g.font = '600 76px "Cormorant Garamond", Georgia, serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '22px';
      } catch (e) {}
      g.fillText('CCR GALLERY', W2 / 2 + 11, H / 2 + 4);
    });
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.8), new THREE.MeshBasicMaterial({ map: nameT }));
    nm.position.set(GA.x2 + 0.11, GA.h - 0.45, 0);
    nm.rotation.y = Math.PI / 2;
    sc.add(nm);
    // vinyl lettering on the glass
    const hours = textTex(512, 128, (g, W2, H) => {
      g.fillStyle = '#141414';
      g.font = '600 30px Overpass, Arial, sans-serif';
      g.textAlign = 'left';
      try {
        g.letterSpacing = '4px';
      } catch (e) {}
      g.fillText('NOW SHOWING', 10, 44);
      g.font = 'italic 600 40px "Cormorant Garamond", Georgia, serif';
      g.fillText('Portraits & Forms', 10, 100);
    });
    const hm = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.45),
      new THREE.MeshBasicMaterial({ map: hours, transparent: true }),
    );
    hm.position.set(GA.x2 + 0.03, 1.55, 3.6);
    hm.rotation.y = Math.PI / 2;
    sc.add(hm);
  }

  // ---- framed photographs on the back wall
  const loader = new THREE.TextureLoader();
  const photo = (url, title, z, aspect) => {
    const h = 2.1,
      w = h * aspect,
      x = GA.x1 + 0.02;
    B(0.06, h + 0.5, w + 0.5, black, x + 0.03, 2.1, z); // frame
    B(0.02, h + 0.36, w + 0.36, white, x + 0.07, 2.1, z); // mat
    const t = loader.load(url);
    t.anisotropy = 8;
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t }));
    ph.position.set(x + 0.085, 2.1, z);
    ph.rotation.y = Math.PI / 2;
    sc.add(ph);
    const lb = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.12),
      new THREE.MeshBasicMaterial({
        map: label([[title, 'italic 600 44px "Cormorant Garamond", Georgia, serif']], 512, 96),
      }),
    );
    lb.position.set(x + 0.04, 1.42, z + w / 2 + 0.6);
    lb.rotation.y = Math.PI / 2;
    sc.add(lb);
    const spot = new THREE.SpotLight(0xfff4e6, 0.9, 7, 0.5, 0.6);
    spot.position.set(GA.x1 + 1.6, GA.h - 0.3, z);
    spot.target.position.set(GA.x1, 2.1, z);
    sc.add(spot, spot.target);
  };
  photo(turkeyUrl, 'Turkey a la Turkey', -2.3, 675 / 900);
  photo(champUrl, 'The Champ', 2.3, 720 / 852);

  // ---- abstract canvases on the side walls
  const abstract = (seed) =>
    tex(
      256,
      320,
      (g, w, h) => {
        let s = seed;
        const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
        const pals = [
          ['#f2efe8', '#d9482b', '#1f3a5a', '#e8b53a', '#141414'],
          ['#e9e4da', '#5b7f6e', '#c76b4a', '#2c2c2c', '#d8c3a5'],
          ['#1a1a1a', '#f0e6d2', '#b8323a', '#3e6fa8', '#e6c45a'],
          ['#f6f3ee', '#8aa9c2', '#e3a0a8', '#3d3d3d', '#c7d6a8'],
        ];
        const pal = pals[seed % pals.length];
        g.fillStyle = pal[0];
        g.fillRect(0, 0, w, h);
        const kind = seed % 3;
        if (kind === 0)
          for (let i = 0; i < 7; i++) {
            g.fillStyle = pal[1 + (i % 4)];
            g.fillRect(rnd() * w * 0.7, rnd() * h * 0.8, 30 + rnd() * 120, 20 + rnd() * 110);
          }
        else if (kind === 1)
          for (let i = 0; i < 6; i++) {
            g.fillStyle = pal[1 + (i % 4)];
            g.beginPath();
            g.arc(rnd() * w, rnd() * h, 20 + rnd() * 70, 0, 7);
            g.fill();
          }
        else {
          g.fillStyle = pal[1];
          g.fillRect(0, 0, w, h * 0.55);
          g.fillStyle = pal[2];
          g.fillRect(0, h * 0.62, w, h * 0.38);
          g.fillStyle = pal[3];
          g.fillRect(w * 0.1, h * 0.555, w * 0.8, h * 0.03);
        }
      },
      false,
    );
  const canvasOn = (z, x, wall, seed, title, w = 1.3, h = 1.7) => {
    const face = wall === 'N' ? 1 : -1;
    B(w, h, 0.08, lam(0xf6f4f0), x, 2.05, z + face * 0.04);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.04, h - 0.04),
      new THREE.MeshBasicMaterial({ map: abstract(seed) }),
    );
    m.position.set(x, 2.05, z + face * 0.085);
    if (face < 0) m.rotation.y = Math.PI;
    sc.add(m);
    const lb = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.19),
      new THREE.MeshBasicMaterial({
        map: label([
          [title, 'italic 600 44px "Cormorant Garamond", Georgia, serif'],
          ['Acrylic on canvas', '400 26px Overpass, Arial, sans-serif', '#555'],
        ]),
      }),
    );
    lb.position.set(x + face * (w / 2 + 0.45), 1.42, z + face * 0.02);
    if (face < 0) lb.rotation.y = Math.PI;
    sc.add(lb);
  };
  canvasOn(GA.z1, -20.6, 'N', 4, 'Red Field');
  canvasOn(GA.z1, -16.4, 'N', 9, 'Harbor, Noon', 1.6, 1.3);
  canvasOn(GA.z2, -20.6, 'S', 13, 'Three Suns');
  canvasOn(GA.z2, -16.4, 'S', 6, 'Quiet Horizon', 1.6, 1.3);

  // ---- statues on plinths
  const plinth = (x, z, hgt, w = 0.7) => {
    B(w, hgt, w, white, x, hgt / 2, z);
    S_(x - w / 2 - 0.05, x + w / 2 + 0.05, z - w / 2 - 0.05, z + w / 2 + 0.05, 0, 2.5);
    return hgt;
  };
  const bronze = new THREE.MeshPhongMaterial({ color: 0x8c5a2b, specular: 0xd9a066, shininess: 70 }),
    marble = new THREE.MeshPhongMaterial({ color: 0xf2f0ec, specular: 0x999999, shininess: 40 }),
    steel = new THREE.MeshPhongMaterial({ color: 0xbfc4c9, specular: 0xffffff, shininess: 120 });
  {
    // twisting bronze knot
    const top = plinth(-19.6, -3.6, 0.9);
    const k = new THREE.Mesh(new THREE.TorusKnotGeometry(0.28, 0.08, 120, 14, 2, 3), bronze);
    k.position.set(-19.6, top + 0.42, -3.6);
    sc.add(k);
  }
  {
    // stacked marble forms
    const top = plinth(-19.6, 3.6, 0.7);
    let y = top;
    for (const [r, sy] of [
      [0.32, 0.55],
      [0.26, 0.7],
      [0.2, 0.9],
      [0.13, 1],
    ]) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), marble);
      s.scale.y = sy;
      y += r * sy;
      s.position.set(-19.6, y, 3.6);
      y += r * sy * 0.92;
      sc.add(s);
    }
  }
  {
    // standing figure, abstracted
    const top = plinth(-15.2, 0, 0.45, 0.9);
    const g = new THREE.Group();
    g.position.set(-15.2, top, 0);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.3, 16), marble);
    body.position.y = 0.65;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 14), marble);
    head.position.y = 1.48;
    head.scale.set(0.85, 1.1, 0.95);
    const arm = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 10, 28, Math.PI * 1.2), marble);
    arm.position.set(0, 1.05, 0);
    arm.rotation.set(0, Math.PI / 2, 0.4);
    g.add(body, head, arm);
    sc.add(g);
  }
  {
    // polished steel ring, floor-standing
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.09, 16, 48), steel);
    r.position.set(-22.6, 0.86, 0);
    r.rotation.y = Math.PI / 2;
    sc.add(r);
    S_(-22.85, -22.35, -0.9, 0.9, 0, 1.8);
  }
  // hanging mobile over the bench
  {
    const mob = new THREE.Group();
    mob.position.set(-17.4, GA.h - 0.9, 0);
    sc.add(mob);
    B(0.01, 0.9, 0.01, black, -17.4, GA.h - 0.45, 0);
    const cols = [0xd9482b, 0x141414, 0xe8b53a, 0x1f3a5a, 0xf2efe8];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(
        new THREE.CircleGeometry(0.16 + i * 0.03, 20),
        lam(cols[i], { side: THREE.DoubleSide }),
      );
      leaf.position.set(Math.cos(a) * 0.7, -0.25 - (i % 2) * 0.25, Math.sin(a) * 0.7);
      leaf.rotation.y = a;
      mob.add(leaf);
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.7, 4), black);
      wire.position.set(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35);
      wire.rotation.z = Math.PI / 2;
      wire.rotation.y = -a;
      mob.add(wire);
    }
    ctx.ccrMobile = mob;
  }

  // ---- gallery bench and reception desk
  B(2.2, 0.08, 0.55, oak, -17.4, 0.44, 0);
  for (const dx of [-0.9, 0.9]) B(0.08, 0.4, 0.5, black, -17.4 + dx, 0.2, 0);
  S_(-18.55, -16.25, -0.32, 0.32, 0, 0.9);
  {
    const dx = -13.6,
      dz = 4.4;
    B(1.6, 1.05, 0.7, white, dx, 0.52, dz);
    B(1.7, 0.04, 0.8, oak, dx, 1.07, dz);
    S_(dx - 0.85, dx + 0.85, dz - 0.4, dz + 0.4, 0, 1.2);
    B(0.4, 0.28, 0.02, black, dx, 1.24, dz - 0.15);
    const host = human({
      skin: SKINS[1],
      shirt: '#141414',
      pants: '#141414',
      shoe: '#141414',
      hair: '#2a1d14',
    });
    host.g.position.set(dx, 0, dz + 0.65);
    host.g.rotation.y = Math.PI;
    sc.add(host.g);
  }
  // visitors looking at the work
  for (const [x, z, r] of [
    [-22, -2.3, -Math.PI / 2],
    [-21.8, 2.6, -Math.PI / 2],
    [-16.4, -4.2, Math.PI],
    [-18.6, -2.4, -2.2],
  ]) {
    const h = human({
      skin: SKINS[(Math.random() * SKINS.length) | 0],
      shirt: SHIRTS[(Math.random() * SHIRTS.length) | 0],
      pants: PANTS[(Math.random() * PANTS.length) | 0],
      shoe: '#1b1b1b',
      hair: '#3a2a1e',
    });
    h.g.position.set(x, 0, z);
    h.g.rotation.y = r;
    sc.add(h.g);
  }
  {
    const h = human({ skin: SKINS[2], shirt: SHIRTS[4], pants: PANTS[1], shoe: '#e9e9e6', hair: '#6b4a2a' });
    sc.add(h.g);
    npcs.push({ h, ax: 'x', c: -1.6, a: -22, b: -14, y: 0, t: rand(-21, -15), dir: 1, spd: 0.5 });
  }
  const area = (p) =>
    p.x < -21
      ? 'Back wall · Turkey a la Turkey, The Champ'
      : p.x > -14.6
        ? 'Entrance · reception'
        : 'Sculpture & canvases';
  Object.assign(ctx, { GA, ccrArea: area });
}
