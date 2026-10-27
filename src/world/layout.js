// Map data: street centerlines, building footprints, lots and doors. Metres; +x east, +z south; Noel Rd is x=0, Alpha Rd is z=0.

/*DATA-START*/
/* World units are metres. +x is east, +z is south. Noel Rd sits on x=0, Alpha Rd on z=0.
   The layout follows the street map at roughly half real scale so the area is quick to cross. */
const SW = 4,
  K = 0.5;
// sidewalk width, map compression
const BOUNDS = { x1: -272, x2: 450, z1: -114, z2: 464 };
function catmull(P, per) {
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)],
      p1 = P[i],
      p2 = P[i + 1],
      p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per,
        t2 = t * t,
        t3 = t2 * t;
      out.push(
        [0, 1].map(
          (j) =>
            0.5 *
            (2 * p1[j] +
              (-p0[j] + p2[j]) * t +
              (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 +
              (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3),
        ),
      );
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
const DNTX = -212.5,
  PKE = DNTX + 35,
  PKW = DNTX - 35,
  LBJZ = 445,
  I635Z = 481;
const MED = [PKW + 6 + SW, PKE - 6 - SW];
// ground strip under the Tollway between the frontage sidewalks
const MONTFORT = [
  [272.5, -1300],
  ...catmull(
    [
      [272.5, 24],
      [286, 40],
      [308, 60],
      [338, 84],
      [366, 106],
      [386, 126],
      [394, 145],
    ],
    3,
  ),
  [394, 1600],
];
const ROADS = [
  {
    id: 'alpha',
    name: 'Alpha Rd',
    pts: [
      [-1300, 0],
      [1600, 0],
    ],
    w: 18,
    type: 'two4',
    spd: 13,
    traffic: true,
  },
  {
    id: 'noel',
    name: 'Noel Rd',
    pts: [
      [0, -1300],
      [0, LBJZ],
    ],
    w: 16,
    type: 'two4',
    spd: 13,
    traffic: true,
  },
  { id: 'montfort', name: 'Montfort Dr', pts: MONTFORT, w: 16, type: 'two4', spd: 12, traffic: true },
  {
    id: 'pkwyE',
    name: 'Dallas Pkwy',
    pts: [
      [PKE, 1600],
      [PKE, -1300],
    ],
    w: 12,
    type: 'one3',
    spd: 16,
    traffic: true,
  },
  {
    id: 'pkwyW',
    name: 'Dallas Pkwy',
    pts: [
      [PKW, -1300],
      [PKW, 1600],
    ],
    w: 12,
    type: 'one3',
    spd: 16,
    traffic: true,
  },
  {
    id: 'lbj',
    name: 'LBJ Fwy',
    pts: [
      [1700, LBJZ],
      [-1300, LBJZ],
    ],
    w: 12,
    type: 'one3',
    spd: 15,
    traffic: true,
  },
  {
    id: 'lbjS',
    name: 'LBJ Fwy',
    pts: [
      [-1300, LBJZ + 72],
      [1700, LBJZ + 72],
    ],
    w: 12,
    type: 'one3',
    spd: 15,
    traffic: true,
  },
  {
    id: 'peterson',
    name: 'Peterson Ln',
    pts: [
      [0, 155],
      [394, 155],
    ],
    w: 11,
    type: 'two2',
  },
  {
    id: 'jtemple',
    name: 'James Temple Dr',
    pts: [
      [0, 255],
      [394, 255],
    ],
    w: 12,
    type: 'two2',
  },
  {
    id: 'bryce',
    name: 'Bryce Ln',
    pts: [
      [0, 346.5],
      [124, 346.5],
    ],
    w: 10,
    type: 'two2',
  },
  {
    id: 'cornell',
    name: 'Cornell Dr',
    pts: [
      [124, 255],
      [124, LBJZ],
    ],
    w: 10,
    type: 'two2',
  },
  {
    id: 'dnt',
    name: 'Dallas N Tollway',
    pts: [
      [DNTX, -1300],
      [DNTX, I635Z - 6],
    ],
    w: 26,
    type: 'hwy',
    spd: 27,
    traffic: true,
    elevated: true,
  },
  {
    id: 'i635',
    name: 'I-635 LBJ Fwy',
    pts: [
      [-1400, I635Z],
      [1900, I635Z],
    ],
    w: 28,
    type: 'hwy',
    spd: 28,
    traffic: true,
    elevated: true,
  },
];
function prepRoad(r) {
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
  const w = r.w;
  r.bb = [
    Math.min(...r.pts.map((p) => p[0])) - w,
    Math.max(...r.pts.map((p) => p[0])) + w,
    Math.min(...r.pts.map((p) => p[1])) - w,
    Math.max(...r.pts.map((p) => p[1])) + w,
  ];
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
  r.y = r.elevated ? 9.25 : r.segs[0].axis === 'x' ? 0.02 : 0.026;
}
ROADS.forEach(prepRoad);
const RD = Object.fromEntries(ROADS.map((r) => [r.id, r]));
function computeInts() {
  const out = [],
    G = ROADS.filter((r) => !r.elevated);
  for (let i = 0; i < G.length; i++)
    for (let j = i + 1; j < G.length; j++)
      for (const sa of G[i].segs)
        for (const sb of G[j].segs) {
          let E, N, se, sn;
          if (sa.axis === 'x' && sb.axis === 'z') {
            E = G[i];
            N = G[j];
            se = sa;
            sn = sb;
          } else if (sa.axis === 'z' && sb.axis === 'x') {
            E = G[j];
            N = G[i];
            se = sb;
            sn = sa;
          } else continue;
          const z = se.a[1],
            x = sn.a[0],
            x0 = Math.min(se.a[0], se.b[0]),
            x1 = Math.max(se.a[0], se.b[0]),
            z0 = Math.min(sn.a[1], sn.b[1]),
            z1 = Math.max(sn.a[1], sn.b[1]);
          if (x < x0 - 0.01 || x > x1 + 0.01 || z < z0 - 0.01 || z > z1 + 0.01) continue;
          out.push({
            x,
            z,
            E,
            N,
            sE: se.s0 + Math.abs(x - se.a[0]),
            sN: sn.s0 + Math.abs(z - sn.a[1]),
            ext: { w: x - x0 > 1, e: x1 - x > 1, n: z - z0 > 1, s: z1 - z > 1 },
            sig: !!(E.traffic && N.traffic),
          });
        }
  return out;
}
const INTS = computeInts();
function distSeg(px, pz, s) {
  const vx = s.b[0] - s.a[0],
    vz = s.b[1] - s.a[1];
  let t = ((px - s.a[0]) * vx + (pz - s.a[1]) * vz) / (s.len * s.len);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = s.a[0] + vx * t - px,
    qz = s.a[1] + vz * t - pz;
  return Math.sqrt(qx * qx + qz * qz);
}
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
const S = (b) => [b[0] * K, b[1] * K, b[2] * K, b[3] * K, ...b.slice(4)];
const TGT = [210, 350, 280, 361];
// Target store footprint
const MCD = [342, 366, 392, 410];
// McDonald's at Montfort & LBJ
const MCDPAD = [336, 380, 378, 433];
// its drive-thru loop
const MALLF = 65;
// north face of the mall's north anchor
// [x1,x2,z1,z2,height,facade,tint,label]
const BUILDINGS = [
  // west of the Tollway
  [-320, -262, -90, -22, 46, 'glass', 0x7a9ab0],
  [-320, -262, 20, 100, 60, 'glass', 0x6687a0],
  [-320, -262, 130, 210, 30, 'apt', 0xe4d6bc],
  [-320, -262, 240, 320, 40, 'glass', 0x8aa4b6],
  [-320, -262, 350, 430, 24, 'brick', 0xa86450],
  ...[
    // north side of Alpha Rd
    [-330, -260, -150, -28, 38, 'glass', 0x87a3b3],
    [-230, -150, -80, -24, 9, 'store', 0xe6d6bd],
    [-120, -24, -170, -26, 24, 'apt', 0xeadfca],
    [22, 120, -60, -22, 6, 'store', 0xe9dcc4],
    [22, 130, -210, -90, 18, 'apt', 0xd9cdb6],
    [170, 300, -170, -30, 30, 'glass', 0x6c8fa8],
    [330, 500, -190, -36, 20, 'brick', 0xb4664d],
    [575, 700, -180, -30, 22, 'apt', 0xe8dcc5],
    [730, 880, -200, -40, 14, 'brick', 0x9c5642],
    // Galleria office towers + garages along Noel
    [-80, -28, 280, 330, 100, 'glass', 0x6f9cc0],
    [-80, -28, 420, 470, 126, 'glass', 0x5f8fb6],
    [-80, -28, 560, 610, 95, 'glass', 0x7aa5c4],
    [-146, -92, 140, 240, 14, 'garage', 0xd9d6cf],
    [-145, -95, 280, 340, 16, 'garage', 0xd9d6cf],
    [-145, -95, 430, 520, 16, 'garage', 0xd9d6cf],
    // Noel to Montfort, Alpha to Peterson
    [25, 140, 25, 150, 22, 'apt', 0xeadfca],
    [25, 100, 190, 295, 48, 'glass', 0x8c95a3, 'meridien'],
    [180, 330, 25, 75, 12, 'store', 0xe7e1d5],
    [250, 330, 110, 280, 36, 'glass', 0x6a93b4],
    [380, 450, 40, 280, 20, 'apt', 0xe3d2b4],
    [470, 520, 30, 90, 10, 'store', 0xe9dcc4],
    [480, 600, 130, 290, 20, 'brick', 0xa65e48],
    [660, 800, 25, 100, 14, 'apt', 0xece2cf],
    [815, 900, 140, 290, 26, 'glass', 0x7d9bb0],
    // Peterson to James Temple
    [20, 190, 328, 495, 18, 'apt', 0xe6d8bf, 'verona'],
    [225, 380, 328, 495, 16, 'brick', 0xa15c45],
    [420, 620, 340, 490, 26, 'glass', 0x58748a],
    [650, 770, 330, 495, 14, 'apt', 0xd6c6aa],
    // south of James Temple
    [15, 232, 528, 678, 32, 'glass', 0x6f8fa8],
    [15, 232, 708, 872, 12, 'store', 0xe7e1d5],
    [300, 600, 776, 872, 8, 'store', 0xebe2d0, 'crossings'],
    // east of Montfort
    [815, 900, 330, 500, 18, 'apt', 0xe6d8bf],
    [815, 900, 540, 700, 22, 'brick', 0xa15c45],
    [815, 900, 740, 870, 14, 'apt', 0xece2cf],
  ].map(S),
  [...TGT, 10, 'store', 0xeeebe5, 'target'],
  [...MCD, 6, 'store', 0xd6c9b2, 'mcd'],
]
  .map((b) => {
    const c = clipRect(b.slice(0, 4), 2);
    return c ? [...c, ...b.slice(4)] : null;
  })
  .filter(Boolean);
const MALL = [
  // Galleria Dallas: main concourse, north anchor (entrance), south anchor, hotel tower
  [-160, -75, 100, 310, 20, 'stone', 0xf2eadb],
  [-150, -85, MALLF, 115, 22, 'stone', 0xd9ccb3],
  [-150, -85, 300, 345, 24, 'stone', 0xddd1bb],
  [-169, -149, 190, 220, 64, 'glass', 0x7c97a8],
].map((b) => [...clipRect(b.slice(0, 4), 2), ...b.slice(4)]);
const LOTS = [
  { x1: -166, x2: -12, z1: 9, z2: MALLF - 6, walk: [-120.5, -114.5], fire: true, occ: 0.62 },
  { x1: -166, x2: -10, z1: 351, z2: 438, occ: 0.42 },
  { x1: 131, x2: 202, z1: 262, z2: 378, occ: 0.45 },
  { x1: 312, x2: 336, z1: 375, z2: 433, occ: 0.5 },
];
LOTS.forEach((L) => {
  const c = clipRect([L.x1, L.x2, L.z1, L.z2], 0.5);
  [L.x1, L.x2, L.z1, L.z2] = c;
});
const DOORS = [
  {
    id: 'galleria',
    x: -117.5,
    z: MALLF - 4,
    label: 'Enter Galleria',
    pin: 'G',
    exit: { x: -117.5, z: MALLF - 7.2, rot: Math.PI },
  },
  {
    id: 'target',
    x: TGT[0] - 4.4,
    z: 320,
    label: 'Enter Target',
    pin: 'T',
    exit: { x: TGT[0] - 7.6, z: 320, rot: -Math.PI / 2 },
  },
];

export {
  BOUNDS,
  BUILDINGS,
  DNTX,
  DOORS,
  I635Z,
  INTS,
  LBJZ,
  LOTS,
  MALL,
  MALLF,
  MCD,
  MCDPAD,
  MED,
  PKE,
  PKW,
  RD,
  ROADS,
  SW,
  TGT,
  distRoad,
};
