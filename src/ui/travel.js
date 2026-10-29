// Fast travel: M opens a full map. Click a pin or a place in the list, or click any open spot on the
// streets, and the screen fades and puts you there. Galleria stores are in the list too.
import { state, late } from '../core/state.js';
import { $ } from '../core/util.js';
import { BOUNDS, DOORS, MCD } from '../world/layout.js';
import { canvas, isTouch, scene } from '../core/renderer.js';
import { solids } from '../core/helpers.js';
import { MAPMIN } from '../world/sky.js';
import { MAP, MS } from './minimap.js';
import { P, board, ph } from '../player/avatar.js';
import { V } from '../vehicles/suv.js';
import { ROOMS } from '../interiors/rooms.js';
import { cam } from '../player/input.js';

const [MD, TD] = DOORS;
// rot: the way you face on arrival (0 = south, π = north, π/2 = east, -π/2 = west)
const SPOTS = [
  { g: 'Streets', n: 'Galleria · Macy’s entrance', p: 'G', x: MD.x + 3, z: MD.z, rot: -Math.PI / 2 },
  { g: 'Streets', n: 'Noel Rd & Alpha Rd', s: 'Nordstrom garage', p: '1', x: -10, z: 12, rot: -Math.PI / 2 },
  { g: 'Streets', n: 'Le Méridien', s: 'Noel Rd', p: '2', x: 10, z: 107, rot: Math.PI / 2 },
  { g: 'Streets', n: 'The Westin', s: 'Galleria Rd', p: '3', x: -118, z: 192, rot: Math.PI },
  { g: 'Streets', n: 'Montfort Dr & Alpha Rd', p: '4', x: 230, z: 12, rot: Math.PI / 2 },
  { g: 'Streets', n: 'Residence Inn', s: 'James Temple Dr', p: '5', x: 80, z: 216, rot: 0 },
  { g: 'Streets', n: 'Target', s: 'Front entrance', p: 'T', x: TD.x - 4, z: TD.z, rot: Math.PI / 2 },
  {
    g: 'Streets',
    n: 'McDonald’s',
    s: 'Montfort Dr at LBJ',
    p: 'M',
    x: (MCD[0] + MCD[1]) / 2,
    z: MCD[3] + 7,
    rot: Math.PI,
  },
  { g: 'Streets', n: 'LBJ Fwy & Noel Rd', p: '6', x: -12, z: 349, rot: 0 },
  { g: 'Inside the Galleria', room: 'galleria', n: 'Ice rink', x: 0, z: -22, rot: Math.PI },
  { g: 'Inside the Galleria', room: 'galleria', n: 'Diamond’s Dogs', x: 16, z: -6, rot: Math.PI / 2 },
  { g: 'Inside the Galleria', room: 'galleria', n: 'Apple', x: -9, z: -54, rot: -Math.PI / 2 },
  { g: 'Inside the Galleria', room: 'galleria', n: 'Sephora', x: -9, z: -24, rot: -Math.PI / 2 },
  { g: 'Inside the Galleria', room: 'galleria', n: 'CCR Gallery', x: -9, z: 0, rot: -Math.PI / 2 },
  { g: 'Inside the Galleria', room: 'galleria', n: 'Barnes & Noble', x: 0, z: -64, rot: Math.PI },
  {
    g: 'Inside the Galleria',
    room: 'galleria',
    n: 'Food court',
    s: 'Level 2',
    x: 0,
    z: -12,
    y: 5.5,
    rot: Math.PI,
  },
  { g: 'Inside Target', room: 'target', n: 'Target', s: 'Store floor', x: -5, z: 6, rot: Math.PI },
];
const el = $('#travel'),
  tmap = $('#tmap'),
  tlist = $('#tlist'),
  tmsg = $('#tmsg'),
  fade = $('#fade');
const tg = tmap.getContext('2d');
let view = null, // map-to-canvas transform for the current open
  hover = null;
state.travelOpen = false;

