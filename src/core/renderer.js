// WebGL renderer, outdoor scene, camera, and web-font loading.
import * as THREE from 'three';
import { $, fail } from './util.js';

/*DATA-END*/

/* ---------- renderer / scenes ---------- */
const canvas = $('#game');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  fail('WebGL is not available in this browser, so the game cannot start.');
  throw e;
}
const isTouch = matchMedia('(pointer: coarse)').matches;
// window.__lite (set by the smoke test) lowers resolution for software rendering
renderer.setPixelRatio(window.__lite ? 0.6 : Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.4, 3200);
const FOG = 0xe8d5b4;
scene.fog = new THREE.Fog(FOG, 120, 620);
scene.background = new THREE.Color(FOG);
try {
  await Promise.race([
    Promise.all([
      document.fonts.load('800 64px Overpass'),
      document.fonts.load('600 64px Overpass'),
      document.fonts.load('600 64px "Cormorant Garamond"'),
    ]),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
} catch (e) {}

export { camera, canvas, isTouch, renderer, scene };
