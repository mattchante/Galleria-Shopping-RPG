// Third-person follow camera.
import { state } from '../core/state.js';
import { camera } from '../core/renderer.js';
import { blockers, clamp } from '../core/helpers.js';
import { dirv, ray, tgt, want } from '../core/collision.js';
import { P } from '../player/avatar.js';
import { V } from '../vehicles/suv.js';
import { cam } from '../player/input.js';

function stepCamera(dt) {
  const inCar = V.active;
  tgt.set(P.pos.x, P.pos.y + (inCar ? 2.0 : 1.55), P.pos.z);
  if (inCar && performance.now() - state.lastLook > 1200) {
    let d = V.h + Math.PI - cam.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    cam.yaw += d * Math.min(1, dt * (1.5 + Math.abs(V.speed) * 0.06));
    cam.pitch += (0.2 - cam.pitch) * Math.min(1, dt * 1.5);
  }
  const maxD =
    state.mode === 'room'
      ? Math.min(cam.dist, state.curRoom.camMax, state.shopCur ? 3.6 : 99)
      : inCar
        ? cam.dist + 4 + Math.abs(V.speed) * 0.07
        : cam.dist;
  const fov = inCar
    ? 60 + Math.min(16, Math.abs(V.speed) * 0.35)
    : state.skating || state.sprinting
      ? 60 + Math.min(6, Math.hypot(P.vel.x, P.vel.z) * 0.45)
      : 60;
  if (Math.abs(camera.fov - fov) > 0.05) {
    camera.fov += (fov - camera.fov) * Math.min(1, dt * 3);
    camera.updateProjectionMatrix();
  }
  dirv.set(
    Math.sin(cam.yaw) * Math.cos(cam.pitch),
    Math.sin(cam.pitch),
    Math.cos(cam.yaw) * Math.cos(cam.pitch),
  );
  ray.set(tgt, dirv);
  ray.far = maxD + 0.4;
  const hits = ray.intersectObjects(state.mode === 'room' ? state.curRoom.blockers : blockers, false);
  let d = maxD;
  if (hits.length) d = Math.max(0.8, Math.min(maxD, hits[0].distance - 0.35));
  cam.cur += (d - cam.cur) * Math.min(1, dt * (d < cam.cur ? 18 : 4));
  want.copy(tgt).addScaledVector(dirv, cam.cur);
  if (want.y < 0.35) want.y = 0.35;
  if (state.mode === 'room') {
    const M = state.curRoom.camRM || state.curRoom.RM;
    want.x = clamp(want.x, M.x1 + 0.25, M.x2 - 0.25);
    want.z = clamp(want.z, M.z1 + 0.25, M.z2 - 0.25);
    want.y = Math.min(want.y, M.h - 0.25);
  }
  camera.position.copy(want);
  camera.lookAt(tgt);
}

export { stepCamera };
