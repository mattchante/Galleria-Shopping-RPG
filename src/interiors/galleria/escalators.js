// Escalators between level 1 and the food-court terrace (east up, west down).
import * as THREE from 'three';
import { lam, scaleUV, tex } from '../../core/helpers.js';

export function buildEscalators(ctx) {
  const { L2, S_, dark, glassM, metal, sc } = ctx;
  // ---- escalators (one each side) from level 1 up onto the terrace
  const stepT = tex(64, 64, (g, w, h) => {
    g.fillStyle = '#5d6166';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#8a8f95';
    for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, h);
    g.fillStyle = '#2f3236';
    g.fillRect(0, 0, w, 5);
  });
  const stepTW = stepT.clone();
  stepTW.needsUpdate = true;
  const stepMs = { 1: lam(0xffffff, { map: stepT }), '-1': lam(0xffffff, { map: stepTW }) },
    RAMPS = [],
    ang = Math.atan2(L2, 12),
    len = Math.hypot(12, L2);
  for (const s of [-1, 1]) {
    const x1 = s > 0 ? 6.1 : -7.9,
      x2 = s > 0 ? 7.9 : -6.1,
      cx = (x1 + x2) / 2;
    RAMPS.push({ x1, x2, zt: -18, zb: -6, dir: s > 0 ? -1 : 1 });
    const stepM = stepMs[s];
    const r = new THREE.Mesh(scaleUV(new THREE.BoxGeometry(1.8, 0.25, len), 1, len / 0.4), [
      metal,
      metal,
      stepM,
      metal,
      metal,
      metal,
    ]);
    r.position.set(cx, L2 / 2 - 0.1, -12);
    r.rotation.x = ang;
    sc.add(r);
    const sk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, len), metal);
    sk.position.set(cx, L2 / 2 - 0.8, -12);
    sk.rotation.x = ang;
    sc.add(sk);
    for (const ex of [x1 - 0.08, x2 + 0.08]) {
      const gp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1, len), glassM);
      gp.position.set(ex, L2 / 2 + 0.45, -12);
      gp.rotation.x = ang;
      sc.add(gp);
      const hr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, len + 0.6), dark);
      hr.position.set(ex, L2 / 2 + 1, -12);
      hr.rotation.x = ang;
      sc.add(hr);
    }
    S_(Math.min(x1, x2) - 0.2, Math.min(x1, x2), -18, -6, 0, 7.5);
    S_(Math.max(x1, x2), Math.max(x1, x2) + 0.2, -18, -6, 0, 7.5);
    S_(Math.min(x1, x2) - 0.2, Math.max(x1, x2) + 0.2, -24, -15, 0, 3);
  }
  Object.assign(ctx, { RAMPS, stepT, stepTW });
}