/* ---------- moving the player ---------- */
const blocked = (x, z, r) => solids.some((s) => x + r > s.x1 && x - r < s.x2 && z + r > s.z1 && z - r < s.z2);
const inBounds = (x, z) => x > BOUNDS.x1 + 1 && x < BOUNDS.x2 - 1 && z > BOUNDS.z1 + 1 && z < BOUNDS.z2 - 1;
// nearest open ground to (x, z), searching outward up to ~14 m; null if none
function openSpot(x, z) {
  for (let r = 0; r <= 14; r += 1)
    for (let a = 0; a < (r ? 16 : 1); a++) {
      const px = x + Math.cos((a / 16) * Math.PI * 2) * r,
        pz = z + Math.sin((a / 16) * Math.PI * 2) * r;
      if (inBounds(px, pz) && !blocked(px, pz, 0.8)) return [px, pz];
    }
  return null;
}
function travel(spot) {
  if (state.busy && !state.travelOpen) return;
  close();
  state.busy = true;
  fade.classList.add('on');
  state.skating = false;
  board.visible = false;
  setTimeout(() => {
    const driving = V.active && !spot.room;
    if (V.active && spot.room) {
      // leave the SUV parked where it was
      V.active = false;
      V.speed = 0;
      V.steer = 0;
      ph.g.visible = true;
    }
    if (spot.room) {
      state.mode = 'room';
      state.curDoor = DOORS.find((d) => d.id === spot.room);
      state.curRoom = ROOMS[spot.room];
      state.curRoom.scene.add(ph.g);
      cam.cur = Math.min(cam.dist, state.curRoom.camMax || cam.dist);
    } else {
      state.mode = 'out';
      scene.add(ph.g);
      cam.cur = cam.dist;
    }
    P.pos.set(spot.x, spot.y || 0, spot.z);
    P.rot = spot.rot;
    P.vel.set(0, 0, 0);
    P.vy = 0;
    P.jumps = 0;
    if (driving) {
      V.pos.set(spot.x, 0, spot.z);
      V.h = spot.rot;
      V.speed = 0;
      V.steer = 0;
    }
    cam.yaw = spot.rot + Math.PI;
    cam.pitch = 0.3;
    setTimeout(() => {
      fade.classList.remove('on');
      state.busy = false;
    }, 160);
  }, 380);
}

