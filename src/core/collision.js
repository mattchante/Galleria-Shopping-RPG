// Player and SUV collision against boxes, traffic and room bounds.
import * as THREE from 'three';
import { state, late } from './state.js';
import { BOUNDS } from '../world/layout.js';
import { V3, clamp, solids } from './helpers.js';

function pushBox(p, r, s) {
  if (p.x + r > s.x1 && p.x - r < s.x2 && p.z + r > s.z1 && p.z - r < s.z2) {
    const pl = p.x + r - s.x1,
      pr = s.x2 - (p.x - r),
      pu = p.z + r - s.z1,
      pd = s.z2 - (p.z - r),
      m = Math.min(pl, pr, pu, pd);
    if (m === pl) p.x -= pl;
    else if (m === pr) p.x += pr;
    else if (m === pu) p.z -= pu;
    else p.z += pd;
  }
}
const _cb = { x1: 0, x2: 0, z1: 0, z2: 0 },
  _lp = { x: 0, z: 0 };
function pushOBB(p, r, cx, cz, rot, hx, hz) {
  const dx = p.x - cx,
    dz = p.z - cz;
  if (dx * dx + dz * dz > 40) return;
  const cs = Math.cos(rot),
    sn = Math.sin(rot);
  _lp.x = dx * cs - dz * sn;
  _lp.z = dx * sn + dz * cs;
  _cb.x1 = -hx;
  _cb.x2 = hx;
  _cb.z1 = -hz;
  _cb.z2 = hz;
  pushBox(_lp, r, _cb);
  p.x = cx + _lp.x * cs + _lp.z * sn;
  p.z = cz - _lp.x * sn + _lp.z * cs;
}
function collide(p, r, isCar) {
  if (state.mode === 'out') {
    for (let it = 0; it < 2; it++) {
      for (const s of solids) pushBox(p, r, s);
      for (const c of late.movers) {
        if (c.lane.r.elevated || c.x === undefined) continue;
        pushOBB(p, r, c.x, c.z, c.rot, 0.95, 2.28);
      }
      if (!isCar && late.V.exists && !late.V.active)
        pushOBB(p, r, late.V.pos.x, late.V.pos.z, late.V.h, 1.02, 2.5);
    }
    p.x = clamp(p.x, BOUNDS.x1, BOUNDS.x2);
    p.z = clamp(p.z, BOUNDS.z1, BOUNDS.z2);
  } else {
    const M = state.curRoom.RM;
    for (let it = 0; it < 2; it++)
      for (const s of state.curRoom.solids)
        if (s.y1 === undefined || (p.y + 1.7 > s.y0 && p.y < s.y1 - 0.05)) pushBox(p, r, s);
    if (state.curRoom.clampXZ) state.curRoom.clampXZ(p, r);
    else {
      p.x = clamp(p.x, M.x1 + r, M.x2 - r);
      p.z = clamp(p.z, M.z1 + r, M.z2 - r);
    }
  }
}
const ray = new THREE.Raycaster(),
  tgt = new V3(),
  want = new V3(),
  dirv = new V3();

export { _lp, collide, dirv, ray, tgt, want };
