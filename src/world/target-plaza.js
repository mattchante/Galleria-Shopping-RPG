// Target Plaza at Montfort Dr, James Temple Dr and LBJ: Target facing east across its lot, the main
// drive in from Montfort, McDonald's with its drive-thru, the Game Over Videogames / AT&T building, and
// a strip center at the northeast corner. Lots themselves (striping, parked cars) come from lots.js.
import * as THREE from 'three';
import { DOORS, PLAZA, TGT } from './layout.js';
import { scene } from '../core/renderer.js';
import { MAPDRAW, blockers, decal, lam, solids, speckle, tex } from '../core/helpers.js';
import { MAT, box, flat, mapRect } from '../core/materials.js';
import { building } from './buildings.js';
import { textTex } from './signals.js';

const P = PLAZA,
  D = DOORS.find((d) => d.id === 'target');
// sidewalk-cut ends: the Montfort curb at each drive, and the curbs of James Temple / LBJ
const CURB = { main: 306.2, mcd: 309, jt: 213.5, lbj: 353 };

/* ---------- surfaces: asphalt base, drives, fire lane, sidewalk, driveway cuts ---------- */
const asphaltT = MAT.asphalt.map;
const baseM = decal(lam(0xffffff, { map: asphaltT }), 1),
  laneM = decal(lam(0xe9e9e9, { map: asphaltT }), 3),
  concreteT = MAT.sidewalk.map,
  driveM = decal(lam(0xcfcac0, { map: concreteT }), 3),
  cutM = decal(lam(0xc9c4ba, { map: concreteT }), 6),
  cutAsM = decal(lam(0xe0e0e0, { map: asphaltT }), 6),
  yellowM = decal(new THREE.MeshBasicMaterial({ color: 0xd9ad2e }), 5),
  whiteM = decal(new THREE.MeshBasicMaterial({ color: 0xe9e8e1 }), 5),
  redM = decal(new THREE.MeshBasicMaterial({ color: 0xc23a2e }), 5);
flat(P.x1, P.x2, P.z1, P.z2, 0.016, baseM, 8);
mapRect(P.x1, P.x2, P.z1, P.z2, '#2f3a33');
// Target's front sidewalk, James Temple to LBJ
flat(P.walk[0], P.walk[1], P.z1, P.z2, 0.04, MAT.sidewalk, 2);
MAPDRAW.push({ k: 'r', x1: P.walk[0], x2: P.walk[1], z1: P.z1, z2: P.z2, col: '#8d8b80' });
// fire lane along the store front, with a red curb stripe on the sidewalk edge
flat(P.fire[0], P.fire[1], P.z1, P.z2, 0.026, laneM, 8);
flat(P.walk[1] - 0.18, P.walk[1], P.z1, P.z2, 0.045, redM);
// main drive: concrete, double yellow centre line, white edge lines (Street View: straight at the store)
{
  const [z1, z2] = P.main,
    zc = (z1 + z2) / 2;
  flat(P.fire[1], P.x2, z1, z2, 0.026, driveM, 3);
  flat(P.x2, CURB.main, z1, z2, 0.046, cutM, 3);
  for (const o of [-0.17, 0.17])
    flat(P.fire[1] + 3, CURB.main - 1, zc + o - 0.06, zc + o + 0.06, 0.03, yellowM);
  for (const z of [z1 + 0.25, z2 - 0.25])
    flat(P.fire[1] + 1, CURB.main - 1, z - 0.06, z + 0.06, 0.03, whiteM);
  // turn arrows by the store end
  MAPDRAW.push({ k: 'r', x1: P.fire[1], x2: CURB.main, z1, z2, col: '#9e9a90' });
}
// drive in beside McDonald's, and the aisle that joins it to the main drive
flat(P.fire[1], P.x2, P.mcdDrive[0], P.mcdDrive[1], 0.026, laneM, 8);
flat(P.x2, CURB.mcd, P.mcdDrive[0], P.mcdDrive[1], 0.046, cutAsM, 8);
flat(P.aisle[0], P.aisle[1], P.main[1], P.mcdDrive[0], 0.026, laneM, 8);
{
  const zc = (P.mcdDrive[0] + P.mcdDrive[1]) / 2;
  for (const o of [-0.17, 0.17]) flat(P.aisle[0], CURB.mcd - 1, zc + o - 0.06, zc + o + 0.06, 0.03, yellowM);
}
// the fire lane meets James Temple and the LBJ frontage road through sidewalk cuts
flat(P.fire[0], P.fire[1], CURB.jt, P.z1, 0.046, cutAsM, 8);
flat(P.fire[0], P.fire[1], P.z2, CURB.lbj, 0.046, cutAsM, 8);
// crosswalk from the store doors across the fire lane
{
  const zt = tex(
    64,
    64,
    (g, w, h) => {
      g.fillStyle = '#3d3f42';
      g.fillRect(0, 0, w, h);
      g.fillStyle = '#ecebe4';
      for (let y = 4; y < h; y += 16) g.fillRect(0, y, w, 8);
    },
    false,
  );
  zt.wrapS = zt.wrapT = THREE.RepeatWrapping;
  const m = flat(P.fire[0], P.fire[1], D.z - 2.4, D.z + 2.4, 0.032, decal(lam(0xffffff, { map: zt }), 5));
  const uv = m.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i) * 1.2);
}

