// Keyboard, mouse and touch input.
import { state, late } from '../core/state.js';
import { $ } from '../core/util.js';
import { canvas, isTouch } from '../core/renderer.js';
import { clamp } from '../core/helpers.js';
import { V, toggleCar } from '../vehicles/suv.js';
import { mapWrap } from '../ui/minimap.js';

/* ---------- input ---------- */
const keys = {};
state.mode = 'out';
state.started = false;
state.busy = false;
const cam = { yaw: Math.PI, pitch: 0.3, dist: 7, cur: 7 };
state.lastLook = 0;
addEventListener('keydown', (e) => {
  if (!state.started) return;
  if (e.code === 'Space' && !e.repeat && !V.active) state.jumpQ = true;
  if (e.code === 'Tab') {
    e.preventDefault();
    if (!e.repeat) toggleCar();
    return;
  }
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyE' && !e.repeat) late.interact();
  if (e.code === 'KeyM' && !e.repeat) late.toggleTravel();
  if (e.code === 'KeyF' && !e.repeat && !V.active && !state.busy) {
    // dev flying: fly around to look at the map; F again to drop back down
    state.flying = !state.flying;
    late.P.vy = 0;
    if (state.flying) {
      late.P.pos.y += 3;
      cam.dist = Math.max(cam.dist, 14);
    } else cam.dist = Math.min(cam.dist, 14);
  }
  if (state.flying && ['ControlLeft', 'ControlRight', 'KeyC'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => {
  keys[e.code] = false;
});
addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
});
let dragging = false;
canvas.addEventListener('mousedown', (e) => {
  if (!state.started) return;
  dragging = true;
  if (!isTouch && document.pointerLockElement !== canvas) {
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (err) {}
  }
});
addEventListener('mouseup', () => {
  dragging = false;
});
addEventListener('mousemove', (e) => {
  if (!state.started || isTouch) return;
  if (document.pointerLockElement === canvas || dragging) {
    state.lastLook = performance.now();
    cam.yaw -= e.movementX * 0.0032;
    cam.pitch = clamp(cam.pitch + e.movementY * 0.0028, -0.12, 1.25);
  }
});
canvas.addEventListener(
  'wheel',
  (e) => {
    if (!state.started) return;
    e.preventDefault();
    cam.dist = clamp(cam.dist + e.deltaY * (state.flying ? 0.04 : 0.008), 2.6, state.flying ? 80 : 14);
  },
  { passive: false },
);
const stick = { id: null, x: 0, y: 0, cx: 0, cy: 0 },
  look = { id: null, lx: 0, ly: 0 };
let skateToggle = false;
if (isTouch) {
  const st = $('#stick'),
    kn = $('#knob');
  const moveStick = (e) => {
    let dx = e.clientX - stick.cx,
      dy = e.clientY - stick.cy;
    const l = Math.hypot(dx, dy),
      m = 48;
    if (l > m) {
      dx *= m / l;
      dy *= m / l;
    }
    stick.x = dx / m;
    stick.y = dy / m;
    kn.style.transform = `translate(${dx}px,${dy}px)`;
  };
  st.addEventListener('pointerdown', (e) => {
    stick.id = e.pointerId;
    const r = st.getBoundingClientRect();
    stick.cx = r.left + r.width / 2;
    stick.cy = r.top + r.height / 2;
    try {
      st.setPointerCapture(e.pointerId);
    } catch (err) {}
    moveStick(e);
  });
  st.addEventListener('pointermove', (e) => {
    if (e.pointerId === stick.id) moveStick(e);
  });
  const endS = (e) => {
    if (e.pointerId !== stick.id) return;
    stick.id = null;
    stick.x = stick.y = 0;
    kn.style.transform = '';
  };
  st.addEventListener('pointerup', endS);
  st.addEventListener('pointercancel', endS);
  canvas.addEventListener('pointerdown', (e) => {
    if (look.id !== null) return;
    look.id = e.pointerId;
    look.lx = e.clientX;
    look.ly = e.clientY;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== look.id) return;
    state.lastLook = performance.now();
    cam.yaw -= (e.clientX - look.lx) * 0.006;
    cam.pitch = clamp(cam.pitch + (e.clientY - look.ly) * 0.005, -0.12, 1.25);
    look.lx = e.clientX;
    look.ly = e.clientY;
  });
  const endL = (e) => {
    if (e.pointerId === look.id) look.id = null;
  };
  canvas.addEventListener('pointerup', endL);
  canvas.addEventListener('pointercancel', endL);
  $('#tE').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    late.interact();
  });
  $('#tJump').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (V.active) {
      keys.Space = true;
      setTimeout(() => (keys.Space = false), 250);
    } else state.jumpQ = true;
  });
  $('#tSkate').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    skateToggle = !skateToggle;
    e.currentTarget.classList.toggle('on', skateToggle);
  });
  $('#tCar').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    toggleCar();
  });
  mapWrap.style.cssText =
    'bottom:auto;left:auto;top:calc(64px + env(safe-area-inset-top,0px));right:calc(16px + env(safe-area-inset-right,0px));width:128px;height:128px;pointer-events:auto';
  mapWrap.addEventListener('click', () => late.toggleTravel());
  $('#promptKey').textContent = 'Tap E';
}

Object.assign(late, { cam, keys, stick });
export { cam, keys, skateToggle, stick };
