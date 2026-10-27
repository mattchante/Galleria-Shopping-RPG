// Smoke test: serves the production build, loads it in headless Chromium, visits a set of
// places outdoors and indoors, checks driving, sprinting and the escalator, saves screenshots
// to smoke-output/, and exits non-zero on any page error or failed check.
// Run `npm run build` first. First time on a new machine: `npx playwright install chromium`.
import { preview } from 'vite';
import { chromium } from 'playwright';
import fs from 'node:fs';

// room: null = outdoors, a door id ('galleria', 'target') or a room id ('bookstore')
const SHOTS = [
  { name: 'north-lot', room: null, x: -117.5, z: 54, yaw: Math.PI, pitch: 0.2, dist: 9 },
  { name: 'alpha-noel', room: null, x: 10, z: 14, yaw: -2.4, pitch: 0.2, dist: 10 },
  { name: 'target-storefront', room: null, x: 185, z: 318, yaw: -1.9, pitch: 0.25, dist: 16 },
  { name: 'mcdonalds', room: null, x: 328, z: 418, yaw: -1.9, pitch: 0.3, dist: 20 },
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
  { name: 'barnes-noble', room: 'bookstore', x: 4, z: -15, yaw: -0.9, pitch: 0.3, dist: 7 },
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
      else if (s.room === 'bookstore') g.room('bookstore');
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
    g.teleport({ x: -100, z: 40, yaw: Math.PI / 2 });
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