/* ---------- small helpers ---------- */
const text = (txt, w, h, fg, font, bg) =>
  textTex(w, h, (g, W, H) => {
    if (bg) {
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);
    }
    g.fillStyle = fg;
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(txt, W / 2, H / 2 + 4);
  });
// a flat sign facing +x (east), -z (north) or +z (south)
const FACE = { e: Math.PI / 2, n: Math.PI, s: 0, w: -Math.PI / 2 };
function plane(t, w, h, x, y, z, face, transparent = true) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: t, transparent }),
  );
  m.position.set(x, y, z);
  m.rotation.y = FACE[face];
  scene.add(m);
  return m;
}
const glassM = new THREE.MeshPhongMaterial({ color: 0x24313b, specular: 0x9fb3c4, shininess: 90 }),
  mullM = lam(0x3a3d40);
// a run of shop windows on a facade: from a to b along the face, at the face line
function windows(face, line, a, b, h = 3.1, bays = 3.2) {
  const n = Math.max(1, Math.round((b - a) / bays)),
    step = (b - a) / n;
  if (face === 'n' || face === 's') {
    const z = line + (face === 'n' ? -0.06 : 0.06);
    box(b - a, h, 0.08, glassM, (a + b) / 2, h / 2 + 0.15, z);
    for (let i = 0; i <= n; i++) box(0.1, h, 0.12, mullM, a + i * step, h / 2 + 0.15, z);
  } else {
    const x = line + (face === 'e' ? 0.06 : -0.06);
    box(0.08, h, b - a, glassM, x, h / 2 + 0.15, (a + b) / 2);
    for (let i = 0; i <= n; i++) box(0.12, h, 0.1, mullM, x, h / 2 + 0.15, a + i * step);
  }
}
const lampPole = new THREE.CylinderGeometry(0.12, 0.18, 10, 8),
  lampHead = new THREE.BoxGeometry(1.4, 0.25, 0.6),
  lampHeadM = lam(0xe8e3d4);
function lamp(x, z) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.7, 10), lam(0xbdb8ad));
  base.position.set(x, 0.35, z);
  scene.add(base);
  const p = new THREE.Mesh(lampPole, MAT.pole);
  p.position.set(x, 5.35, z);
  p.castShadow = true;
  scene.add(p);
  for (const s of [-1, 1]) {
    const hd = new THREE.Mesh(lampHead, lampHeadM);
    hd.position.set(x + s * 0.7, 10.3, z);
    scene.add(hd);
  }
  solids.push({ x1: x - 0.4, x2: x + 0.4, z1: z - 0.4, z2: z + 0.4 });
}

