// Map data: street centerlines, building footprints, lots and doors. Metres; +x east, +z south; Noel Rd is x=0, Alpha Rd is z=0.

/*DATA-START*/
/* World units are metres. +x is east, +z is south. Noel Rd sits on x=0, Alpha Rd on z=0.
   The layout follows the street map at roughly half real scale so the area is quick to cross. */
const SW = 4,
  K = 0.5;
// sidewalk width, map compression
/* Real geometry. Everything below is written in real metres from OpenStreetMap (projected around the
   Noel Rd / Alpha Rd intersection: x east, z south) and squeezed to game units by G(). Road and sidewalk
   widths stay full size, so buildings that would crowd a road are trimmed by clipRect(). */
const RX = 6.5,
  RZ = -7; // real-world point that becomes the game origin (centre of Noel Rd at Alpha Rd)
const G = ([x, z]) => [+((x - RX) * K).toFixed(2), +((z - RZ) * K).toFixed(2)];
const box4 = (b) => {
  const [x1, z1] = G([b[0], b[2]]),
    [x2, z2] = G([b[1], b[3]]);
  return [x1, x2, z1, z2];
};
const road = (o) => Object.assign(o, { pts: o.pts.map(G) });
// The Dallas North Tollway centreline (elevated) and LBJ's main lanes (elevated in the game).
const DNT_PTS = [
  [-367, -2600],
  [-366, -50],
  [-363, 10],
  [-357, 46],
  [-349, 100],
  [-334, 160],
  [-316, 218],
  [-304, 265],
  [-299, 313],
  [-296, 346],
  [-296, 409],
  [-296, 487],
  [-290, 566],
  [-281, 635],
  [-268, 700],
  [-258, 762],
];
const LBJ_MAIN_Z = 762,
  FRONT_Z = 711;
