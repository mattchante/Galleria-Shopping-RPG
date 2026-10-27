// Sky dome, sun, hemisphere light and the grass ground plane.
import * as THREE from 'three';
import { BOUNDS } from './layout.js';
import { scene } from '../core/renderer.js';
import { V3, tex } from '../core/helpers.js';
import { MAT, flat, mapRect } from '../core/materials.js';

/* ---------- sky, light, ground ---------- */
const skyTex = tex(
  4,
  256,
  (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#4f86c6');
    gr.addColorStop(0.38, '#9cc0e0');
    gr.addColorStop(0.5, '#f0dcb6');
    gr.addColorStop(1, '#d8c4a0');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  },
  false,
);
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(2600, 32, 16),
  new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false }),
);
sky.renderOrder = -1;
scene.add(sky);
scene.add(new THREE.HemisphereLight(0xd6e6ff, 0x8a7a58, 0.62));
const sun = new THREE.DirectionalLight(0xffe0b0, 0.95);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -95, right: 95, top: 95, bottom: -95, near: 10, far: 520 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.4;
scene.add(sun);
scene.add(sun.target);
const SUN_OFF = new V3(-150, 150, 70);
flat(-1600, 2000, -1500, 1900, 0, MAT.grass, 6);
const MAPMIN = { x: BOUNDS.x1 - 70, z: BOUNDS.z1 - 70 },
  MAPMAX = { x: BOUNDS.x2 + 70, z: BOUNDS.z2 + 70 };
mapRect(MAPMIN.x, MAPMAX.x, MAPMIN.z, MAPMAX.z, '#3e5236');

export { MAPMAX, MAPMIN, SUN_OFF, sky, sun };
