// Entry point: loads every module in order, runs the game loop and the start button.
import './styles.css';
// Load order matters: each module builds its part of the world when it loads. Add new modules here.
import './core/util.js';
import './world/layout.js';
import './core/renderer.js';
import './core/helpers.js';
import './core/collision.js';
import './core/materials.js';
import './world/sky.js';
import './world/streets.js';
import './world/signals.js';
import './world/buildings.js';
import './world/lots.js';
import './world/target-plaza.js';
import './world/mall-exterior.js';
import './life/traffic.js';
import './world/trees.js';
import './life/people.js';
import './player/avatar.js';
import './vehicles/suv.js';
import './interiors/target.js';
import './interiors/galleria/index.js';
import './interiors/rooms.js';
import './ui/minimap.js';
import './ui/location.js';
import './player/input.js';
import './interiors/doors.js';
import './player/physics.js';
import './view/camera.js';
import './ui/hud.js';
import { SPOTS, toggleTravel, travel } from './ui/travel.js';
import { state } from './core/state.js';
import { $ } from './core/util.js';
import { DOORS } from './world/layout.js';
import { camera, canvas, isTouch, renderer, scene } from './core/renderer.js';
import { _lp } from './core/collision.js';
import { SUN_OFF, sky, sun } from './world/sky.js';
import { marksOut } from './world/mall-exterior.js';
import { stepTraffic, updateLamps } from './life/traffic.js';
import { animate, stepNPCs } from './life/people.js';
import { P, ph } from './player/avatar.js';
import { V, stepCar, toggleCar } from './vehicles/suv.js';
import { ROOMS, stepRoomNPCs } from './interiors/rooms.js';
import { locName, locSub } from './ui/location.js';
import { cam, keys } from './player/input.js';
import { stepPlayer } from './player/physics.js';
import { stepCamera } from './view/camera.js';
import { moveModeEl, stepHUD } from './ui/hud.js';

/* ---------- loop ---------- */
function resize() {
  const w = innerWidth,
    h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
let last = performance.now(),
  attract = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.sigT += dt;
  updateLamps();
  stepTraffic(dt);
  stepNPCs(dt);
  const pulse = 0.75 + Math.sin(now * 0.004) * 0.25;
  for (const m of [...marksOut, ...Object.values(ROOMS).flatMap((r) => [r.mark, ...(r.marks || [])])]) {
    m.children[1].material.opacity = 0.1 + 0.1 * pulse;
    m.children[0].scale.setScalar(0.92 + 0.08 * pulse);
  }
  if (state.mode === 'room' && state.curRoom.npcs) stepRoomNPCs(dt);
  let focus;
  if (state.started) {
    if (!state.busy) {
      if (V.active) stepCar(dt);
      else stepPlayer(dt);
    }
    stepCamera(dt);
    stepHUD(dt);
    focus = P.pos;
  } else {
    attract += dt * 0.05;
    const cx = -50,
      cz = 130;
    camera.position.set(cx + Math.sin(attract) * 230, 85, cz - Math.cos(attract) * 230);
    camera.lookAt(cx, 10, cz);
    ph.g.position.copy(P.pos);
    ph.g.rotation.y = P.rot;
    animate(ph, 0, dt, false);
    focus = _lp;
    _lp.x = cx;
    _lp.z = cz;
  }
  const fx = focus.x,
    fz = focus.z;
  sun.position.set(fx + SUN_OFF.x, SUN_OFF.y, fz + SUN_OFF.z);
  sun.target.position.set(fx, 0, fz);
  sun.target.updateMatrixWorld();
  sky.position.copy(camera.position);
  renderer.render(state.mode === 'room' ? state.curRoom.scene : scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
/* ---------- start ---------- */
const startBtn = $('#start');
startBtn.disabled = false;
startBtn.textContent = 'Start walking';
startBtn.addEventListener('click', () => {
  state.started = true;
  $('#title').hidden = true;
  $('#hud').hidden = false;
  if (isTouch) {
    $('#touch').hidden = false;
    $('#keys').hidden = true;
  }
  cam.yaw = P.rot + Math.PI; // behind the player, who starts facing Macy's entrance
  cam.pitch = 0.22;
  canvas.focus();
  if (!isTouch) {
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
});
/* ---------- debug hook (dev server, or any build with ?debug in the URL) ---------- */
if (import.meta.env.DEV || new URLSearchParams(location.search).has('debug')) {
  window.__g = {
    start() {
      if (!state.started) startBtn.click();
    },
    teleport({ x, z, y = 0, yaw }) {
      P.pos.set(x, y, z);
      P.vel.set(0, 0, 0);
      P.vy = 0;
      if (yaw !== undefined) {
        P.rot = yaw + Math.PI;
        cam.yaw = yaw;
      }
    },
    setCam(yaw, pitch = 0.25, dist = 7) {
      cam.yaw = yaw;
      cam.pitch = pitch;
      cam.dist = dist;
      cam.cur = dist;
    },
    enter(id) {
      const d = DOORS.find((d) => d.id === id);
      state.mode = 'room';
      state.curDoor = d;
      state.curRoom = ROOMS[d.id];
      state.curRoom.scene.add(ph.g);
      P.pos.set(state.curRoom.spawn.x, 0, state.curRoom.spawn.z);
    },
    room(id) {
      state.curRoom = ROOMS[id];
      state.mode = 'room';
      state.curRoom.scene.add(ph.g);
      P.pos.set(state.curRoom.spawn.x, 0, state.curRoom.spawn.z);
    },
    outside() {
      state.mode = 'out';
      scene.add(ph.g);
    },
    // fast travel to a named spot from the map's list, or open/close the map
    fastTravel(name) {
      travel(SPOTS.find((s) => s.n === name));
    },
    toggleMap() {
      toggleTravel();
    },
    toggleDrive() {
      toggleCar();
    },
    sim(sec) {
      for (let t = 0; t < sec; t += 0.05) stepPlayer(0.05);
    },
    simDrive(sec) {
      for (let t = 0; t < sec; t += 0.05) stepCar(0.05);
    },
    info() {
      return {
        mode: state.mode,
        room: state.mode === 'room' ? state.curRoom.name : null,
        x: P.pos.x,
        y: P.pos.y,
        z: P.pos.z,
        place: locName.textContent,
        sub: locSub.textContent,
        move: moveModeEl.textContent,
        shop: state.shopCur && state.shopCur.n,
      };
    },
    P,
    V,
    keys,
    cam,
    DOORS,
    ROOMS,
    scene,
    renderer,
    camera,
  };
}
