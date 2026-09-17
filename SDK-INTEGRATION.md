# Future CrazyGames SDK v3 integration

The Basic Launch build does not call `platform.install`, load the SDK, or request any ads. All bridge operations are optional and safe when no adapter exists. These are extension points, not an enabled Full Launch integration.

1. Load only the official `https://sdk.crazygames.com/crazygames-sdk-v3.js` when Full Launch work begins. The future adapter's `init()` must await `window.CrazyGames.SDK.init()` before any SDK calls. Handle unavailable SDK initialization without breaking the standalone game.
2. Import the `platform` singleton and explicitly install an adapter implementing the methods below. Recheck the current v3 documentation when implementing each API; these interface method names are app-owned, not purported SDK calls.

| Adapter method | Responsibility |
| --- | --- |
| `init()` | Await v3 initialization; resolve only when ready. |
| `gameplayStart()` / `gameplayStop()` | Forward gameplay lifecycle. The game emits transitions on playable start/resume and pause, blur, menu or game-over. Countdown does not count as gameplay. |
| `loadingStart()` / `loadingStop()` | Forward loading state. Install before importing the main game if initial loading needs to be measured. |
| `subscribeMute(callback)` | Read the initial platform muteAudio state and forward changes to callback. Keep subscriptions singular. Do not overwrite player volume settings. |
| `getUser()` | Return account information using v3 User APIs, handling logged-out/unavailable cases. Login UI/account-change save reconciliation must be implemented before enabling cloud saves. |
| `requestAd(type, placement)` | Map `rewarded` or `midgame` to v3 ad APIs. Keep the promise pending until completion/error. Resolve true only on confirmed completion; false for unavailable/blocked/skipped ads. |

## Saves

`storage` has the existing synchronous `getItem`/`setItem` contract. Initialize the v3 Data module, read/reconcile its snapshot and choose the correct user's progress **before** constructing `SaveManager`. Then install the backend with `storage.useBackend(...)`. Preserve the complete JSON object and key `endless-highway-v1`, including unknown fields. `setItem` can return a promise; rejected writes are caught while local persistence remains available. A promise-returning `getItem` is not supported: preload a synchronous snapshot first.

Do not merge numeric balances by addition or replace populated progress with an empty record. Implement explicit account-switch/cloud-conflict handling and test it before Full Launch.

## Ads and optional rewards

Nothing calls the ad hooks in this build. There are no automatic rewarded requests and no reward buttons.

- A future trusted click on a **Watch Ad → Revive** or **Watch Ad → Bonus Coins** game-over button can pass its event to `platform.requestRevive(event)` or `platform.requestBonusCoins(event)`.
- Both return false unless there is an installed adapter, a trusted interaction, and state `over`. Only grant a reward after true. Each game-over action needs a one-use reward guard.
- A future midgame integration may call `platform.requestMidgame()` only after a completed run. The bridge rejects calls during driving, countdown, pause, menus, garage and settings.
- The bridge stops gameplay lifecycle, mutes audio, and blocks start/home/open/close navigation from before requesting an ad until the adapter resolves or rejects. The game-over simulation is already stopped. Do not use a timeout that resumes gameplay while an ad may still be displaying.
- Revival is NOT implemented. When adding it, reconcile the already-banked run (to prevent duplicate coins/statistics), clear nearby hazards and held inputs, grant a short invulnerability interval, and resume through `setState()` only after the ad has ended and the user can safely return. Bonus rewards must likewise be banked exactly once.
- Ordinary navigation, pausing and Settings/Garage buttons must never call these hooks. Retain the ad-unavailable path and player volume settings.

Validate on the CrazyGames preview/developer environment with actual v3 callbacks and platform mute settings before requesting Full Launch.