/* ---------- Target: white box, red entrance, raised sign wall, red ball bollards ---------- */
{
  const [x1, x2, z1, z2] = TGT,
    X = x2,
    Z = D.z,
    H = 10;
  building(x1, x2, z1, z2, H, 'blank', 0xf4f2ee, { pad: false, map: '#56665b' });
  const red = lam(0xc8202a),
    deepRed = lam(0xa8141c);
  // red band along the base of the whole east wall
  box(0.08, 0.55, z2 - z1, red, X + 0.04, 1.35, (z1 + z2) / 2);
  // raised parapet over the entrance, with the name in plain red capitals (no logo)
  const PW = 30;
  const par = box(1.1, 5.2, PW, lam(0xf7f5f1, { map: MAT.sidewalk.map }), X - 0.25, H + 1.6, Z);
  blockers.push(par);
  plane(
    text('TARGET', 1024, 192, '#cc0000', '800 150px Overpass, Arial, sans-serif'),
    13,
    2.45,
    X + 0.33,
    H + 0.4,
    Z,
    'e',
  );
  // red entrance vestibule with dark glass doors
  const ves = box(2.6, 5.4, 15, red, X + 1.3, 2.7, Z);
  blockers.push(ves);
  box(2.8, 0.45, 15.4, deepRed, X + 1.4, 5.6, Z);
  solids.push({ x1: X, x2: X + 2.6, z1: Z - 7.5, z2: Z + 7.5 });
  for (const dz of [-4.4, 4.4]) {
    box(0.06, 3.1, 4.2, glassM, X + 2.64, 1.65, Z + dz);
    box(0.08, 0.12, 4.3, mullM, X + 2.66, 3.2, Z + dz);
    box(0.08, 3.1, 0.1, mullM, X + 2.66, 1.65, Z + dz);
  }
  box(0.06, 0.8, 13.6, lam(0xffffff), X + 2.64, 4.4, Z);
  // the store's second door sign further north
  plane(
    text('PHARMACY', 1024, 160, '#cc0000', '700 104px Overpass, Arial, sans-serif'),
    6.5,
    1.0,
    X + 0.07,
    7.2,
    Z - 34,
    'e',
  );
  // red concrete ball bollards along the sidewalk edge, clear of the doors
  const ballG = new THREE.SphereGeometry(0.45, 16, 12);
  for (let z = Z - 16; z <= Z + 16; z += 3.2) {
    if (Math.abs(z - Z) < 9) continue;
    const b = new THREE.Mesh(ballG, red);
    b.position.set(P.walk[1] - 0.7, 0.45, z);
    b.castShadow = true;
    scene.add(b);
    solids.push({ x1: P.walk[1] - 1.15, x2: P.walk[1] - 0.25, z1: z - 0.45, z2: z + 0.45 });
  }
  mapRect(X, X + 2.6, Z - 7.5, Z + 7.5, '#c8202a');
}

/* ---------- strip center at the northeast corner: four generic shops facing south ---------- */
{
  const [x1, x2, z1, z2] = P.strip,
    H = 6.5;
  building(x1, x2, z1, z2, H, 'blank', 0xe3d6bf, { pad: false });
  box(x2 - x1 + 0.6, 1.3, 0.6, lam(0x8a6a4a), (x1 + x2) / 2, H - 0.9, z2 + 0.3);
  box(x2 - x1, 0.2, 2.2, lam(0x6d5640), (x1 + x2) / 2, 3.6, z2 + 1.1);
  const shops = [
    ['NAIL SPA', '#f4efe6', '#8a3c5a'],
    ['MATTRESS OUTLET', '#f4efe6', '#1f4e79'],
    ['PHONE REPAIR', '#f4efe6', '#2b2b2b'],
    ['TAQUERIA', '#f4efe6', '#b5401f'],
  ];
  const w = (x2 - x1) / shops.length;
  shops.forEach(([n, bg, fg], i) => {
    const a = x1 + i * w;
    windows('s', z2, a + 0.6, a + w - 0.6, 3.2, 2.8);
    plane(
      text(n, 768, 128, fg, '800 64px Overpass, Arial, sans-serif', bg),
      w - 1.6,
      0.95,
      a + w / 2,
      H - 0.9,
      z2 + 0.62,
      's',
      false,
    );
  });
}

