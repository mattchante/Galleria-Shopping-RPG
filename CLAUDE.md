# CLAUDE.md

Instructions for AI coding assistants (Claude Code, Cursor) working in this repo. Read this first.

## What this is

Galleria Streets: a third-person, Stick RPG-style browser game set around Galleria Dallas (Alpha Rd, Noel Rd, Montfort Dr, Dallas Pkwy, the Dallas North Tollway and LBJ), built with three.js and Vite. The owner vibe codes it: they describe what they want, the assistant builds and verifies it. The owner is newer to coding, so explain in plain words why a technical change matters.

**Priorities, in order:** recognizable layout and navigation of the real area → playability → visual polish. The street map is traced from OpenStreetMap and runs at **half real scale** (`K = 0.5` in `world/layout.js`) so the area is quick to cross; road widths, sidewalks and building heights stay full size. Buildings are solid; only some places are enterable: the Galleria (through Macy's pink-granite entrance on Noel Rd) and Target from the street, and inside the Galleria the Apple store, Sephora, CCR Gallery, the Diamond’s Dogs pet store and the two-floor Barnes & Noble, all walk-in with no loading screen. Season: late October, with holiday decor in the mall.

## Commands

```bash
npm run dev            # dev server; window.__g debug hook available
npm run build          # production build -> dist/ (what GitHub Pages serves)
npm run build:single   # one self-contained HTML -> dist-single/index.html
npm run smoke          # headless test of dist/ (run `npm run build` first)
npm run format         # Prettier
```

## Workflow rules

1. **Before every commit:** `npm run format`, `npm run build`, `npm run smoke`. The smoke test must pass.
2. **Look at the result.** For any visual change, open the relevant `smoke-output/*.png` (or add a shot to `SHOTS` in `scripts/smoke.mjs`) and check it. A passing build does not mean the scene looks right.
3. **The owner tests before anything is pushed.** Commit and push only when the owner asks. Keep unrelated changes in separate commits.
4. Pin new npm dependencies to exact versions at least two weeks old.
5. Don't reproduce real brand logos. Store names in plain type are fine (Apple, Barnes & Noble, Target); copying a logo, its mark or its signature lettering is not.
6. Outbound links (the Apple product tables) must be real `<a href target="_blank">` elements, not `window.open`.

## Architecture

- **Units and axes:** metres. x = east, z = south, y = up. Outdoors, Noel Rd is x = 0 and Alpha Rd is z = 0. Each interior has its own scene and coordinates (see its `RM`/`M` bounds).
- **Map data** (`world/layout.js`) is written in **real metres** from OpenStreetMap, projected around the Noel/Alpha intersection, and converted to game units by `G([x, z])` (real rectangles by `box4`). Add streets and buildings in real coordinates; `clipRect` trims a building that would crowd a road or sidewalk, `clipDNT` keeps it off the Tollway columns. Road ends within 4 m of another road snap onto it (T-junctions). Intersections are found where one road runs roughly east-west and the other roughly north-south (within `NEAR`); keep the segments either side of a crossing close to those axes. Roads that leave the map wrap their traffic; hand-offs between roads (Noel → LBJ frontage, Inwood ↔ Dallas Pkwy, Tollway ↔ I-635) are in `life/traffic.js`. `PLACES` feeds the location readout and minimap labels. **Target Plaza** (`PLAZA` in layout, built by `world/target-plaza.js`) is laid out in game units between Target's front and Montfort's sidewalk: fire lane, main drive, McDonald's drive, lots (drawn by `lots.js`), and its buildings.
- **Facing:** a character's `rotation.y = rot`, forward is `(sin rot, cos rot)`. The camera sits at `cam.yaw` and looks back at the player, so `rot = cam.yaw + π` faces away from the camera.
- **Load order matters.** `src/main.js` imports every module in order; modules build their part of the world as they load. New modules go into that list.
- **Shared state:** `state.*` (in `core/state.js`) holds values several modules write: `mode` ('out' or 'room'), `curRoom`, `curDoor`, `started`, `busy`, movement flags, the clock and signal timer. `late.*` holds functions and objects defined in a module that loads later (player `P`, `keys`, `cam`, `V`, `interact`...). Read `late.*` only inside functions that run during play, never at module load.
- **Rooms:** `interiors/rooms.js` registers each interior (`ROOMS`). A room object has `scene`, bounds `RM`, `door`, `spawn`, `solids`, `blockers`, optional `floorAt` (multi-level floors), `conveyor` (escalators), `onIce`, `productAt`, `subDoors` (doors into other rooms), `parent`/`back` (exit into another room instead of the street), `labelAt`, `plan` (indoor minimap) and `update`. Doors and fades live in `interiors/doors.js`.
- **The Galleria** is split by area in `interiors/galleria/`: `index.js` builds the shell, walkways, vault, the north wall with the Barnes & Noble openings, and people, and calls `escalators`, `shops`, `food-court`, `ice-rink`, `apple-store`, `sephora`, `ccr-gallery`, `pet-store` and `bookstore` in that order. Images (the gallery's framed photos) live in `src/assets/` and are imported, so Vite fingerprints them and the single-file build inlines them. Shared locals travel on a `ctx` object: a part destructures what it reads at its top and `Object.assign`s what it declares at its end.
- **Walk-in stores** (Apple, Sephora, CCR Gallery) sit west of the mall's west wall (x < -12); the pet store (`PS`) sits east of the east wall (x > 12, z -17.3..5.3), with its own band in `clampXZ`. Its puppies and cats animate from `petUpdate`, called in the Galleria's `update`. `clampXZ` in `galleria/index.js` lets the player past x = -12 only within each store's z band; the store's shell walls and fixtures are solids. A new walk-in store needs a gap in the west wall, its own solids, and a band in `clampXZ`, `labelAt` and the floor plan.
- **Barnes & Noble** (`galleria/bookstore.js`) is built in local coordinates inside a group at world z = `BZ` (-68.3, the mall's north wall). Level 2 is at y = 5.5 like the mall's upper walkways; the staircase runs up the east wall. `FLOOR2` lists the level-2 floor plates; `bnFloorsAt` feeds the mall's `floorAt`. Solids carry `y0`/`y1` so level-1 and level-2 fixtures don't block each other.
- **Collision:** outdoors, `solids` (axis-aligned boxes) plus traffic. Indoors, the room's `solids` (in the Galleria, `B(..., true)` only blocks the camera; use `S_` for anything the player should bump into); a solid with `y0`/`y1` only blocks at those heights (railings on level 2, rink boards). `collide()` in `core/collision.js`. Anything solid needs an entry. Camera-blocking meshes go in `blockers` (outdoors) or the room's `blockers`.
- **three.js is pinned at 0.128.0.** Use that version's API.

## Gotchas

- **Flat overlays on the ground** (paths, crosswalks, mats, ice lines) need `decal(material, k)` with a larger `k` than whatever they sit on, or they flicker at low camera angles.
- **Planes against walls** must sit in front of any box at the same spot (the Apple video wall once rendered black because its frame box covered it).
- **Defining helpers after first use** breaks loading (temporal dead zone). If a module needs a helper at load time, it must come from an earlier module.
- **Local variables named `state` or `late`** would hide the shared objects; don't use those names.
- **Headless rendering is slow** (software WebGL, under 1 fps). The smoke test waits for rendered frames, not wall-clock time, and sets `window.__lite = true` before load to lower resolution.

## Debug hook

`window.__g` (dev server, or any build with `?debug` in the URL): `start()`, `teleport({x,z,y,yaw})`, `setCam(yaw,pitch,dist)`, `enter('galleria'|'target')`, `outside()`, `toggleDrive()`, `sim(seconds)` / `simDrive(seconds)` for fixed-step walking and driving, `info()` (mode, room, position, location text, product card), plus `P`, `V`, `keys`, `cam`, `DOORS`, `ROOMS`, `scene`, `renderer`, `camera`.
