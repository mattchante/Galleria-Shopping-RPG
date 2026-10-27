# Galleria Streets

A third-person, Stick RPG-style browser game set around Galleria Dallas (Alpha Rd, Noel Rd, Montfort Dr, Dallas Pkwy, the Dallas North Tollway and LBJ). Built with [three.js](https://threejs.org/) and [Vite](https://vite.dev/).

## Run it

Requires Node 20.19 or newer.

```bash
npm install
npm run dev          # local dev server with hot reload, usually http://localhost:5173
```

| Script                 | What it does                                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`          | Dev server. The debug hook `window.__g` is available in the console.                                                                                                                                         |
| `npm run build`        | Production build to `dist/` (what GitHub Pages serves).                                                                                                                                                      |
| `npm run build:single` | One self-contained `dist-single/index.html` (everything inlined), handy for sharing a single file or a Claude artifact.                                                                                      |
| `npm run preview`      | Serves `dist/` locally to check a production build.                                                                                                                                                          |
| `npm run smoke`        | Headless smoke test of `dist/`: visits ten places outdoors and indoors, checks driving, sprinting, the escalator and the Apple product card, writes screenshots to `smoke-output/`, fails on any page error. |

Run `npm run build` before `npm run smoke`, and once per machine `npx playwright install chromium`.

GitHub Pages: in the repo's Settings → Pages, set Source to **GitHub Actions**. Every push to `main` then builds and publishes the game.

## Controls

| Key                   | Action                                                     |
| --------------------- | ---------------------------------------------------------- |
| WASD / arrows         | Walk, drive                                                |
| Mouse (click to lock) | Look                                                       |
| Shift (hold)          | Skateboard outdoors, sprint indoors, skate faster on ice   |
| Tab                   | Get in / out of the black SUV                              |
| Space                 | Jump, tap again to double jump (handbrake in the SUV)      |
| E                     | Enter / exit doors, free the mouse at Apple product tables |
| M                     | Bigger map                                                 |
| Wheel                 | Camera distance                                            |

Phones get an on-screen stick and buttons.

## What's in it

- Half-scale street grid with signal-timed traffic, pedestrians, the elevated Tollway and I-635
- Target (enterable) and a McDonald's at Montfort & LBJ
- Two-level Galleria interior: shops, a walk-in Apple store with product tables that link to apple.com, a walk-in Sephora, CCR Gallery (framed photographs, canvases and sculpture), a two-floor Barnes & Noble (café, staircase, level-2 windows, entrances from both mall levels), a skateable ice rink with a Christmas tree, and a food court with open kitchens and moving escalators

## Project layout

```
index.html              HUD markup and the module entry point
src/
  main.js               load order of every module, the game loop, start button, debug hook
  styles.css            HUD styling
  core/                 shared state, DOM util, renderer + scene, helpers, materials, collision
  world/                layout data (roads, buildings, lots, doors), sky, streets, signals,
                        buildings, lots, storefronts, mall exterior, trees
  life/                 traffic, people
  player/               avatar, input, physics
  vehicles/suv.js       the drivable SUV
  interiors/            rooms registry, doors, Target,
    galleria/           the mall: index (shell), escalators, shops, food court, ice rink, Apple, Sephora, CCR Gallery, Barnes & Noble
  view/camera.js        follow camera
  ui/                   HUD, minimap, location readout
scripts/smoke.mjs       headless smoke test
```
