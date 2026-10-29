// Smoke test: serves the production build, loads it in headless Chromium, visits a set of
// places outdoors and indoors, checks driving, sprinting and the escalator, saves screenshots
// to smoke-output/, and exits non-zero on any page error or failed check.
// Run `npm run build` first. First time on a new machine: `npx playwright install chromium`.
import { preview } from 'vite';
import { chromium } from 'playwright';
import fs from 'node:fs';

// Outdoor coordinates follow world/layout.js (real street geometry at half scale; Noel Rd x=0, Alpha Rd z=0).
// room: null = outdoors, or a door id ('galleria', 'target'). Barnes & Noble and Sephora are part of the Galleria.
const SHOTS = [
  { name: 'macys-entrance', room: null, x: -4, z: 139, yaw: Math.PI / 2, pitch: 0.2, dist: 22 },
  { name: 'nordstrom-garage', room: null, x: 4, z: -11, yaw: 2.4, pitch: 0.12, dist: 14 },
  { name: 'tollway-alpha', room: null, x: -150, z: 8, yaw: 2.6, pitch: 0.15, dist: 14 },
  { name: 'montfort-curve', room: null, x: 245, z: 40, yaw: -2.4, pitch: 0.2, dist: 14 },
  { name: 'target-storefront', room: null, x: 176, z: 263, yaw: -1.9, pitch: 0.2, dist: 14 },
  { name: 'mcdonalds', room: null, x: 303, z: 346, yaw: 0.8, pitch: 0.25, dist: 18 },
  { name: 'galleria-level-1', room: 'galleria', x: 0, z: 8, yaw: 0, pitch: 0.25, dist: 9 },
  {
    name: 'apple-store',
    room: 'galleria',
    x: -17.5,
    z: -60.1,
    yaw: 0.15,
    pitch: 0.32,
    dist: 6,
    expectShop: 'iPhone',
  },
  { name: 'food-court', room: 'galleria', x: 0, z: -12, y: 5.5, yaw: 0, pitch: 0.45, dist: 9 },
  { name: 'ice-rink', room: 'galleria', x: 3.5, z: -30, y: 0.12, yaw: -0.4, pitch: 0.3, dist: 6 },
  { name: 'sephora', room: 'galleria', x: -14.2, z: -24, yaw: Math.PI / 2, pitch: 0.28, dist: 5 },
  { name: 'ccr-gallery', room: 'galleria', x: -15.6, z: 1.4, yaw: 1.35, pitch: 0.12, dist: 4.5 },
  { name: 'pet-store', room: 'galleria', x: 15, z: -6, yaw: -1.2, pitch: 0.32, dist: 6 },
  { name: 'puppy-pen', room: 'galleria', x: 20, z: -5, yaw: Math.PI - 0.5, pitch: 0.55, dist: 6 },
  { name: 'cat-wall', room: 'galleria', x: 24.5, z: -9.6, yaw: -Math.PI / 2, pitch: 0.15, dist: 4.5 },
  { name: 'studio-k-wall', room: 'galleria', x: -4, z: -12, yaw: Math.PI / 2, pitch: 0.2, dist: 7 },
  { name: 'barnes-noble', room: 'galleria', x: 4, z: -83.3, yaw: -0.9, pitch: 0.3, dist: 7 },
  { name: 'bn-stairs', room: 'galleria', x: 17, z: -76, yaw: -2.2, pitch: 0.3, dist: 9 },
  { name: 'bn-level-2', room: 'galleria', x: -10, z: -92, y: 5.5, yaw: -0.8, pitch: 0.18, dist: 7 },
  { name: 'target-interior', room: 'target', x: -5, z: 6, yaw: 0.6, pitch: 0.3, dist: 6 },
];

