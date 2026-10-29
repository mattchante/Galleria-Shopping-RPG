// Minimap (outdoor map and indoor floor plans).
import { state } from '../core/state.js';
import { $ } from '../core/util.js';
import { DOORS, INTS, MALL, PLACES, ROADS } from '../world/layout.js';
import { MAPDRAW, posAt } from '../core/helpers.js';
import { MAPMAX, MAPMIN } from '../world/sky.js';
import { P } from '../player/avatar.js';

/* ---------- minimap ---------- */
const MS = 1.5,
  MW = Math.round((MAPMAX.x - MAPMIN.x) * MS),
  MH = Math.round((MAPMAX.z - MAPMIN.z) * MS);
const MAP = document.createElement('canvas');
MAP.width = MW;
MAP.height = MH;
{
  const g = MAP.getContext('2d');
  const X = (x) => (x - MAPMIN.x) * MS,
    Z = (z) => (z - MAPMIN.z) * MS;
  const poly = (r, a, b, o) => {
    g.beginPath();
    const st = Math.max(2, (b - a) / 60);
    let first = true;
    for (let s = a; s <= b + 1e-6; s += Math.min(st, 8)) {
      const [x, z] = posAt(r, Math.min(s, b), o);
      if (first) {
        g.moveTo(X(x), Z(z));
        first = false;
      } else g.lineTo(X(x), Z(z));
    }
  };
  for (const o of MAPDRAW)
    if (o.k === 'r') {
      g.fillStyle = o.col;
      g.fillRect(X(o.x1), Z(o.z1), (o.x2 - o.x1) * MS, (o.z2 - o.z1) * MS);
    }
  g.lineCap = 'butt';
  g.lineJoin = 'round';
  for (const o of MAPDRAW)
    if (o.k === 'walk') {
      g.strokeStyle = '#8d8b80';
      g.lineWidth = (o.o1 - o.o0) * MS;
      poly(o.r, o.a, o.b, (o.o0 + o.o1) / 2);
      g.stroke();
    }
  for (const o of MAPDRAW)
    if (o.k === 'road' && !o.r.elevated) {
      g.strokeStyle = '#d8d2c2';
      g.lineWidth = o.r.w * MS;
      poly(o.r, 0, o.r.L, 0);
      g.stroke();
    }
  for (const o of MAPDRAW)
    if (o.k === 'c') {
      g.fillStyle = o.col;
      g.beginPath();
      g.arc(X(o.x), Z(o.z), o.r * MS, 0, 7);
      g.fill();
    }
  for (const o of MAPDRAW)
    if (o.k === 'road' && o.r.elevated) {
      g.strokeStyle = 'rgba(120,140,190,.85)';
      g.lineWidth = o.r.w * MS;
      poly(o.r, 0, o.r.L, 0);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)';
      g.lineWidth = 1.5;
      poly(o.r, 0, o.r.L, 0);
      g.stroke();
    }
  g.strokeStyle = '#f2b33d';
  g.lineWidth = 3;
  for (const b of MALL) g.strokeRect(X(b[0]), Z(b[2]), (b[1] - b[0]) * MS, (b[3] - b[2]) * MS);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const inMap = (x, z) => x > MAPMIN.x + 20 && x < MAPMAX.x - 20 && z > MAPMIN.z + 20 && z < MAPMAX.z - 20;
  // place names
  for (const p of PLACES) {
    if (!p.map) continue;
    const big = p.map === 'GALLERIA';
    g.font = big ? '800 24px Overpass, Arial, sans-serif' : '700 13px Overpass, Arial, sans-serif';
    g.fillStyle = big ? '#f6efe0' : '#e9e2cf';
    g.fillText(p.map, X((p.r[0] + p.r[1]) / 2), Z((p.r[2] + p.r[3]) / 2));
  }
  // street names, written along each street every ~130 m and kept upright
  g.font = '800 13px Overpass, Arial, sans-serif';
  for (const r of ROADS) {
    const txt = r.name.toUpperCase().replace('I-635 ', '');
    let last = -1e9;
    for (let s = 40; s < r.L - 20; s += 10) {
      const [x, z, sg] = posAt(r, s, 0);
      if (!inMap(x, z) || s - last < 130) continue;
      // skip spots where another road crosses, so labels don't sit in intersections
      if (INTS.some((I) => Math.hypot(I.x - x, I.z - z) < 30)) continue;
      last = s;
      let a = Math.atan2(sg.d[1], sg.d[0]);
      if (a > Math.PI / 2) a -= Math.PI;
      if (a < -Math.PI / 2) a += Math.PI;
      g.save();
      g.translate(X(x), Z(z));
      g.rotate(a);
      g.fillStyle = r.elevated ? '#f4f7f2' : '#1c2a22';
      g.fillText(r.elevated ? (r.id === 'dnt' ? 'TOLLWAY' : 'I-635') : txt, 0, 1);
      g.restore();
    }
  }
}
const mm = $('#minimap'),
  mg = mm.getContext('2d'),
  mapWrap = $('#mapWrap');