/* ---------- McDonald's: tan box, dark stone corner tower, white canopy, drive-thru on the west side ---------- */
{
  const [x1, x2, z1, z2] = P.mcd,
    H = 6;
  building(x1, x2, z1, z2, H, 'blank', 0xc4ab88, { pad: false, map: '#56665b' });
  const stone = lam(0x77706a, {
      map: tex(64, 64, (g, w, h) => {
        g.fillStyle = '#d8d2ca';
        g.fillRect(0, 0, w, h);
        speckle(g, w, h, 500, 0.35, '0,0,0');
        g.fillStyle = 'rgba(255,255,255,.08)';
        for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
      }),
    }),
    white = lam(0xf4f3ef),
    louvre = lam(0x9a9c9e);
  // stone tower at the northeast corner, facing Montfort and the drive
  // the tower stands 0.2 m proud of both walls: coplanar faces would flicker (z-fighting)
  const tw = box(3.4, 8.4, 3.4, stone, x2 - 1.5, 4.2, z1 + 1.5);
  blockers.push(tw);
  // windows, canopy and louvres on the north face (toward the drive) and the east face (Montfort)
  windows('n', z1, x1 + 1, x2 - 3.6, 2.6, 2.4);
  windows('e', x2, z1 + 3.6, z2 - 1, 2.6, 2.4);
  box(x2 - x1 - 3.2, 0.18, 1.4, white, (x1 + x2 - 3.2) / 2, 3.0, z1 - 0.7);
  box(1.4, 0.18, z2 - z1 - 3.2, white, x2 + 0.7, 3.0, (z1 + z2 + 3.2) / 2);
  box(x2 - x1 - 4.4, 1.0, 0.25, louvre, (x1 + x2 - 3.6) / 2, 3.8, z1 - 0.15);
  // name in plain type (no arches mark), on the tan wall above the canopy, north and east
  const nameT = text('McDonald’s', 1024, 160, '#ffffff', '700 112px Overpass, Arial, sans-serif');
  plane(nameT, 6.4, 1.0, (x1 + x2) / 2 - 1.5, 5.1, z1 - 0.06, 'n');
  plane(nameT, 6.4, 1.0, x2 + 0.06, 5.1, (z1 + z2) / 2 + 1.5, 'e');
  plane(
    text('PlayPlace', 512, 128, '#d6262e', '700 80px Overpass, Arial, sans-serif'),
    2.6,
    0.65,
    x1 + 2.6,
    5.1,
    z1 - 0.06,
    'n',
  );
  // drive-thru lane down the west side: yellow curb island, two order canopies, menu boards, pickup window
  const [t1, t2] = P.thru,
    zEnd = P.game[2] - 1.5;
  flat(t1, t2, P.mcdDrive[1], zEnd, 0.027, laneM, 8);
  const curbY = lam(0xe0b23a);
  box(0.45, 0.16, zEnd - P.mcdDrive[1] - 2, curbY, t1 - 0.22, 0.08, (P.mcdDrive[1] + zEnd) / 2 + 1);
  solids.push({ x1: t1 - 0.45, x2: t1, z1: P.mcdDrive[1] + 2, z2: zEnd, y1: 0.16 });
  for (const zc of [z1 + 1.5, z1 + 5]) {
    for (const x of [t1 - 0.25, x1 - 0.15]) {
      box(0.16, 3.4, 0.16, mullM, x, 1.7, zc);
      solids.push({ x1: x - 0.12, x2: x + 0.12, z1: zc - 0.12, z2: zc + 0.12 });
    }
    box(x1 - t1 + 0.6, 0.25, 1.6, lam(0x5a5550), (t1 + x1) / 2 - 0.2, 3.5, zc);
  }
  const menuT = tex(
    256,
    192,
    (g, w, h) => {
      g.fillStyle = '#1e1e20';
      g.fillRect(0, 0, w, h);
      const cols = ['#e2483b', '#f2c230', '#f4f1ea', '#3c8fd9'];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 3; c++) {
          g.fillStyle = cols[(r + c) % cols.length];
          g.fillRect(10 + c * 82, 10 + r * 45, 72, 34);
        }
    },
    false,
  );
  for (const zc of [z1 + 3.2, z1 + 6.6]) {
    box(0.3, 1.9, 1.7, MAT.dark, t1 - 0.9, 1.25, zc);
    plane(menuT, 1.5, 1.6, t1 - 0.74, 1.35, zc, 'e', false);
    solids.push({ x1: t1 - 1.05, x2: t1 - 0.75, z1: zc - 0.85, z2: zc + 0.85 });
  }
  box(0.1, 1.2, 1.6, glassM, x1 - 0.06, 1.6, z2 - 2.2);
  box(0.6, 0.12, 2.2, white, x1 - 0.3, 2.35, z2 - 2.2);
  // tall pole sign by Montfort at the McDonald's drive: red panel, name in plain type
  {
    const px = P.x2 + 1.2,
      pz = P.mcdDrive[1] + 2.4;
    box(0.5, 12, 0.5, MAT.pole, px, 6, pz);
    solids.push({ x1: px - 0.3, x2: px + 0.3, z1: pz - 0.3, z2: pz + 0.3 });
    const st = textTex(512, 256, (g, w, h) => {
      g.fillStyle = '#d6262e';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = '#ffffff';
      g.lineWidth = 6;
      g.strokeRect(8, 8, w - 16, h - 16);
      g.fillStyle = '#ffc72c';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '800 92px Overpass, Arial, sans-serif';
      g.fillText('McDONALD’S', w / 2, h / 2 - 22);
      g.fillStyle = '#ffffff';
      g.font = '700 40px Overpass, Arial, sans-serif';
      g.fillText('DRIVE-THRU · OPEN LATE', w / 2, h / 2 + 62);
    });
    for (const face of ['n', 's'])
      plane(st, 5, 2.5, px, 12.4, pz + (face === 'n' ? -0.27 : 0.27), face, false);
    box(5.1, 2.6, 0.5, lam(0x2a2a2a), px, 12.4, pz);
    // low "now hiring" style reader board under it
    box(2.6, 0.9, 0.3, lam(0xf2c230), px, 9.5, pz);
  }
}

