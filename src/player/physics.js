// Walking, skating, sprinting, jumping and floor heights.
import { state } from '../core/state.js';
import { collide } from '../core/collision.js';
import { animate } from '../life/people.js';
import { P, blades, board, ph, puff, skatePose, stepPuff } from './avatar.js';
import { cam, keys, skateToggle, stick } from './input.js';

function stepPlayer(dt) {
  let fz = 0,
    sx = 0;
  if (keys.KeyW || keys.ArrowUp) fz += 1;
  if (keys.KeyS || keys.ArrowDown) fz -= 1;
  if (keys.KeyD || keys.ArrowRight) sx += 1;
  if (keys.KeyA || keys.ArrowLeft) sx -= 1;
  if (stick.id !== null) {
    fz -= stick.y;
    sx += stick.x;
  }
  const fwd = { x: -Math.sin(cam.yaw), z: -Math.cos(cam.yaw) },
    rt = { x: -fwd.z, z: fwd.x };
  let mx = fwd.x * fz + rt.x * sx,
    mz = fwd.z * fz + rt.z * sx;
  const ml = Math.hypot(mx, mz);
  state.skating = state.mode === 'out' && !!(keys.ShiftLeft || keys.ShiftRight || skateToggle);
  state.iceSkating = state.mode === 'room' && !!state.curRoom.onIce && state.curRoom.onIce(P.pos);
  const glide = state.skating || state.iceSkating,
    boost = keys.ShiftLeft || keys.ShiftRight || skateToggle;
  state.sprinting = state.mode === 'room' && !state.iceSkating && boost && ml > 0.05;
  const top =
      (state.skating ? 16.4 : state.iceSkating ? (boost ? 9.5 : 6.2) : state.sprinting ? 8.6 : 4.1) *
      Math.min(1, ml),
    cur = Math.hypot(P.vel.x, P.vel.z);
  if (ml > 0.05) {
    mx /= ml;
    mz /= ml;
    let a = Math.atan2(mx, mz) - P.rot;
    a = Math.atan2(Math.sin(a), Math.cos(a));
    P.rot += a * Math.min(1, dt * (state.skating ? 4.5 : state.iceSkating ? 3.5 : 12));
    if (glide) {
      mx = Math.sin(P.rot);
      mz = Math.cos(P.rot);
    }
  }
  const pushing = glide && ml > 0.05 && cur < top * 0.9;
  const k = Math.min(
    1,
    dt *
      (!P.ground
        ? 2.5
        : state.skating
          ? top > cur
            ? 1.4
            : 0.7
          : state.iceSkating
            ? top > cur
              ? 1.1
              : 0.25
            : 10),
  );
  P.vel.x += (mx * top - P.vel.x) * k;
  P.vel.z += (mz * top - P.vel.z) * k;
  if (state.jumpQ) {
    state.jumpQ = false;
    if (P.ground) {
      P.vy = 6.6;
      P.ground = false;
      P.jumps = 1;
    } else if ((P.jumps || 0) < 2) {
      P.vy = 7.4;
      P.jumps = 2;
      P.spin = 1;
      puff();
    }
  }
  P.pos.x += P.vel.x * dt;
  P.pos.z += P.vel.z * dt;
  if (state.mode === 'room' && state.curRoom.conveyor) P.pos.z += state.curRoom.conveyor(P.pos) * dt;
  collide(P.pos, 0.42);
  const fy =
    state.mode === 'room' && state.curRoom.floorAt ? state.curRoom.floorAt(P.pos.x, P.pos.z, P.pos.y) : 0;
  P.vy -= 22 * dt;
  P.pos.y += P.vy * dt;
  if (P.pos.y <= fy) {
    P.pos.y = fy;
    P.vy = 0;
    P.ground = true;
  } else if (P.ground && P.vy <= 0 && P.pos.y - fy < 0.75) {
    P.pos.y = fy;
    P.vy = 0;
  } else P.ground = false;
  if (P.ground) P.jumps = 0;
  if (P.spin > 0) P.spin = Math.max(0, P.spin - dt * 2.4);
  ph.g.position.copy(P.pos);
  ph.g.position.y += state.skating ? 0.14 : state.iceSkating ? 0.1 : 0.04;
  ph.g.rotation.y = P.rot + (P.spin > 0 ? (1 - P.spin) * Math.PI * 2 : 0);
  board.visible = state.skating;
  blades.visible = state.iceSkating;
  if (P.spin > 0 && !state.skating && !state.iceSkating) {
    const t = Math.sin(P.spin * Math.PI);
    ph.legL.rotation.x = ph.legR.rotation.x = -1.1 * t;
    ph.armL.rotation.z = -1.2 * t;
    ph.armR.rotation.z = 1.2 * t;
  }
  stepPuff(dt);
  if (glide) skatePose(ph, pushing, dt);
  else animate(ph, Math.hypot(P.vel.x, P.vel.z), dt, !P.ground);
  ph.torso.rotation.x = state.sprinting && P.ground ? 0.2 : 0;
  if (state.sprinting && P.ground) {
    ph.armL.rotation.x *= 1.5;
    ph.armR.rotation.x *= 1.5;
    ph.legL.rotation.x *= 1.25;
    ph.legR.rotation.x *= 1.25;
  }
}

export { stepPlayer };