function drawMinimap() {
  const S = mm.width,
    Rm = 100;
  mg.clearRect(0, 0, S, S);
  mg.save();
  mg.beginPath();
  mg.arc(S / 2, S / 2, S / 2, 0, 7);
  mg.clip();
  mg.fillStyle = '#3e5236';
  mg.fillRect(0, 0, S, S);
  if (state.mode === 'room' && state.curRoom.plan) {
    state.curRoom.plan(mg, S);
    mg.restore();
    return;
  }
  if (state.mode === 'room') {
    mg.fillStyle = '#2a221a';
    mg.fillRect(0, 0, S, S);
    mg.fillStyle = '#f2e8d4';
    mg.font = '800 44px Overpass, Arial, sans-serif';
    mg.textAlign = 'center';
    mg.fillText('INDOORS', S / 2, S / 2 - 6);
    mg.font = '600 30px Overpass, Arial, sans-serif';
    mg.fillStyle = '#bfae8e';
    mg.fillText(state.curRoom.name, S / 2, S / 2 + 36);
    mg.restore();
    return;
  }
  const px = P.pos.x,
    pz = P.pos.z;
  mg.drawImage(
    MAP,
    (px - Rm - MAPMIN.x) * MS,
    (pz - Rm - MAPMIN.z) * MS,
    Rm * 2 * MS,
    Rm * 2 * MS,
    0,
    0,
    S,
    S,
  );
  const k = S / (2 * Rm);
  for (const d of DOORS) {
    let ex = (d.x - px) * k,
      ez = (d.z - pz) * k;
    const el = Math.hypot(ex, ez),
      lim = S / 2 - 22;
    if (el > lim) {
      ex *= lim / el;
      ez *= lim / el;
    }
    mg.fillStyle = '#f2b33d';
    mg.strokeStyle = '#1d1404';
    mg.lineWidth = 4;
    mg.beginPath();
    mg.arc(S / 2 + ex, S / 2 + ez, 15, 0, 7);
    mg.fill();
    mg.stroke();
    mg.fillStyle = '#1d1404';
    mg.font = '800 19px Overpass, Arial, sans-serif';
    mg.textAlign = 'center';
    mg.textBaseline = 'middle';
    mg.fillText(d.pin, S / 2 + ex, S / 2 + ez + 2);
  }
  mg.translate(S / 2, S / 2);
  mg.rotate(Math.atan2(Math.cos(P.rot), Math.sin(P.rot)));
  mg.fillStyle = '#ffffff';
  mg.strokeStyle = '#0c1712';
  mg.lineWidth = 5;
  mg.beginPath();
  mg.moveTo(22, 0);
  mg.lineTo(-14, -14);
  mg.lineTo(-6, 0);
  mg.lineTo(-14, 14);
  mg.closePath();
  mg.stroke();
  mg.fill();
  mg.restore();
}

export { MAP, MS, drawMinimap, mapWrap };
