# Validation — 17 September 2026

## Passed

- All shipped JavaScript files passed Node syntax checks. Local HTML, module and font references resolve; `index.html` is the root entry point.
- Headless Chromium loaded and rendered the actual Three.js game over local HTTP with software WebGL. No JavaScript errors, console warnings, missing network requests, or external asset requests were observed during the desktop smoke test.
- Main menus and Garage, Settings, Achievements, Statistics and Help were opened at 907×510, 1216×684, 1077×606, 821×462, 1366×768, 1920×1080, 1536×864, 1280×720, 800×450 and 1080×607. Automated bounds checks found no overlapping primary menu controls or horizontal dialog overflow. Screenshots were visually reviewed at the smallest sizes. Long panels retain vertical scrolling, and their final actions and sticky close button were exercised.
- Keyboard acceleration, Arrow-key/Space default prevention, Space pause/resume, blur pause and held-input clearing passed. A real local 800×450 iframe in a tall parent page retained parent scroll position during driving keys and wheel input. Range-input keyboard defaults remained enabled.
- Coarse-pointer mobile emulation at 800×450 and 1080×607 rendered visible health, coins, speed, nitro and controls. Simultaneous touch gas/steering and touch cancellation passed using browser-dispatched touch events.
- All five map previews, premium-map launch locks, all five garage previews and side-view rotation control were exercised. Retry and scrollable panel final-action buttons worked.
- Legacy save fixtures preserved coins, cars, maps, selections, paint, tint, wheels, achievements, statistics and volume settings. Purchase persistence and actual gameplay coin banking/reload passed. Storage-unavailable fallback passed.
- A seeded 30-second simulation at 60, 120, 144 and 165 render updates/second produced identical physics, distance, traffic, spawning, pickup, nitro and collision results (1,800 simulation steps per run). This is a deterministic timing test, not physical monitor testing.
- A suspended AudioContext resumed from a keyboard gesture. Platform mute reached zero gain while preserving the player's saved master volume.
- Optional bridge tests passed for absent SDK/ads, lifecycle deduplication, game-over-only ad guards, explicit reward gesture guards, and restored mute/input state after ad errors. No real ads or SDK were loaded.
- Repeated complete car-switch cycles after visiting all maps retained identical geometry and texture counts in the main renderer across three cycles in each test run; no growth was observed.
- No custom fullscreen UI/API calls remain. No external promotional buttons or third-party ads were present.

## Scope and remaining platform checks

These checks used local HTTP, Chromium software WebGL and touch emulation. They do not substitute for CrazyGames' submission QA, real mobile hardware performance, Safari/iOS audio interruption testing, or actual SDK/cloud/ad/account integration. Test the uploaded build in the CrazyGames preview before submitting. The game remains a Basic Launch build with inactive extension points for Full Launch.

Progress is compatible on the same origin. Existing saves on another website cannot be read automatically by the CrazyGames origin.
