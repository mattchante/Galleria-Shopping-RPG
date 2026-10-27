// Location readout: which street, store or area the player is in.
import { state } from '../core/state.js';
import { $ } from '../core/util.js';
import { LBJZ, MALLF, MCDPAD, MED, ROADS, SW, TGT, distRoad } from '../world/layout.js';
import { P } from '../player/avatar.js';

/* ---------- location readout ---------- */
const PLACES = [
  { r: [-127, -108, 57, 66], n: 'Galleria Dallas', s: 'North entrance · open' },
  { r: [TGT[0] - 9, TGT[0], 310, 330], n: 'Target', s: 'Front entrance · open' },
  { r: [-168, -12, 8, MALLF], n: 'Galleria Dallas', s: 'North lot · off Alpha Rd' },
  { r: [-168, -12, 348, 440], n: 'Galleria Dallas', s: 'South lot · off LBJ Fwy' },
  { r: [-172, -12, MALLF, 348], n: 'Galleria Dallas', s: 'Outside the mall · doors locked' },
  { r: [8, 58, 88, 152], n: 'Le Méridien Dallas', s: 'Hotel · Noel Rd at Peterson Ln' },
  { r: [8, 100, 160, 252], n: 'Verona by Palladium', s: 'Apartments · Peterson Ln' },
  {
    r: [MCDPAD[0] - 26, MCDPAD[1] + 2, MCDPAD[2] - 4, MCDPAD[3] + 4],
    n: "McDonald's",
    s: 'Montfort Dr at LBJ Fwy',
  },
  { r: [128, TGT[1] + 4, 260, 382], n: 'Target', s: 'Parking lot · off James Temple Dr' },
  { r: [140, 306, 382, 440], n: 'The Crossings', s: 'Shopping center · LBJ Fwy' },
];
const locName = $('#locName'),
  locSub = $('#locSub'),
  locEye = $('#locEyebrow');
state.lastLoc = '';
function locate() {
  if (state.mode === 'room')
    return state.curRoom.labelAt ? state.curRoom.labelAt(P.pos) : state.curRoom.label;
  const x = P.pos.x,
    z = P.pos.z;
  if (x > MED[0] && x < MED[1] && Math.abs(z) > 14 && Math.abs(z - LBJZ) > 12)
    return ['Dallas N Tollway', 'Underneath the elevated lanes', 'Galleria area · Dallas'];
  const near = [];
  for (const r of ROADS) {
    if (r.elevated) continue;
    near.push({ r, d: distRoad(r, x, z) - r.w / 2 });
  }
  near.sort((a, b) => a.d - b.d);
  const names = [...new Set(near.filter((n) => n.d < SW + 2).map((n) => n.r.name))];
  if (names.length >= 2)
    return [names[0] + ' & ' + names[1], 'Intersection · Dallas, TX 75240', 'Galleria area · Dallas'];
  if (names.length === 1) return [names[0], 'Dallas, TX 75240', 'Galleria area · Dallas'];
  for (const p of PLACES)
    if (x > p.r[0] && x < p.r[1] && z > p.r[2] && z < p.r[3]) return [p.n, p.s, 'Galleria area · Dallas'];
  return ['Near ' + near[0].r.name, 'Dallas, TX 75240', 'Galleria area · Dallas'];
}

export { locEye, locName, locSub, locate };
