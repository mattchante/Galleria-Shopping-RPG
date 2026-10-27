// Galleria Dallas from the street: Macy's pink-granite entrance on Noel Rd (the way into the mall),
// signage on the Nordstrom garage at Noel & Alpha, and the glowing door markers.
import * as THREE from 'three';
import { DOORS, MCY, NGAR } from './layout.js';
import { scene } from '../core/renderer.js';
import { blockers, lam, solids, speckle, tex } from '../core/helpers.js';
import { MAT, box } from '../core/materials.js';
import { textTex } from './signals.js';

/* ---------- Macy's entrance (east face of the Macy's block, facing Noel Rd) ---------- */
const graniteT = tex(128, 128, (g, w, h) => {
  g.fillStyle = '#c69486';
  g.fillRect(0, 0, w, h);
  speckle(g, w, h, 2600, 0.35, '90,50,45');
  speckle(g, w, h, 1600, 0.4, '245,225,215');
  speckle(g, w, h, 500, 0.5, '40,30,30');
  g.fillStyle = 'rgba(120,80,72,.45)';
  for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 1);
  for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 1, h);
});
const granite = lam(0xffffff, { map: graniteT });
// shape coordinates: u runs along the facade (world z), v is height; the facade faces +x
function onFacade(geo, x, z) {
  geo.rotateY(Math.PI / 2);
  const m = new THREE.Mesh(geo, geo.userData.mat);
  m.position.set(x, 0, z);
  scene.add(m);
  return m;
}
function archPath(p, hw, spring) {
  // a round-topped opening: straight jambs up to `spring`, then a semicircle
  p.moveTo(-hw, 0);
  p.lineTo(hw, 0);
  p.lineTo(hw, spring);
  p.absarc(0, spring, hw, 0, Math.PI, false);
  p.lineTo(-hw, 0);
  return p;
}
{
  const F = MCY[1],
    D = DOORS[0].z;
  const BW = 8.5, // half-width of the granite bay
    BH = 15, // bay height
    AW = 4.2, // half-width of the arch
    SP = 6.6; // arch spring height
  // granite bay with the arched opening, standing proud of the building face
  const outer = new THREE.Shape();
  outer.moveTo(-BW, 0);
  outer.lineTo(BW, 0);
  outer.lineTo(BW, BH);
  outer.lineTo(-BW, BH);
  outer.lineTo(-BW, 0);
  outer.holes.push(archPath(new THREE.Path(), AW, SP));
  const bayGeo = new THREE.ExtrudeGeometry(outer, { depth: 1.3, bevelEnabled: false });
  // granite texture repeats every ~2.5 m
  const uv = bayGeo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.5, uv.getY(i) / 2.5);
  bayGeo.userData.mat = granite;
  const bay = onFacade(bayGeo, F, D);
  bay.castShadow = bay.receiveShadow = true;
  blockers.push(bay);
  solids.push({ x1: F, x2: F + 1.3, z1: D - BW, z2: D - AW });
  solids.push({ x1: F, x2: F + 1.3, z1: D + AW, z2: D + BW });
  // cornice and a base course
  box(1.9, 0.7, BW * 2 + 0.8, granite, F + 0.95, BH + 0.35, D);
  box(1.5, 0.5, BW * 2 + 0.3, lam(0x8f6a62), F + 0.75, 0.25, D);
  // glazing inside the arch: dark glass, a transom bar and three pairs of doors
  const glassGeo = new THREE.ShapeGeometry(archPath(new THREE.Shape(), AW, SP));
  glassGeo.userData.mat = new THREE.MeshPhongMaterial({
    color: 0x1d2a33,
    specular: 0x8899aa,
    shininess: 90,
    emissive: 0x241a12,
  });
  onFacade(glassGeo, F + 0.1, D);
  const metal = lam(0x2a2623);
  box(0.12, 0.22, AW * 2, metal, F + 0.16, 3.4, D);
  box(0.12, 0.22, AW * 2, metal, F + 0.16, SP, D);
  for (const u of [-AW / 1.5, 0, AW / 1.5]) box(0.12, SP, 0.14, metal, F + 0.16, SP / 2, D + u);
  const doorGlass = new THREE.MeshPhongMaterial({ color: 0x31424d, specular: 0xaabbcc, shininess: 90 });
  for (const u of [-2.1, 0, 2.1])
    for (const k of [-0.5, 0.5]) box(0.06, 3.1, 0.95, doorGlass, F + 0.2, 1.6, D + u + k);
  // the clock set into the arch above the doors
  const clockT = tex(
    256,
    256,
    (g, w) => {
      const c = w / 2;
      g.fillStyle = '#f3ead6';
      g.beginPath();
      g.arc(c, c, c - 2, 0, 7);
      g.fill();
      g.strokeStyle = '#2b2520';
      g.lineWidth = 6;
      g.stroke();
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2,
          r1 = i % 5 ? c - 16 : c - 30;
        g.lineWidth = i % 5 ? 2 : 6;
        g.beginPath();
        g.moveTo(c + Math.sin(a) * r1, c - Math.cos(a) * r1);
        g.lineTo(c + Math.sin(a) * (c - 10), c - Math.cos(a) * (c - 10));
        g.stroke();
      }
      const hand = (a, len, wd) => {
        g.lineWidth = wd;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(c, c);
        g.lineTo(c + Math.sin(a) * len, c - Math.cos(a) * len);
        g.stroke();
      };
      hand(((5 + 40 / 60) / 12) * Math.PI * 2, c * 0.5, 10); // twenty to six
      hand((40 / 60) * Math.PI * 2, c * 0.78, 6);
      g.fillStyle = '#2b2520';
      g.beginPath();
      g.arc(c, c, 9, 0, 7);
      g.fill();
    },
    false,
  );
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(1.45, 40),
    new THREE.MeshBasicMaterial({ map: clockT }),
  );
  face.position.set(F + 0.24, SP + 1.7, D);
  face.rotation.y = Math.PI / 2;
  scene.add(face);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.12, 8, 40), lam(0xb08d4a));
  bezel.position.copy(face.position);
  bezel.rotation.y = Math.PI / 2;
  scene.add(bezel);
  // the store name in plain lettering above the arch
  const nameT = textTex(1024, 192, (g, w, h) => {
    g.fillStyle = '#fbf6ee';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    try {
      g.letterSpacing = '18px';
    } catch (e) {}
    g.font = '700 132px Georgia, "Times New Roman", serif';
    g.fillText('MACY’S', w / 2 + 9, h / 2 + 6);
  });
  const name = new THREE.Mesh(
    new THREE.PlaneGeometry(12.5, 2.35),
    new THREE.MeshBasicMaterial({ map: nameT, transparent: true }),
  );
  name.position.set(F + 1.33, 12.6, D);
  name.rotation.y = Math.PI / 2;
  scene.add(name);
  // round planters either side of the doors
  const soil = lam(0x4a3a2c),
    shrub = lam(0x4f6f34);
  for (const u of [-6.6, 6.6]) {
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.8, 0.9, 20), granite);
    pl.position.set(F + 2.4, 0.45, D + u);
    pl.castShadow = true;
    scene.add(pl);
    box(0.1, 0.06, 1.4, soil, F + 2.4, 0.9, D + u);
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), shrub);
    bush.position.set(F + 2.4, 1.35, D + u);
    bush.scale.y = 0.8;
    scene.add(bush);
    solids.push({ x1: F + 1.5, x2: F + 3.3, z1: D + u - 0.9, z2: D + u + 0.9 });
  }
  // monument sign for the mall, set back by the building on the north side of the entrance
  const z0 = D - BW - 4.5;
  box(1, 2.2, 5.2, granite, F + 1.6, 1.1, z0);
  solids.push({ x1: F + 1.1, x2: F + 2.1, z1: z0 - 2.6, z2: z0 + 2.6 });
  const monT = textTex(512, 192, (g, w) => {
    g.fillStyle = '#2f2a24';
    g.textAlign = 'center';
    try {
      g.letterSpacing = '10px';
    } catch (e) {}
    g.font = '800 82px Overpass, Arial, sans-serif';
    g.fillText('GALLERIA', w / 2 + 5, 92);
    try {
      g.letterSpacing = '16px';
    } catch (e) {}
    g.font = '600 38px Overpass, Arial, sans-serif';
    g.fillText('DALLAS', w / 2 + 8, 150);
  });
  const mon = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 1.7),
    new THREE.MeshBasicMaterial({ map: monT, transparent: true }),
  );
  mon.position.set(F + 2.12, 1.25, z0);
  mon.rotation.y = Math.PI / 2;
  scene.add(mon);
  // entry plaza paving between the arch and the sidewalk
  box(4.2, 0.06, BW * 2, lam(0xb99a8e, { map: graniteT }), F + 2.1, 0.03, D);
}
/* ---------- Nordstrom garage signage (Noel Rd at Alpha Rd) ---------- */
{
  const [x1, x2, z1, z2] = NGAR,
    H = 19;
  const word = (txt, px) =>
    textTex(1024, 192, (g, cw, ch) => {
      g.fillStyle = '#f7f5f0';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      try {
        g.letterSpacing = '26px';
      } catch (e) {}
      g.font = `500 ${px}px Overpass, Arial, sans-serif`;
      g.fillText(txt, cw / 2 + 13, ch / 2 + 4);
    });
  const sign = (t, w, h, x, y, z, ry) => {
    const backing = box(w + 1, h + 0.6, 0.25, lam(0x2a2b2d), x, y, z);
    backing.rotation.y = ry;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: t, transparent: true }),
    );
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.translateZ(0.14);
    scene.add(m);
  };
  const nT = word('NORDSTROM', 120);
  // north face over Alpha Rd and east face over Noel Rd
  sign(nT, 14, 2.4, (x1 + x2) / 2, H - 2.2, z1 - 0.15, Math.PI);
  sign(nT, 14, 2.4, x2 + 0.15, H - 2.2, z1 + 14, Math.PI / 2);
  const pT = word('PARKING', 110);
  sign(pT, 7, 1.3, x2 + 0.15, H - 4.6, z1 + 14, Math.PI / 2);
  // vehicle entrance from Noel Rd
  const ez = (z1 + z2) / 2 - 8;
  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), MAT.dark);
  mouth.position.set(x2 + 0.05, 1.6, ez);
  mouth.rotation.y = Math.PI / 2;
  scene.add(mouth);
  box(0.4, 0.5, 9, lam(0xd8d2c4), x2 + 0.2, 3.45, ez);
  const eT = word('ENTRANCE', 100);
  sign(eT, 5, 0.9, x2 + 0.2, 4.4, ez, Math.PI / 2);
}
function marker(parent, x, z) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.15, 40).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xf2b33d, transparent: true, opacity: 0.9 }),
  );
  ring.position.y = 0.07;
  const col = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 2.4, 32, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xf2b33d,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  col.position.y = 1.2;
  g.add(ring, col);
  g.position.set(x, 0, z);
  parent.add(g);
  return g;
}
const marksOut = DOORS.map((d) => marker(scene, d.x, d.z));

export { marker, marksOut };
