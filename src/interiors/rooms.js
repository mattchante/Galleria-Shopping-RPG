// Room registry and indoor NPC animation.
import { state } from '../core/state.js';
import { DOORS } from '../world/layout.js';
import { animate } from '../life/people.js';
import { skatePose } from '../player/avatar.js';
import { buildTarget } from './target.js';
import { buildGalleria } from './galleria/index.js';

function stepRoomNPCs(dt) {
  for (const n of state.curRoom.npcs) {
    if (n.wp) {
      const a = n.wp[n.seg],
        b = n.wp[(n.seg + 1) % n.wp.length],
        L = Math.hypot(b[0] - a[0], b[1] - a[1]),
        ride = n.seg === 0 || n.seg === 2;
      n.t += (dt * (ride ? 2.4 : 1.2)) / L;
      if (n.t >= 1) {
        n.t = 0;
        n.seg = (n.seg + 1) % n.wp.length;
      }
      const x = a[0] + (b[0] - a[0]) * n.t,
        z = a[1] + (b[1] - a[1]) * n.t;
      n.y = state.curRoom.floorAt(x, z, n.y);
      n.h.g.position.set(x, n.y, z);
      n.h.g.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
      animate(n.h, ride ? 0 : 1.2, dt, false);
      continue;
    }
    if (n.ell) {
      n.t += (dt * n.spd) / n.ell.r;
      const e = n.ell,
        x = e.cx + Math.cos(n.t) * e.rx,
        z = e.cz + Math.sin(n.t) * e.rz;
      n.h.g.position.set(x, n.y, z);
      n.h.g.rotation.y = Math.atan2(-Math.sin(n.t) * e.rx, Math.cos(n.t) * e.rz);
      skatePose(n.h, Math.sin(n.t * 3 + n.ph) > 0.2, dt);
      continue;
    }
    n.t += n.dir * n.spd * dt;
    if (n.t > n.b) {
      n.t = n.b;
      n.dir = -1;
    }
    if (n.t < n.a) {
      n.t = n.a;
      n.dir = 1;
    }
    if (n.ax === 'x') {
      n.h.g.position.set(n.t, n.y || 0, n.c);
      n.h.g.rotation.y = n.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      n.h.g.position.set(n.c, n.y || 0, n.t);
      n.h.g.rotation.y = n.dir > 0 ? 0 : Math.PI;
    }
    animate(n.h, n.spd, dt, false);
  }
  if (state.curRoom.update) state.curRoom.update(dt);
}
const ROOMS = {
  galleria: buildGalleria(),
  target: buildTarget(),
};
state.curRoom = ROOMS.galleria;
state.curDoor = DOORS[0];

export { ROOMS, stepRoomNPCs };
