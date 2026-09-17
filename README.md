# Out Office — CrazyGames Basic Launch build

A separate static HTML/CSS/JavaScript + Three.js build. The original source ZIP is unchanged.

## Submission

Upload **Out-Office-CrazyGames.zip**, with `index.html` at the ZIP root, to the CrazyGames developer portal. Select `index.html` as the entry point and landscape orientation. There is no build command, npm dependency, remote font, CDN dependency, custom fullscreen control, advertising script, or required SDK. All fonts, Three.js modules and licenses are included. Audio and scenery are generated locally.

For a local preview, serve the extracted folder over HTTP, e.g. `python3 -m http.server 8000`, and open `http://localhost:8000`. ES modules require HTTP(S); double-clicking `index.html` using a `file:` URL is not a supported launch method.

## Changes

- Removed the menu fullscreen button, its browser API calls/listener, and the obsolete fullscreen help entry. Closed the resulting menu gap.
- Protected driving arrow keys and Space from default scrolling, including when a game button has focus. Kept native text, range and select interactions. Prevented wheel scrolling over the game canvas/controls while retaining scrollable menus and dialogs.
- Kept existing touch pointer capture and multi-touch release/cancellation. Added scoped selection/callout and double-tap protections. Removed the global viewport zoom restriction. Touch controls update after viewport resizing.
- Added compact two-column menu rules for landscape iframes from 760 px wide, compact spacing for short screens, bounded scrollable dialogs with a sticky close row, and visible mobile health indicators. Preserved colours, fonts, branding and component styles.
- Moved countdown, vehicle physics, traffic, collision/pickup processing, distance/coin rewards and progression timers to a fixed 60 Hz simulation driven by elapsed time. Rendering remains tied to the display. Catch-up is capped at 100 ms to avoid jumps after long stalls. Focus loss pauses and clears controls; hidden tabs do not simulate/render.
- Retained existing traffic, pickup, particle and scenery pools. Reused the coin material and fog colour, avoided rebuilding an unchanged player car, and limited HUD DOM updates to 20 Hz. Original rendering quality settings remain available.
- Bundled the original Barlow and Barlow Condensed fonts locally with their OFL license, retaining the Three.js license and relative imports.
- Added a lightweight initial loading cover, removed only after the first initialized scene render; initialization failures show the existing recovery message.
- Added user-gesture audio recovery (including suspended/interrupted contexts), caught resume failures, and separate platform/hidden-tab mute flags that do not overwrite saved volume settings.
- Preserved the `endless-highway-v1` local save key/schema and introduced a storage adapter seam with an in-memory fallback when storage is unavailable.
- Added inactive platform lifecycle, account, mute, storage and guarded ad extension points in `platform.js`. No SDK is loaded, no ads are shown, and no ad buttons were added. Escape now closes/backtracks dialogs; Space continues to pause/resume a drive.

Cars, five maps, prices, rewards, achievements, statistics, customisation, engine profiles, near misses, health, nitro, traffic and original 60 Hz physics tuning remain in place. No external platform promotions were found and no inappropriate content was added.

## Save compatibility

Existing valid saves on the **same origin** are read unchanged. Browser localStorage is origin-bound: hosting on CrazyGames cannot automatically access a save from another domain, GitHub Pages, or a local server. Private/blocked storage uses session memory and cannot persist after closing the page. Full Launch cloud migration/account reconciliation is deliberately not enabled.

## Future Full Launch SDK v3

Read `SDK-INTEGRATION.md` before implementing the optional adapter. This build is prepared for Basic Launch, not a claim of CrazyGames approval or a complete Full Launch integration.

Official references checked 17 September 2026:
- https://docs.crazygames.com/requirements/technical/
- https://docs.crazygames.com/sdk/intro/