/* ---------- the map panel ---------- */
function size() {
  const r = tmap.getBoundingClientRect(),
    dpr = Math.min(2, devicePixelRatio || 1);
  tmap.width = Math.round(r.width * dpr);
  tmap.height = Math.round(r.height * dpr);
  // fit the whole play area (plus a margin) into the canvas
  const pad = 30,
    wx = BOUNDS.x2 - BOUNDS.x1 + pad * 2,
    wz = BOUNDS.z2 - BOUNDS.z1 + pad * 2,
    k = Math.min(tmap.width / wx, tmap.height / wz);
  view = {
    k,
    dpr,
    ox: (tmap.width - wx * k) / 2 - (BOUNDS.x1 - pad) * k,
    oz: (tmap.height - wz * k) / 2 - (BOUNDS.z1 - pad) * k,
  };
}
const toC = (x, z) => [view.ox + x * view.k, view.oz + z * view.k];
const toW = (cx, cz) => [(cx - view.ox) / view.k, (cz - view.oz) / view.k];
function draw() {
  if (!view) return;
  const g = tg,
    { k, dpr } = view;
  g.fillStyle = '#3e5236';
  g.fillRect(0, 0, tmap.width, tmap.height);
  const [x0, z0] = toC(MAPMIN.x, MAPMIN.z);
  g.imageSmoothingQuality = 'high';
  g.drawImage(MAP, x0, z0, (MAP.width / MS) * k, (MAP.height / MS) * k);
  // play-area edge
  const [bx1, bz1] = toC(BOUNDS.x1, BOUNDS.z1),
    [bx2, bz2] = toC(BOUNDS.x2, BOUNDS.z2);
  g.strokeStyle = 'rgba(243,246,241,.35)';
  g.setLineDash([6 * dpr, 6 * dpr]);
  g.lineWidth = 1.5 * dpr;
  g.strokeRect(bx1, bz1, bx2 - bx1, bz2 - bz1);
  g.setLineDash([]);
  // pins
  for (const s of SPOTS) {
    if (!s.p) continue;
    const [cx, cz] = toC(s.x, s.z),
      on = hover === s,
      R = (on ? 13 : 10.5) * dpr;
    g.fillStyle = on ? '#ffffff' : '#f2b33d';
    g.strokeStyle = '#1d1404';
    g.lineWidth = 3 * dpr;
    g.beginPath();
    g.arc(cx, cz, R, 0, 7);
    g.fill();
    g.stroke();
    g.fillStyle = '#1d1404';
    g.font = `800 ${12 * dpr}px Overpass, Arial, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(s.p, cx, cz + dpr);
    if (on) {
      const label = s.n + (s.s ? ' · ' + s.s : '');
      g.font = `700 ${13 * dpr}px Overpass, Arial, sans-serif`;
      const w = g.measureText(label).width + 16 * dpr;
      const lx = Math.min(Math.max(cx - w / 2, 4), tmap.width - w - 4),
        ly = cz - R - 30 * dpr;
      g.fillStyle = 'rgba(9,20,15,.92)';
      g.fillRect(lx, ly, w, 24 * dpr);
      g.fillStyle = '#f3f6f1';
      g.fillText(label, lx + w / 2, ly + 13 * dpr);
    }
  }
  // you are here (outdoors), or the door of the building you're in
  const here = state.mode === 'out' ? P.pos : state.curDoor;
  if (here) {
    const [cx, cz] = toC(here.x, here.z);
    g.save();
    g.translate(cx, cz);
    if (state.mode === 'out') g.rotate(Math.atan2(Math.cos(P.rot), Math.sin(P.rot)));
    g.scale(dpr, dpr);
    g.fillStyle = '#ffffff';
    g.strokeStyle = '#0c1712';
    g.lineWidth = 3;
    g.beginPath();
    if (state.mode === 'out') {
      g.moveTo(12, 0);
      g.lineTo(-8, -8);
      g.lineTo(-3, 0);
      g.lineTo(-8, 8);
      g.closePath();
    } else g.arc(0, 0, 6, 0, 7);
    g.stroke();
    g.fill();
    g.restore();
  }
}
function pinAt(cx, cz) {
  let best = null,
    bd = 16 * view.dpr;
  for (const s of SPOTS) {
    if (!s.p) continue;
    const [px, pz] = toC(s.x, s.z),
      d = Math.hypot(px - cx, pz - cz);
    if (d < bd) {
      bd = d;
      best = s;
    }
  }
  return best;
}
const evPos = (e) => {
  const r = tmap.getBoundingClientRect();
  return [(e.clientX - r.left) * view.dpr, (e.clientY - r.top) * view.dpr];
};
tmap.addEventListener('mousemove', (e) => {
  const [cx, cz] = evPos(e),
    pin = pinAt(cx, cz);
  if (pin !== hover) {
    hover = pin;
    draw();
  }
  tmap.style.cursor = pin ? 'pointer' : 'crosshair';
});
tmap.addEventListener('mouseleave', () => {
  hover = null;
  draw();
});
tmap.addEventListener('click', (e) => {
  const [cx, cz] = evPos(e),
    pin = pinAt(cx, cz);
  if (pin) return travel(pin);
  const [x, z] = toW(cx, cz);
  const at = inBounds(x, z) ? openSpot(x, z) : null;
  if (!at) {
    tmsg.textContent = 'Can’t travel there. Pick a street, sidewalk or lot inside the dashed line.';
    return;
  }
  // face along the way you'd been heading on the map: toward the clicked spot from where you are
  const from = state.mode === 'out' ? P.pos : state.curDoor;
  const rot = Math.atan2(at[0] - from.x, at[1] - from.z);
  travel({ x: at[0], z: at[1], rot: isFinite(rot) ? rot : 0 });
});
// destination list, grouped
{
  let group = null;
  for (const s of SPOTS) {
    if (s.g !== group) {
      group = s.g;
      const h = document.createElement('div');
      h.className = 'tgroup';
      h.textContent = group;
      tlist.appendChild(h);
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tdest';
    b.innerHTML = `<span class="tpin${s.p ? '' : ' in'}">${s.p || '•'}</span><span class="tname"></span>`;
    b.querySelector('.tname').textContent = s.n + (s.s ? ' · ' + s.s : '');
    b.addEventListener('click', () => travel(s));
    b.addEventListener('mouseenter', () => {
      hover = s;
      draw();
    });
    b.addEventListener('mouseleave', () => {
      hover = null;
      draw();
    });
    tlist.appendChild(b);
  }
}
$('#tClose').addEventListener('click', () => close());
el.addEventListener('click', (e) => {
  if (e.target === el) close();
});
function open() {
  if (!state.started || state.busy || state.travelOpen) return;
  state.travelOpen = true;
  state.busy = true; // pauses walking and driving while the map is up
  for (const k in late.keys) late.keys[k] = false;
  try {
    if (document.pointerLockElement) document.exitPointerLock();
  } catch (e) {}
  el.hidden = false;
  tmsg.textContent = isTouch
    ? 'Tap a pin or a place below, or tap any street.'
    : 'Click a pin or a place in the list, or click any street. M or Esc closes.';
  hover = null;
  size();
  draw();
}
function close() {
  if (!state.travelOpen) return;
  state.travelOpen = false;
  state.busy = false;
  el.hidden = true;
  canvas.focus();
}
function toggleTravel() {
  if (state.travelOpen) close();
  else open();
}
addEventListener('keydown', (e) => {
  if (state.travelOpen && e.code === 'Escape') close();
});
addEventListener('resize', () => {
  if (state.travelOpen) {
    size();
    draw();
  }
});
Object.assign(late, { toggleTravel, travel });
export { SPOTS, toggleTravel, travel };