/* ---------- Game Over Videogames and AT&T: one small white building facing Montfort, like Target and McDonald's ---------- */
{
  const [x1, x2, z1, z2] = P.game,
    H = 5.6,
    mid = (z1 + z2) / 2,
    trim = lam(0xdcd8cf);
  building(x1, x2, z1, z2, H, 'blank', 0xf2f0ea, { pad: false });
  // front sidewalk between the storefronts and Montfort's grass strip
  flat(x2, P.x2, z1 - 1, z2 + 1, 0.04, MAT.sidewalk, 2);
  // sign band, canopy and two storefronts on the east face: Game Over to the north, AT&T to the south
  box(0.4, 1.0, z2 - z1 + 0.4, trim, x2 + 0.2, H - 0.7, mid);
  box(1.3, 0.16, z2 - z1, lam(0xf7f6f2), x2 + 0.65, 3.35, mid);
  windows('e', x2, z1 + 0.6, mid - 0.4, 2.9, 2.4);
  windows('e', x2, mid + 0.4, z2 - 0.6, 2.9, 2.4);
  plane(
    text('GAME OVER VIDEOGAMES', 1024, 128, '#111111', '800 76px Overpass, Arial, sans-serif', '#f5d33a'),
    mid - z1 - 1.0,
    0.8,
    x2 + 0.42,
    H - 0.7,
    (z1 + mid) / 2,
    'e',
    false,
  );
  plane(
    text('AT&T', 512, 128, '#0a6fc2', '800 92px Overpass, Arial, sans-serif'),
    2.8,
    0.7,
    x2 + 0.42,
    H - 0.7,
    (mid + z2) / 2,
    'e',
  );
  // a smaller Game Over sign on the north wall, seen from the McDonald's drive
  plane(
    text('GAME OVER', 512, 128, '#111111', '800 80px Overpass, Arial, sans-serif', '#f5d33a'),
    4.4,
    1.0,
    x2 - 3.2,
    H - 0.9,
    z1 - 0.06,
    'n',
    false,
  );
}

/* ---------- lot furniture: light poles on the row centrelines, cart corrals by the store ---------- */
for (const [x1, x2, z1, z2] of P.lots) {
  const rows = [];
  for (let z = z1 + 6.5; z + 11 <= z2 - 2; z += 17.5) rows.push(z + 5.5);
  for (const rc of rows)
    for (let x = x1 + 9.6; x < x2 - 4; x += 22) {
      // keep the corral bays clear
      if (x > 253 && x < 262) continue;
      lamp(x, rc);
    }
}
{
  const railM = lam(0xb9bdc2);
  const corral = (x, z, len) => {
    for (const s of [-1, 1]) box(len, 1.0, 0.06, railM, x, 0.5, z + s * 0.75);
    box(0.06, 1.0, 1.5, railM, x - len / 2, 0.5, z);
    for (const s of [-1, 1]) {
      solids.push({ x1: x - len / 2, x2: x + len / 2, z1: z + s * 0.75 - 0.06, z2: z + s * 0.75 + 0.06 });
    }
    solids.push({ x1: x - len / 2 - 0.06, x2: x - len / 2 + 0.06, z1: z - 0.75, z2: z + 0.75 });
  };
  // the corral bays left empty in lots.js (x 254.5..260.2), one per row, beside the row centreline
  for (const zc of [275 - 2.75, 292.5 + 2.75]) corral(257.35, zc, 5.2);
}
