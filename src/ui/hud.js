// HUD: movement readout, door prompts and the Apple product card.
import { state } from '../core/state.js';
import { $ } from '../core/util.js';
import { canvas, isTouch } from '../core/renderer.js';
import { P } from '../player/avatar.js';
import { V } from '../vehicles/suv.js';
import { drawMinimap } from './minimap.js';
import { locEye, locName, locSub, locate } from './location.js';
import {
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
} from '../interiors/doors.js';

/* ---------- HUD ---------- */
const moveModeEl = $('#moveMode'),
  moveSpdEl = $('#moveSpd');
let hudT = 0;
function stepHUD(dt) {
  hudT += dt;
  const prod =
    !state.busy && state.mode === 'room' && state.curRoom.productAt ? state.curRoom.productAt(P.pos) : null;
  if (prod !== state.shopCur) {
    state.shopCur = prod;
    shopEl.classList.toggle('on', !!prod);
    document.body.classList.toggle('focus', !!prod);
    if (prod) {
      shopName.textContent = prod.n;
      shopSub.textContent = prod.sub;
      shopIcon.innerHTML = ICONS[prod.icon];
      shopLink.href = prod.url;
      shopLink.setAttribute('aria-label', 'Learn more about ' + prod.n + ' on apple.com (opens a new tab)');
    } else if (document.activeElement === shopLink) canvas.focus();
  }
  if (prod) {
    const locked = !!document.pointerLockElement;
    shopHint.hidden = isTouch || !locked;
    shopHintText.textContent = 'Free the mouse to click Learn more';
  }
  const near = !prod && nearDoor() && !state.busy && !V.active;
  promptEl.hidden = !near;
  if (near)
    promptText.textContent =
      state.mode === 'out' ? near.label : near.sub ? near.sub.label : state.curRoom.exitText;
  if (hudT > 0.12) {
    hudT = 0;
    moveModeEl.textContent = V.active
      ? 'Black SUV'
      : state.skating
        ? 'Skateboard'
        : state.iceSkating
          ? 'Ice skates'
          : state.sprinting
            ? 'Sprinting'
            : 'On foot';
    moveSpdEl.textContent = Math.round((V.active ? Math.abs(V.speed) : Math.hypot(P.vel.x, P.vel.z)) * 2.237);
    const [n, s, e] = locate();
    const key = n + s + e;
    if (key !== state.lastLoc) {
      state.lastLoc = key;
      locName.textContent = n;
      locSub.textContent = s;
      locEye.textContent = e;
    }
  }
  drawMinimap();
}

export { moveModeEl, stepHUD };