fs.mkdirSync('smoke-output', { recursive: true });
const server = await preview({ preview: { port: 4180, strictPort: true }, logLevel: 'error' });
const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 800, height: 470 } });
await page.addInitScript(() => {
  window.__lite = true;
}); // lower resolution for software rendering
page.setDefaultTimeout(240_000);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text());
});
// Network failures count, except the optional web fonts (offline machines fall back to system fonts).
page.on('requestfailed', (r) => {
  if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url())) errors.push(`request failed: ${r.url()}`);
});
const frames = (n) =>
  page.evaluate(
    (n) =>
      new Promise((res) => {
        let i = 0;
        const f = () => (++i >= n ? res() : requestAnimationFrame(f));
        requestAnimationFrame(f);
      }),
    n,
  );
const checks = [];
const check = (name, ok, detail) => {
  checks.push({ name, ok });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name.padEnd(22)} ${detail}`);
};

let failed = false;
try {
  const t0 = Date.now();
  await page.goto('http://localhost:4180/?debug', { waitUntil: 'commit' });
  await page.waitForFunction(() => window.__g && !document.getElementById('start').disabled);
  console.log(`loaded in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await page.evaluate(() => window.__g.start());
  for (const s of SHOTS) {
    await page.evaluate((s) => {
      const g = window.__g;
      if (!s.room) g.outside();
      else g.enter(s.room);
      g.teleport({ x: s.x, z: s.z, y: s.y ?? 0, yaw: s.yaw });
      g.setCam(s.yaw, s.pitch, s.dist);
    }, s);
    await frames(6);
    const info = await page.evaluate(() => window.__g.info());
    await page.screenshot({ path: `smoke-output/${s.name}.png` });
    console.log(`  ${s.name.padEnd(22)} -> ${info.place} · ${info.sub}`);
    if (s.expectShop)
      check(`product card (${s.expectShop})`, info.shop === s.expectShop, `shop=${info.shop}`);
  }
  // SUV: get in outside, accelerate for 3 s of simulated time, get out
  const drive = await page.evaluate(() => {
    const g = window.__g;
    g.outside();
    g.teleport({ x: 20, z: 125, yaw: -Math.PI / 2 }); // on Peterson Ln, facing east
    g.toggleDrive();
    g.keys.KeyW = true;
    g.simDrive(3);
    g.keys.KeyW = false;
    const mph = Math.abs(g.V.speed) * 2.237;
    g.toggleDrive();
    return { mph, out: !g.V.active };
  });
  check(
    'SUV drives',
    drive.mph > 20 && drive.out,
    `${drive.mph.toFixed(0)} mph after 3 s, exited=${drive.out}`,
  );
  // Macy's entrance on Noel Rd is the way into the Galleria
  const door = await page.evaluate(() => {
    const g = window.__g,
      d = g.DOORS.find((d) => d.id === 'galleria');
    g.outside();
    g.teleport({ x: d.x + 0.5, z: d.z, yaw: Math.PI / 2 });
    return d.label;
  });
  await frames(4);
  const doorInfo = await page.evaluate(() => window.__g.info());
  check(
    "Macy's door",
    door === 'Enter Galleria' && doorInfo.place === 'Galleria Dallas',
    `${doorInfo.place} · ${doorInfo.sub}`,
  );
  // Fast travel: open the map (screenshot it), then travel to Target's entrance from the list
  await page.evaluate(() => {
    window.__g.outside();
    window.__g.toggleMap();
  });
  await frames(2);
  await page.screenshot({ path: 'smoke-output/fast-travel-map.png' });
  await page.evaluate(() => window.__g.fastTravel('Target'));
  await page.waitForFunction(() => !document.getElementById('fade').classList.contains('on'));
  await frames(4);
  const ft = await page.evaluate(() => window.__g.info());
  check('fast travel', ft.mode === 'out' && ft.place === 'Target', `${ft.place} · ${ft.sub}`);
  // Sprint indoors
  const sprint = await page.evaluate(() => {
    const g = window.__g;
    g.enter('galleria');
    g.teleport({ x: 0, z: 8, yaw: 0 });
    g.keys.KeyW = g.keys.ShiftLeft = true;
    g.sim(2);
    g.keys.KeyW = g.keys.ShiftLeft = false;
    return Math.hypot(g.P.vel.x, g.P.vel.z);
  });
  check('sprint indoors', sprint > 7.5, `${sprint.toFixed(1)} m/s`);
  // Escalator carries you up without input
  const esc = await page.evaluate(() => {
    const g = window.__g;
    g.teleport({ x: 7, z: -6.4, y: 0.2 });
    g.sim(4);
    return g.P.pos.y;
  });
  check('escalator rides up', esc > 2, `height ${esc.toFixed(2)} m after 4 s`);
  // Barnes & Noble: walk in from the concourse, climb the stair, walk out onto the upper walkway
  const bn = await page.evaluate(() => {
    const g = window.__g,
      r = {};
    g.teleport({ x: 0, z: -64, yaw: 0 });
    g.keys.KeyW = true;
    g.sim(2.5);
    r.in1 = g.P.pos.z;
    g.teleport({ x: 20.6, z: -73.6, yaw: 0 });
    g.sim(4);
    r.stairY = g.P.pos.y;
    g.teleport({ x: 10, z: -66, y: 5.5, yaw: 0 });
    g.sim(2);
    r.in2 = [g.P.pos.z, g.P.pos.y];
    g.keys.KeyW = false;
    return r;
  });
  check('B&N level-1 walk-in', bn.in1 < -69, `z ${bn.in1.toFixed(1)}`);
  check('B&N stair climbs', bn.stairY > 5, `height ${bn.stairY.toFixed(2)} m after 4 s`);
  check(
    'B&N level-2 entrance',
    bn.in2[0] < -69 && bn.in2[1] > 5,
    `z ${bn.in2[0].toFixed(1)}, y ${bn.in2[1].toFixed(2)}`,
  );
  // Sephora: walk straight in from the concourse (the HUD label updates on the next rendered frames)
  const seX = await page.evaluate(() => {
    const g = window.__g;
    g.teleport({ x: -9, z: -24, yaw: Math.PI / 2 });
    g.keys.KeyW = true;
    g.sim(2);
    g.keys.KeyW = false;
    return g.P.pos.x;
  });
  await frames(4);
  const sePlace = await page.evaluate(() => window.__g.info().place);
  check('Sephora walk-in', seX < -13 && sePlace === 'Sephora', `x ${seX.toFixed(1)} · ${sePlace}`);
  const gaX = await page.evaluate(() => {
    const g = window.__g;
    g.teleport({ x: -9, z: 0.5, yaw: Math.PI / 2 });
    g.keys.KeyW = true;
    g.sim(2);
    g.keys.KeyW = false;
    return g.P.pos.x;
  });
  await frames(4);
  const gaPlace = await page.evaluate(() => window.__g.info().place);
  check('CCR Gallery walk-in', gaX < -13 && gaPlace === 'CCR Gallery', `x ${gaX.toFixed(1)} · ${gaPlace}`);
  const petX = await page.evaluate(() => {
    const g = window.__g;
    g.teleport({ x: 9, z: -6, yaw: -Math.PI / 2 });
    g.keys.KeyW = true;
    g.sim(2);
    g.keys.KeyW = false;
    return g.P.pos.x;
  });
  await frames(4);
  const petPlace = await page.evaluate(() => window.__g.info().place);
  check(
    'pet store walk-in',
    petX > 14 && petPlace === 'Diamond’s Dogs',
    `x ${petX.toFixed(1)} · ${petPlace}`,
  );
  await frames(2);
} catch (e) {
  errors.push(String(e));
}
await browser.close();
await new Promise((r) => server.httpServer.close(r));
if (errors.length) {
  console.error('\nPage errors:\n  ' + errors.join('\n  '));
  failed = true;
}
if (checks.some((c) => !c.ok)) failed = true;
console.log(failed ? '\nSMOKE TEST FAILED' : '\nsmoke test passed');
process.exit(failed ? 1 : 0);
