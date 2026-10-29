// Doors between the street and interiors, and between rooms.
import { state } from '../core/state.js';
import { $ } from '../core/util.js';
import { DOORS } from '../world/layout.js';
import { scene } from '../core/renderer.js';
import { P, board, ph } from '../player/avatar.js';
import { V } from '../vehicles/suv.js';
import { ROOMS } from './rooms.js';
import { cam } from '../player/input.js';
import { late } from '../core/state.js';

/* ---------- interaction / transitions ---------- */
const fade = $('#fade'),
  promptEl = $('#prompt'),
  promptText = $('#promptText'),
  shopEl = $('#shop'),
  shopName = $('#shopName'),
  shopLink = $('#shopLink'),
  shopHint = $('#shopHint'),
  shopSub = $('#shopSub'),
  shopIcon = $('#shopIcon'),
  shopHintText = $('#shopHintText');
state.shopCur = null;
const ICONS = {
  phone:
    '<svg viewBox="0 0 24 24"><rect x="7" y="2.5" width="10" height="19" rx="2.6"/><path d="M10.5 5h3"/></svg>',
  tablet:
    '<svg viewBox="0 0 24 24"><rect x="4" y="2.5" width="16" height="19" rx="2.4"/><circle cx="12" cy="18.6" r=".5"/></svg>',
  laptop:
    '<svg viewBox="0 0 24 24"><rect x="4.5" y="5" width="15" height="10.5" rx="1.4"/><path d="M2.5 18.5h19"/></svg>',
};
function nearDoor() {
  if (state.mode === 'out') {
    for (const d of DOORS) if (Math.hypot(P.pos.x - d.x, P.pos.z - d.z) < 2.6) return d;
    return null;
  }
  if (state.curRoom.subDoors)
    for (const d of state.curRoom.subDoors)
      if (P.pos.y < 1 && Math.hypot(P.pos.x - d.x, P.pos.z - d.z) < 2.2) return { sub: d };
  const D = state.curRoom.door;
  return Math.hypot(P.pos.x - D.x, P.pos.z - (D.z - 0.9)) < 2.2 && P.pos.y < 1 ? state.curRoom : null;
}
function interact() {
  if (!state.started || state.busy || V.active) return;
  if (state.shopCur) {
    try {
      if (document.pointerLockElement) document.exitPointerLock();
    } catch (e) {}
    shopLink.focus();
    return;
  }
  const d = nearDoor();
  if (!d) return;
  if (state.mode === 'out') go(d);
  else if (d.sub) goRoom(d.sub.to);
  else if (state.curRoom.parent) goRoom(state.curRoom.parent, state.curRoom.back);
  else go('out');
}
function goRoom(id, at) {
  state.busy = true;
  state.flying = false;
  fade.classList.add('on');
  state.skating = false;
  board.visible = false;
  setTimeout(() => {
    state.curRoom = ROOMS[id];
    state.curRoom.scene.add(ph.g);
    const sp = at || { ...state.curRoom.spawn, rot: Math.PI };
    P.pos.set(sp.x, 0, sp.z);
    P.rot = sp.rot;
    cam.yaw = sp.rot + Math.PI;
    cam.cur = Math.min(cam.dist, state.curRoom.camMax);
    cam.pitch = 0.3;
    P.vel.set(0, 0, 0);
    P.vy = 0;
    P.jumps = 0;
    setTimeout(() => {
      fade.classList.remove('on');
      state.busy = false;
    }, 140);
  }, 380);
}
function go(where) {
  state.busy = true;
  state.flying = false;
  fade.classList.add('on');
  state.skating = false;
  board.visible = false;
  setTimeout(() => {
    if (where !== 'out') {
      state.curDoor = where;
      state.curRoom = ROOMS[where.id];
      state.mode = 'room';
      state.curRoom.scene.add(ph.g);
      P.pos.set(state.curRoom.spawn.x, 0, state.curRoom.spawn.z);
      P.rot = Math.PI;
      cam.cur = Math.min(cam.dist, state.curRoom.camMax);
      cam.yaw = 0;
    } else {
      state.mode = 'out';
      scene.add(ph.g);
      const e = state.curDoor.exit;
      P.pos.set(e.x, 0, e.z);
      P.rot = e.rot;
      cam.cur = cam.dist;
      cam.yaw = e.rot + Math.PI;
    }
    cam.pitch = 0.3;
    P.vel.set(0, 0, 0);
    P.vy = 0;
    setTimeout(() => {
      fade.classList.remove('on');
      state.busy = false;
    }, 140);
  }, 380);
}

Object.assign(late, { interact });
export {
  ICONS,
  nearDoor,
  promptEl,
  promptText,
  shopEl,
  shopHint,
  shopHintText,
  shopIcon,
  shopLink,
  shopName,
  shopSub,
};
