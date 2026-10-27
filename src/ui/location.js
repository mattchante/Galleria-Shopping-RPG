// Location readout: which street, store or area the player is in.
import { state } from '../core/state.js';
import { $ } from '../core/util.js';
import { PLACES, RD, ROADS, SW, distRoad } from '../world/layout.js';
import { P } from '../player/avatar.js';

/* ---------- location readout ---------- */
const locName = $('#locName'),
  locSub = $('#locSub'),
  locEye = $('#locEyebrow');
state.lastLoc = '';
function locate() {
  if (state.mode === 'room')
    return state.curRoom.labelAt ? state.curRoom.labelAt(P.pos) : state.curRoom.label;
  const x = P.pos.x,
    z = P.pos.z;
  for (const p of PLACES)
    if (p.top && x > p.r[0] && x < p.r[1] && z > p.r[2] && z < p.r[3])
      return [p.n, p.s, 'Galleria area · Dallas'];
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
  if (distRoad(RD.dnt, x, z) < RD.dnt.w / 2)
    return ['Dallas N Tollway', 'Underneath the elevated lanes', 'Galleria area · Dallas'];
  for (const p of PLACES)
    if (!p.top && x > p.r[0] && x < p.r[1] && z > p.r[2] && z < p.r[3])
      return [p.n, p.s, 'Galleria area · Dallas'];
  return ['Near ' + near[0].r.name, 'Dallas, TX 75240', 'Galleria area · Dallas'];
}

export { locEye, locName, locSub, locate };