const ROADS = [
  road({
    id: 'alpha',
    name: 'Alpha Rd',
    pts: [
      [-2600, RZ],
      [3200, RZ],
    ],
    w: 18,
    type: 'two4',
    spd: 13,
    traffic: true,
  }),
  road({
    id: 'noel',
    name: 'Noel Rd',
    pts: [
      [RX, -2600],
      [RX, FRONT_Z],
    ],
    w: 16,
    type: 'two4',
    spd: 13,
    traffic: true,
  }),
  road({
    id: 'montfort',
    name: 'Montfort Dr',
    pts: [
      [400, -2600],
      [433, -213],
      [440, -140],
      [446, -55],
      [450, RZ],
      [456, 30],
      [466, 55],
      [481, 78],
      [500, 96],
      [530, 113],
      [560, 130],
      [592, 152],
      [607, 168],
      [620, 195],
      [632, 230],
      [636, 260],
      [636, 340],
      [635, 410],
      [634, 509],
      [640, 600],
      [642, 680],
      [642, 760],
      [643, 812],
      [645, 1300],
    ],
    w: 16,
    type: 'two4',
    spd: 12,
    traffic: true,
  }),
  // Dallas Pkwy southbound frontage road, east side of the Tollway
  road({
    id: 'pkwyE',
    name: 'Dallas Pkwy',
    pts: [
      [-338, -2600],
      [-335, -307],
      [-331, -150],
      [-334, -60],
      [-337, 0],
      [-336, 40],
      [-329, 78],
      [-297, 187],
      [-267, 296],
      [-264, 340],
      [-266, 384],
      [-270, 417],
      [-271, 479],
      [-258, 536],
      [-250, 570],
      [-247, 600],
      [-200, 760],
      [-140, 1300],
    ],
    w: 12,
    type: 'one3',
    spd: 16,
    traffic: true,
  }),
  // Dallas Pkwy northbound frontage road: forks off Inwood Rd just north of Alpha
  road({
    id: 'pkwyW',
    name: 'Dallas Pkwy',
    pts: [
      [-466, -30],
      [-448, -38],
      [-433, -50],
      [-415, -78],
      [-405, -97],
      [-401, -140],
      [-400, -244],
      [-394, -300],
      [-380, -2600],
    ],
    w: 12,
    type: 'one3',
    spd: 16,
    traffic: true,
  }),
  // Inwood Rd: the northbound frontage south of Alpha, angling west away from the Tollway
  road({
    id: 'inwood',
    name: 'Inwood Rd',
    pts: [
      [-250, 1300],
      [-290, 760],
      [-318, 640],
      [-322, 600],
      [-322, 530],
      [-325, 476],
      [-337, 440],
      [-350, 400],
      [-352, 375],
      [-358, 362],
      [-369, 326],
      [-379, 293],
      [-458, 30],
      [-462, 0],
      [-466, -30],
      [-472, -60],
      [-482, -106],
      [-488, -137],
      [-550, -342],
      [-700, -2600],
    ],
    w: 12,
    type: 'one3',
    spd: 15,
    traffic: true,
  }),
  // LBJ north frontage road (westbound), straight east of Noel, then rising toward the Tollway
  road({
    id: 'lbj',
    name: 'LBJ Fwy',
    pts: [
      [3200, FRONT_Z],
      [-6, FRONT_Z],
      [-37, 697],
      [-53, 686],
      [-158, 607],
      [-184, 594],
      [-246, 583],
      [-322, 592],
      [-371, 607],
      [-439, 658],
      [-470, 676],
      [-507, 690],
      [-555, 699],
      [-806, 705],
      [-2600, 700],
    ],
    w: 12,
    type: 'one3',
    spd: 15,
    traffic: true,
  }),
  // LBJ south frontage road (eastbound), past the fence
  road({
    id: 'lbjS',
    name: 'LBJ Fwy',
    pts: [
      [-2600, 880],
      [100, 812],
      [3200, 812],
    ],
    w: 12,
    type: 'one3',
    spd: 15,
    traffic: true,
  }),
  road({
    id: 'peterson',
    name: 'Peterson Ln',
    pts: [
      [RX, 247],
      [636, 247],
    ],
    w: 11,
    type: 'two2',
  }),
  road({
    id: 'jtemple',
    name: 'James Temple Dr',
    pts: [
      [RX, 408],
      [635, 408],
    ],
    w: 12,
    type: 'two2',
  }),
  road({
    id: 'access',
    name: 'Access Rd',
    pts: [
      [208, 408],
      [208, FRONT_Z],
    ],
    w: 10,
    type: 'two2',
  }),
  road({
    id: 'galleria',
    name: 'Galleria Rd',
    pts: [
      [-215, 386],
      [-520, 386],
    ],
    w: 12,
    type: 'two2',
  }),
  road({
    id: 'cityview',
    name: 'City View Ave',
    pts: [
      [157, RZ],
      [158, -41],
      [168, -74],
      [170, -600],
    ],
    w: 10,
    type: 'two2',
  }),
  road({
    id: 'barton',
    name: 'Barton Dr',
    pts: [
      [-200, RZ],
      [-200, -600],
    ],
    w: 10,
    type: 'two2',
  }),
  road({
    id: 'dnt',
    name: 'Dallas N Tollway',
    pts: DNT_PTS,
    w: 26,
    type: 'hwy',
    spd: 27,
    traffic: true,
    elevated: true,
  }),
  road({
    id: 'i635',
    name: 'I-635 LBJ Fwy',
    pts: [
      [-2800, LBJ_MAIN_Z],
      [3800, LBJ_MAIN_Z],
    ],
    w: 28,
    type: 'hwy',
    spd: 28,
    traffic: true,
    elevated: true,
  }),
];
function distSeg(px, pz, s) {
  const vx = s.b[0] - s.a[0],
    vz = s.b[1] - s.a[1];
  let t = ((px - s.a[0]) * vx + (pz - s.a[1]) * vz) / (s.len * s.len);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = s.a[0] + vx * t - px,
    qz = s.a[1] + vz * t - pz;
  return Math.sqrt(qx * qx + qz * qz);
}
function mkSegs(r) {
  r.segs = [];
  let s = 0;
  for (let i = 0; i < r.pts.length - 1; i++) {
    const a = r.pts[i],
      b = r.pts[i + 1],
      dx = b[0] - a[0],
      dz = b[1] - a[1],
      len = Math.hypot(dx, dz);
    if (len < 1e-6) continue;
    const d = [dx / len, dz / len];
    r.segs.push({
      a,
      b,
      len,
      d,
      rt: [-d[1], d[0]],
      s0: s,
      axis: Math.abs(dx) < 1e-6 ? 'z' : Math.abs(dz) < 1e-6 ? 'x' : null,
    });
    s += len;
  }
  r.L = s;
}
ROADS.forEach(mkSegs);
// A road that ends close to another road's centreline is snapped onto it, so T-junctions line up.
for (const r of ROADS) {
  if (r.elevated) continue;
  for (const end of [0, r.pts.length - 1]) {
    const p = r.pts[end];
    for (const o of ROADS) {
      if (o === r || o.elevated) continue;
      for (const s of o.segs) {
        if (distSeg(p[0], p[1], s) > 4) continue;
        const t = Math.max(0, Math.min(s.len, (p[0] - s.a[0]) * s.d[0] + (p[1] - s.a[1]) * s.d[1]));
        r.pts[end] = [s.a[0] + s.d[0] * t, s.a[1] + s.d[1] * t];
      }
    }
  }
}
ROADS.forEach(mkSegs);
function prepRoad(r) {
  const w = r.w;
  r.bb = [
    Math.min(...r.pts.map((p) => p[0])) - w,
    Math.max(...r.pts.map((p) => p[0])) + w,
    Math.min(...r.pts.map((p) => p[1])) - w,
    Math.max(...r.pts.map((p) => p[1])) + w,
  ];
  let ex = 0,
    ez = 0;
  for (const g of r.segs) {
    ex += Math.abs(g.b[0] - g.a[0]);
    ez += Math.abs(g.b[1] - g.a[1]);
  }
  r.horiz = ex > ez;
  if (r.type === 'two4') {
    const lw = (w - 2) / 4;
    r.lines = [
      { o: 0, s: 'y2' },
      { o: -lw, s: 'wd' },
      { o: lw, s: 'wd' },
      { o: -2 * lw, s: 'w' },
      { o: 2 * lw, s: 'w' },
    ];
    r.lanesDef = [
      { o: lw / 2, d: 1 },
      { o: 1.5 * lw, d: 1 },
      { o: -lw / 2, d: -1 },
      { o: -1.5 * lw, d: -1 },
    ];
  } else if (r.type === 'two2') {
    r.lines = [
      { o: 0, s: 'y2' },
      { o: -(w / 2 - 0.7), s: 'w' },
      { o: w / 2 - 0.7, s: 'w' },
    ];
    r.lanesDef = [];
  } else if (r.type === 'one3') {
    r.lines = [
      { o: -1.8, s: 'wd' },
      { o: 1.8, s: 'wd' },
      { o: -5.4, s: 'w' },
      { o: 5.4, s: 'w' },
    ];
    r.lanesDef = [
      { o: -3.6, d: 1 },
      { o: 0, d: 1 },
      { o: 3.6, d: 1 },
    ];
  } else {
    r.lines = [
      { o: -0.8, s: 'y' },
      { o: 0.8, s: 'y' },
      { o: -4.4, s: 'wd' },
      { o: 4.4, s: 'wd' },
      { o: -8, s: 'wd' },
      { o: 8, s: 'wd' },
      { o: -11.6, s: 'w' },
      { o: 11.6, s: 'w' },
    ];
    r.lanesDef = [
      { o: 2.6, d: 1 },
      { o: 6.2, d: 1 },
      { o: 9.8, d: 1 },
      { o: -2.6, d: -1 },
      { o: -6.2, d: -1 },
      { o: -9.8, d: -1 },
    ];
  }
  if (!r.traffic) r.lanesDef = [];
  r.y = r.elevated ? 9.25 : r.horiz ? 0.02 : 0.026;
}
ROADS.forEach(prepRoad);
const RD = Object.fromEntries(ROADS.map((r) => [r.id, r]));
// arc length along road r of the point nearest (x, z)
function sAt(r, x, z) {
  let best = 1e9,
    bs = 0;
  for (const g of r.segs) {
    const t = Math.max(0, Math.min(g.len, (x - g.a[0]) * g.d[0] + (z - g.a[1]) * g.d[1]));
    const d = Math.hypot(g.a[0] + g.d[0] * t - x, g.a[1] + g.d[1] * t - z);
    if (d < best) {
      best = d;
      bs = g.s0 + t;
    }
  }
  return bs;
}
/* Intersections. Real streets meet at slight angles; where one road runs roughly east-west (E) and the
   other roughly north-south (N), the crossing is treated as a square intersection at the true crossing point. */
const NEAR = 0.22;
function computeInts() {
  const out = [],
    Gr = ROADS.filter((r) => !r.elevated);
  for (let i = 0; i < Gr.length; i++)
    for (let j = i + 1; j < Gr.length; j++)
      for (const sa of Gr[i].segs)
        for (const sb of Gr[j].segs) {
          let E, N, se, sn;
          if (Math.abs(sa.d[1]) < NEAR && Math.abs(sb.d[0]) < NEAR) {
            [E, N, se, sn] = [Gr[i], Gr[j], sa, sb];
          } else if (Math.abs(sa.d[0]) < NEAR && Math.abs(sb.d[1]) < NEAR) {
            [E, N, se, sn] = [Gr[j], Gr[i], sb, sa];
          } else continue;
          // solve se.a + t*se.d = sn.a + u*sn.d
          const den = se.d[0] * sn.d[1] - se.d[1] * sn.d[0];
          if (Math.abs(den) < 1e-6) continue;
          const qx = sn.a[0] - se.a[0],
            qz = sn.a[1] - se.a[1];
          const t = (qx * sn.d[1] - qz * sn.d[0]) / den,
            u = (qx * se.d[1] - qz * se.d[0]) / den;
          if (t < -0.05 || t > se.len + 0.05 || u < -0.05 || u > sn.len + 0.05) continue;
          const x = se.a[0] + se.d[0] * t,
            z = se.a[1] + se.d[1] * t;
          if (out.some((o) => o.E === E && o.N === N && Math.hypot(o.x - x, o.z - z) < 4)) continue;
          const sE = se.s0 + Math.max(0, Math.min(se.len, t)),
            sN = sn.s0 + Math.max(0, Math.min(sn.len, u));
          const eB = sE > 1.5,
            eA = sE < E.L - 1.5,
            nB = sN > 1.5,
            nA = sN < N.L - 1.5;
          out.push({
            x,
            z,
            E,
            N,
            sE,
            sN,
            ext: {
              w: se.d[0] > 0 ? eB : eA,
              e: se.d[0] > 0 ? eA : eB,
              n: sn.d[1] > 0 ? nB : nA,
              s: sn.d[1] > 0 ? nA : nB,
            },
            sig: !!(E.traffic && N.traffic),
          });
        }
  return out;
}
const INTS = computeInts();
function distRoad(r, x, z) {
  let m = 1e9;
  for (const s of r.segs) {
    const d = distSeg(x, z, s);
    if (d < m) m = d;
  }
  return m;
}
// Keep every footprint clear of the road + sidewalk by trimming the side that faces the road.
function rectDistRoad(b, r) {
  let m = 1e9;
  for (const s of r.segs) {
    const sx0 = Math.min(s.a[0], s.b[0]),
      sx1 = Math.max(s.a[0], s.b[0]),
      sz0 = Math.min(s.a[1], s.b[1]),
      sz1 = Math.max(s.a[1], s.b[1]);
    if (sx1 < b[0] - 40 || sx0 > b[1] + 40 || sz1 < b[2] - 40 || sz0 > b[3] + 40) continue;
    for (let t = 0; t <= s.len; t += 1) {
      const x = s.a[0] + s.d[0] * t,
        z = s.a[1] + s.d[1] * t;
      if (x > b[0] && x < b[1] && z > b[2] && z < b[3]) return 0;
    }
    for (let x = b[0]; x <= b[1] + 1e-6; x += 1) {
      m = Math.min(m, distSeg(x, b[2], s), distSeg(x, b[3], s));
    }
    for (let z = b[2]; z <= b[3] + 1e-6; z += 1) {
      m = Math.min(m, distSeg(b[0], z, s), distSeg(b[1], z, s));
    }
  }
  return m;
}
function clipRect(b, m) {
  for (let it = 0; it < 300; it++) {
    let hit = null;
    for (const r of ROADS) {
      if (r.elevated) continue;
      if (
        r.bb[1] + SW + m < b[0] ||
        r.bb[0] - SW - m > b[1] ||
        r.bb[3] + SW + m < b[2] ||
        r.bb[2] - SW - m > b[3]
      )
        continue;
      if (rectDistRoad(b, r) < r.w / 2 + SW + m) {
        hit = r;
        break;
      }
    }
    if (!hit) return b;
    const mx = (b[0] + b[1]) / 2,
      mz = (b[2] + b[3]) / 2,
      sides = [
        [b[0], mz],
        [b[1], mz],
        [mx, b[2]],
        [mx, b[3]],
      ];
    let bi = 0,
      bd = 1e9;
    sides.forEach((p, i) => {
      const d = distRoad(hit, p[0], p[1]);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    if (bi === 0) b[0] += 1;
    else if (bi === 1) b[1] -= 1;
    else if (bi === 2) b[2] += 1;
    else b[3] -= 1;
    if (b[1] - b[0] < 8 || b[3] - b[2] < 8) return null;
  }
  return b;
}
// keeps a footprint off the Tollway's support columns
function clipDNT(b) {
  for (let it = 0; it < 200 && b; it++) {
    if (rectDistRoad(b, RD.dnt) > RD.dnt.w / 2 + 2) return b;
    if (distRoad(RD.dnt, b[0], (b[2] + b[3]) / 2) < distRoad(RD.dnt, b[1], (b[2] + b[3]) / 2)) b[0] += 1;
    else b[1] -= 1;
    if (b[1] - b[0] < 8) return null;
  }
  return b;
}
const fit = (b, m = 2) => {
  const c = clipRect(box4(b), m);
  return c && clipDNT(c);
};
// [real x1, x2, z1, z2, height, facade, tint]
const MCY = fit([-92, -17, 238, 356]); // Macy's, entrance on Noel Rd
const NGAR = fit([-81, -46, 13, 196]); // Nordstrom parking garage at Noel & Alpha
/* Target Plaza: Montfort Dr, James Temple Dr and the LBJ frontage road. Target faces east across its
   lot toward Montfort; the main drive comes in from Montfort straight at the store, a second drive
   runs in beside McDonald's, and a fire lane runs along Target's front from James Temple to LBJ.
   Footprints are from OpenStreetMap and the aerial; the drives and lots are laid out in game units
   so they fit between Target and Montfort's sidewalk at half scale. */
const TGT = [...G([384, 0]).slice(0, 1), G([471, 0])[0], 219.5, G([0, 625])[1]]; // Target (incl. its south bay)
const PLAZA = {
  x1: TGT[1],
  x2: 301.5, // Montfort's west sidewalk starts just east of here
  z1: 217.5, // James Temple's south sidewalk ends here
  z2: 349, // LBJ frontage road's north sidewalk starts here
  walk: [TGT[1], TGT[1] + 5], // Target's front sidewalk
  fire: [TGT[1] + 5, TGT[1] + 12], // fire lane in front of the store, James Temple to LBJ
  main: [254, 263], // main drive from Montfort (z band)
  mcdDrive: [304, 312], // drive in from Montfort beside McDonald's (z band)
  aisle: [271, 278], // north-south aisle joining the two drives (x band)
  thru: [278.6, 283.2], // McDonald's drive-thru lane (x band), runs south along its west side
  door: G([0, 556])[1], // Target's entrance (z)
  strip: [266, 299.5, 219.5, 233.5], // the strip center at the northeast corner (faces south)
  mcd: [284.5, 300, 314, 323.5], // McDonald's
  game: [286, 298, 331, 345], // Game Over Videogames + AT&T, storefronts facing Montfort
  lots: [
    [TGT[1] + 12.75, 262, 219.5, 254, 0.45],
    [264, 300, 234, 254, 0.35],
    [TGT[1] + 12.75, 271, 263, 304, 0.62, [[254.5, 260.2]]],
    [278, 300, 263, 304, 0.55],
    [TGT[1] + 12.75, 276, 312, 349, 0.4],
  ],
};
const MCD = PLAZA.mcd;
const REAL_BUILDINGS = [
  // north of Alpha Rd, west of Noel
  [-188, -11, -176, -145, 16, 'apt', 0xeadfca],
  [-188, -150, -145, -122, 16, 'apt', 0xeadfca],
  [-60, -11, -145, -123, 16, 'apt', 0xeadfca],
  [-186, -149, -107, -47, 8, 'store', 0xe6d6bd],
  [-141, -70, -107, -40, 8, 'store', 0xe9dcc4],
  [-64, -26, -111, -74, 9, 'store', 0xe7e1d5],
  [-60, -23, -74, -41, 8, 'store', 0xe6d6bd],
  [-260, -207, -156, -44, 10, 'store', 0xe9dcc4],
  // north of Alpha Rd, east of Noel
  [25, 81, -109, -44, 10, 'glass', 0x7a9ab0],
  [189, 233, -57, -31, 8, 'store', 0xe9dcc4],
  [196, 228, -160, -105, 12, 'brick', 0xa86450],
  [268, 283, -159, -122, 10, 'store', 0xe7e1d5],
  [303, 320, -55, -22, 8, 'store', 0xe6d6bd],
  [305, 349, -172, -139, 8, 'store', 0xe9dcc4],
  [357, 417, -57, -33, 9, 'store', 0xe7e1d5],
  [389, 408, -101, -69, 8, 'glass', 0x6c8fa8],
  // east of Montfort, north of Alpha (apartments)
  [481, 531, -170, -144, 14, 'apt', 0xe8dcc5],
  [594, 640, -165, -139, 14, 'apt', 0xe8dcc5],
  [665, 691, -159, -141, 14, 'apt', 0xe8dcc5],
  [715, 772, -161, -142, 14, 'apt', 0xe8dcc5],
  [484, 525, -105, -65, 14, 'apt', 0xe3d2b4],
  [572, 622, -123, -62, 14, 'apt', 0xe3d2b4],
  [661, 710, -119, -79, 14, 'apt', 0xe3d2b4],
  [748, 767, -123, -103, 14, 'apt', 0xe3d2b4],
  [468, 523, -44, -19, 12, 'apt', 0xece2cf],
  [530, 601, -42, -19, 12, 'apt', 0xece2cf],
  [606, 662, -42, -19, 12, 'apt', 0xece2cf],
  [669, 742, -63, -32, 7, 'store', 0xe9dcc4],
  [745, 777, -63, -43, 7, 'store', 0xe7e1d5],
  // west of the Tollway
  [-459, -402, 242, 371, 14, 'apt', 0xe4d6bc],
  [-385, -347, 498, 581, 115, 'glass', 0x6687a0],
  [-434, -405, 14, 72, 6, 'store', 0xe6d6bd],
  [-411, -383, 88, 145, 6, 'store', 0xe9dcc4],
  [-389, -361, 161, 219, 6, 'store', 0xe6d6bd],
  [-368, -339, 234, 292, 6, 'store', 0xe9dcc4],
  [-345, -316, 307, 363, 6, 'store', 0xe6d6bd],
  [-488, -463, 590, 634, 30, 'glass', 0x8aa4b6],
  [-497, -433, 498, 530, 40, 'glass', 0x7a9ab0],
  [-497, -418, 416, 471, 10, 'garage', 0xd9d6cf],
  [-402, -381, 348, 371, 10, 'brick', 0xa86450],
  // Galleria Dallas: garages and towers around the mall
  [-300, -190, 15, 80, 15, 'garage', 0xe0b48a], // Orange Garage
  [-300, -256, 100, 145, 12, 'store', 0xe6d6bd], // American Girl
  [-83, -13, 197, 235, 97, 'glass', 0x6f9cc0], // Two Galleria Tower
  [-87, -12, 361, 390, 100, 'glass', 0x5f8fb6], // One Galleria Tower
  [-85, -28, 416, 586, 21, 'garage', 0xe2cf8a], // Yellow Garage
  [-29, -13, 426, 492, 6, 'store', 0xe7e1d5],
  [-72, -22, 610, 662, 109, 'glass', 0x7aa5c4], // Three Galleria Tower
  [-160, -97, 495, 620, 18, 'garage', 0x9fb4c8], // Blue Garage
  [-220, -160, 510, 570, 15, 'garage', 0xd9d6cf],
  [-212, -161, 272, 357, 72, 'glass', 0x8a9aa6], // The Westin Galleria
  // Noel to Montfort, Alpha to Peterson
  [27, 65, 12, 36, 7, 'store', 0xe9dcc4],
  [92, 108, 12, 36, 7, 'store', 0xe7e1d5],
  [125, 140, 13, 43, 7, 'store', 0xe6d6bd],
  [142, 214, 26, 52, 7, 'store', 0xe9dcc4],
  [219, 244, 19, 43, 7, 'store', 0xe7e1d5],
  [281, 307, 20, 39, 9, 'glass', 0x7d9bb0],
  [311, 352, 21, 51, 9, 'store', 0xe6d6bd],
  [370, 415, 25, 54, 9, 'glass', 0x6c8fa8],
  [417, 445, 28, 60, 8, 'store', 0xe9dcc4],
  [167, 181, 63, 192, 16, 'apt', 0xeadfca],
  [273, 288, 64, 193, 16, 'apt', 0xeadfca],
  [200, 259, 73, 90, 16, 'apt', 0xeadfca],
  [200, 216, 95, 177, 16, 'apt', 0xeadfca],
  [237, 254, 131, 177, 16, 'apt', 0xeadfca],
  [198, 260, 182, 197, 16, 'apt', 0xeadfca],
  [174, 281, 210, 228, 16, 'apt', 0xeadfca],
  [291, 330, 60, 95, 14, 'brick', 0xa65e48],
  [373, 413, 61, 96, 14, 'brick', 0xa65e48],
  [338, 368, 114, 168, 14, 'brick', 0xa65e48],
  [421, 521, 108, 169, 8, 'store', 0xe7e1d5],
  [544, 573, 16, 91, 8, 'store', 0xe9dcc4],
  [586, 613, 60, 124, 7, 'store', 0xe6d6bd],
  [581, 609, 214, 232, 6, 'store', 0xd6c9b2],
  [674, 712, 173, 214, 8, 'store', 0xe9dcc4],
  [682, 698, 23, 51, 7, 'store', 0xe7e1d5],
  [730, 743, 24, 52, 7, 'store', 0xe6d6bd],
  [26, 93, 191, 231, 40, 'glass', 0x8c95a3], // Le Méridien
  // Peterson to James Temple
  [43, 75, 286, 362, 52, 'apt', 0xe6d8bf], // 13330 Noel Rd tower
  [23, 80, 256, 284, 11, 'apt', 0xe6d8bf],
  [23, 79, 365, 393, 11, 'apt', 0xe6d8bf],
  [348, 403, 262, 300, 12, 'brick', 0xa15c45],
  [451, 507, 262, 281, 12, 'brick', 0xa15c45],
  [347, 385, 300, 374, 12, 'brick', 0xa15c45],
  [412, 506, 295, 375, 12, 'brick', 0xa15c45],
  [530, 569, 301, 395, 10, 'store', 0xe7e1d5],
  [578, 603, 275, 387, 7, 'store', 0xe9dcc4],
  // James Temple to LBJ
  [122, 198, 424, 507, 14, 'apt', 0xd9c8a8], // Residence Inn
  [129, 169, 590, 617, 8, 'store', 0xe7e1d5],
  [140, 177, 627, 681, 8, 'store', 0xe6d6bd],
  [226, 353, 413, 471, 13, 'garage', 0xd9d6cf],
  [248, 330, 482, 530, 10, 'glass', 0x58748a],
  [227, 275, 612, 688, 36, 'glass', 0x6f8fa8],
  [300, 361, 632, 685, 22, 'glass', 0x7d9bb0],
  [380, 428, 653, 681, 6, 'store', 0xe7e1d5],
  [443, 458, 651, 702, 6, 'store', 0xe9dcc4],
];
const BUILDINGS = [
  ...REAL_BUILDINGS.map((b) => {
    const c = fit(b);
    return c ? [...c, ...b.slice(4)] : null;
  }),
  [...NGAR, 19, 'garage', 0xdcd8cf],
].filter(Boolean);
// Galleria Dallas: the mall blocks (pink granite), Nordstrom at the north end, Macy's on Noel
const MALL = [
  [-170, -90, 86, 200, 20, 'stone', 0xe3cdbd],
  [-195, -92, 200, 272, 20, 'stone', 0xe3cdbd],
  [-161, -92, 272, 356, 20, 'stone', 0xe3cdbd],
  [-198, -93, 356, 410, 20, 'stone', 0xe3cdbd],
  [-175, -93, 410, 470, 18, 'stone', 0xe3cdbd],
  [-195, -125, 455, 515, 16, 'stone', 0xdcc4b2],
  [-183, -82, 12, 86, 22, 'stone', 0xd8bfae], // Nordstrom
  [-225, -150, 100, 180, 16, 'stone', 0xcfc4b8], // Netflix House
]
  .map((b) => {
    const c = fit(b);
    return c ? [...c, ...b.slice(4)] : null;
  })
  .filter(Boolean)
  .concat([[...MCY, 24, 'stone', 0xc9988a]]);
// the barrel-vaulted skylight along the mall's spine (game units)
const VAULT = { x: G([-131, 0])[0], z1: G([0, 95])[1], z2: G([0, 400])[1] };
const LOTS = [
  { b: [40, 98, 438, 475], occ: 0.45 },
  { b: [127, 197, 510, 540], occ: 0.4 },
  { b: [28, 88, 640, 678], occ: 0.4 },
  { b: [221, 276, 552, 606], occ: 0.5 },
  { b: [301, 366, 552, 627], occ: 0.5 },
  { b: [126, 163, 56, 134], occ: 0.5 },
]
  .map((L) => {
    const c = clipRect(box4(L.b), 0.5);
    if (!c) return null;
    const [x1, x2, z1, z2] = c;
    return Object.assign(L, { x1, x2, z1, z2 });
  })
  .filter(Boolean)
  .concat(PLAZA.lots.map(([x1, x2, z1, z2, occ, free]) => ({ x1, x2, z1, z2, occ, free, plaza: true })));
const [, MACY_DOOR_Z] = G([0, 271]);
const DOORS = [
  {
    id: 'galleria',
    x: MCY[1] + 2.6,
    z: MACY_DOOR_Z,
    label: 'Enter Galleria',
    pin: 'G',
    exit: { x: MCY[1] + 5, z: MACY_DOOR_Z, rot: Math.PI / 2 },
  },
  {
    id: 'target',
    x: TGT[1] + 3.6,
    z: PLAZA.door,
    label: 'Enter Target',
    pin: 'T',
    exit: { x: TGT[1] + 4.6, z: PLAZA.door + 3.2, rot: Math.PI / 2 },
  },
];
// labelled places for the minimap and the location readout, in game units
const PLACES = [
  // top: checked before street names, so the entrances read as places, not as the street outside
  {
    r: [MCY[1] - 1, MCY[1] + 6, G([0, 271])[1] - 7, G([0, 271])[1] + 7],
    n: 'Galleria Dallas',
    s: 'Macy’s entrance on Noel Rd · open',
    top: true,
  },
  {
    r: [TGT[1], TGT[1] + 5.5, PLAZA.door - 9, PLAZA.door + 9],
    n: 'Target',
    s: 'Front entrance · open',
    top: true,
  },
  { r: [...MCY], n: 'Macy’s', s: 'Galleria Dallas · Noel Rd entrance', map: 'MACY’S' },
  { r: [...NGAR], n: 'Nordstrom Garage', s: 'Galleria Dallas · Noel Rd at Alpha Rd', map: 'GARAGE' },
  { r: box4([-183, -82, 12, 86]), n: 'Nordstrom', s: 'Galleria Dallas · north anchor', map: 'NORDSTROM' },
  { r: box4([-212, -161, 272, 357]), n: 'The Westin Galleria', s: 'Hotel · Galleria Dallas', map: 'WESTIN' },
  { r: box4([-225, -150, 100, 180]), n: 'Netflix House', s: 'Galleria Dallas', map: 'NETFLIX HOUSE' },
  { r: box4([-300, -190, 15, 80]), n: 'Orange Garage', s: 'Galleria Dallas parking', map: '' },
  { r: box4([-160, -97, 495, 620]), n: 'Blue Garage', s: 'Galleria Dallas parking', map: '' },
  { r: box4([-85, -28, 416, 586]), n: 'Yellow Garage', s: 'Galleria Dallas parking', map: '' },
  { r: box4([-83, -13, 197, 235]), n: 'Two Galleria Tower', s: 'Offices · 13455 Noel Rd', map: '' },
  { r: box4([-87, -12, 361, 390]), n: 'One Galleria Tower', s: 'Offices · 13355 Noel Rd', map: '' },
  { r: box4([-81, -12, 604, 670]), n: 'Three Galleria Tower', s: 'Offices · 13155 Noel Rd', map: '' },
  { r: box4([26, 93, 191, 231]), n: 'Le Méridien Dallas', s: 'Hotel · Noel Rd', map: 'LE MÉRIDIEN' },
  { r: box4([122, 198, 424, 507]), n: 'Residence Inn', s: 'Hotel · James Temple Dr', map: 'RESIDENCE INN' },
  {
    r: [PLAZA.thru[0] - 1, PLAZA.x2, PLAZA.mcd[2] - 2, PLAZA.mcd[3] + 4],
    n: 'McDonald’s',
    s: 'Target Plaza · Montfort Dr',
    map: 'McDONALD’S',
  },
  {
    r: [PLAZA.game[0] - 3, PLAZA.x2, PLAZA.game[2] - 3, PLAZA.game[3] + 2],
    n: 'Game Over Videogames',
    s: 'Target Plaza · next to AT&T',
    map: '',
  },
  { r: [...PLAZA.strip], n: 'Shops', s: 'Target Plaza · Montfort Dr at James Temple', map: '' },
  { r: [...TGT], n: 'Target', s: 'Target Plaza · Montfort Dr', map: 'TARGET' },
  {
    r: [PLAZA.x1, PLAZA.x2, PLAZA.z1, PLAZA.z2],
    n: 'Target Plaza',
    s: 'Parking lot · Montfort Dr',
    map: '',
  },
  {
    r: box4([-198, -82, 86, 470]),
    n: 'Galleria Dallas',
    s: 'Mall · doors on Noel Rd at Macy’s',
    map: 'GALLERIA',
  },
];
const BOUNDS = { x1: -250, x2: 345, z1: -104, z2: 368 };

export {
  BOUNDS,
  BUILDINGS,
  DOORS,
  G,
  INTS,
  LOTS,
  MALL,
  MCD,
  MCY,
  NGAR,
  PLACES,
  RD,
  ROADS,
  SW,
  PLAZA,
  TGT,
  VAULT,
  distRoad,
  sAt,
};
