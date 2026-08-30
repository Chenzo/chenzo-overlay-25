# Overlay Architecture Notes

Internal reference doc for working in this repo. Written for future-Claude, not end users.

## What this is

A Next.js (App Router, JS/JSX, no TS) browser-source overlay for OBS, hosted on Vercel. It's a
single always-on page (`app/page.js` → `Overlay.js`) that OBS loads as a browser source, plus a
couple of auxiliary pages for the streamer's own control panel. The overlay is now **multi-theme**:
`Overlay.js` is a theme-agnostic base (auth, Twitch, Murray, audio, camera, rewards) that mounts
whichever game theme is currently active — today that's **Sea of Thieves (`SoT`)**, fully built
out, and **Arc Raiders (`Arc`)**, a work-in-progress skeleton. See "Theming system" below.

Run locally: `npm run dev` → `http://localhost:3001`. OBS target (from README):
`obs64.exe --enable-gpu --use-fake-ui-for-media-stream`.

## The three surfaces

- **`/` (`app/page.js` → `components/Overlay.js`)** — the actual stream overlay. Requires Twitch
  login AND access level 0 (`hasFullAccess`, see Auth below) or it just shows "Access Denied".
  This is what's added as an OBS browser source. Renders **nothing** beyond the login/access
  gates until Murray tells it which theme is active (see Theming system).
- **`/sounder` (`app/sounder/page.js`)** — a manual control panel (soundboard + "Murray speaks"
  text box) gated by `AuthGuard` at access level ≤ 1. Not shown in OBS; it's a second browser
  tab the streamer/mods use to trigger sounds and TTS on the overlay via the Murray server.
- **`/camera-cover` (`app/camera-cover/`)** — a separate, smaller OBS browser source. Reads an
  `?overlayType=` query param and renders `FloatingAlert`, a full-screen AFK-style video banner
  (`afk` / `whiskey` / `family`). Meant to be its own OBS scene item you toggle by changing the
  source URL, independent of the main overlay's `overlayToggle` state.

`app/auth/twitch/page.js` is the OAuth implicit-flow redirect target (see Auth).

## Auth (Twitch OAuth, implicit flow)

- `LoginButton` / `AuthGuard` send the user to Twitch's OAuth authorize endpoint with
  `response_type=token` (implicit flow — no server-side secret needed for login).
- `app/auth/twitch/page.js` reads the `access_token` out of the URL hash and stores it in
  `localStorage.twitchAccessToken`. That token is used directly from the client for all Helix
  API calls (followers, subs, EventSub, reward management) — there's no session/cookie/JWT layer.
- `config/authorizedUsers.js` is a hardcoded allowlist mapping Twitch usernames → access level
  (0 = full/owner access, 1 = sounder access, 2 = limited, 3+ = none). `Overlay.js` checks
  `hasFullAccess`, `/sounder`'s `AuthGuard` checks `hasSounderAccess`. This is the only
  authorization mechanism — anyone not on the list gets locked out regardless of Twitch login.
- Logout (`LogOutButton`) just clears any `localStorage` key containing "twitch" and reloads.

## Theming system

`Overlay.js` holds an `activeTheme` state (`null` | `'SoT'` | `'Arc'`), set entirely by Murray:
a `setTheme` SSE event with `theTarget` of `'SoT'` or `'Arc'` (see Murray section below). Until
that event arrives, the overlay renders only the base chrome (audio player, camera, Twitch/Murray
connections) with no theme content — by design, so a fresh page load shows nothing themed until
Murray says which game is live.

**The split:**
- **Base (`Overlay.js`)** — everything every theme wants regardless of game: the auth gate, the
  Murray SSE listener, the Twitch live-check poll, the audio player (`AudioObject`), the
  followers/subs poll + chat socket (`ChatRelay`, headless), the camera (`CameraHolder`), and the
  reward-management components (`RewardCreator`, `EventSubHandler`). None of these files import
  or know about specific themes — they're handed theme-specific config as props.
- **Theme registry (`components/themes/index.js`)** — the one place that maps a theme name to
  everything the base needs to render it:
  ```js
  export const themes = {
    SoT: { Component, cameraFrameClassName, cameraMirror, cameraPositionSide },
    Arc: { Component, cameraFrameClassName, cameraFrameWrapper, cameraMirror, cameraPositionSide },
  };
  ```
  `Overlay.js` does `themes[activeTheme]` once per render and uses that to pick the theme's
  component and configure the camera. Add new shared-but-themed pieces here (not as growing
  `activeTheme === 'X'` conditionals in `Overlay.js`) as they come up.
- **Theme bundles** — `SotTheme.js` and `ArcTheme.js`, each a single component receiving a shared
  prop bag (alignment, sunk-ship state, followers/subs/chat, coin-reward state, etc. — see
  `Overlay.js`'s render for the exact list) and rendering whatever that theme actually shows.
  Unused props are simply ignored by whichever theme doesn't need them.
- **Theme-scoped rewards (`config/rewards/`)** — `sot.js` and `arc.js` each export their own
  reward array; `index.js` exports `rewardsByTheme` (theme → array) and `allManagedRewardTitles`
  (every reward title across all themes, flattened). `Overlay.js` looks up the active theme's
  reward list and passes it to `RewardCreator`/`EventSubHandler` as a prop.

**Camera theming** — `CameraHolder` itself has zero theme awareness; it just accepts props:
- `frameClassName` — a CSS module class for the frame's static shape/border (`SotCameraFrame.module.scss`, `ArcCameraFrame.module.scss`).
- `FrameWrapper` — a component that wraps the frame div (defaults to `Fragment`, i.e. no-op). Arc
  uses this to inject the wonky mask/border effect (see below) without `CameraHolder` knowing
  what "wonky" is.
- `mirror` — whether the live video feed is horizontally flipped (`scaleX(-1)`). SoT: `true`,
  Arc: `false`. Only applies to the real camera feed, not the AFK placeholder clips.
- `positionSide` — `'left'` or `'right'`, used by both the initial-position and resize-repositioning
  logic (same 20px margin either way). SoT sits right, Arc sits left. Re-runs on theme switch, so
  the camera snaps sides immediately rather than waiting for a window resize.

**Adding a third theme:** create `components/themes/YourTheme.js`, add reward config under
`config/rewards/yourtheme.js` and register it in `config/rewards/index.js`, add an entry to the
`themes` registry with at least `Component` (camera-frame keys are optional — omitting them just
means the camera uses no extra styling/wrapper for that theme), and make sure Murray can send
`setTheme` with that theme's name.

## The "wonky" effect (`components/effects/`)

A reusable visual effect ported from an older project's `wonky-background.ts`/`global.scss`
(`E:\sites\fully-depreciated`) — not tied to Arc or the camera specifically, deliberately placed
outside `components/themes/` so anything anywhere could use it later.

- `wonkyValues.js` — pure `generateWonkyValues()`: rolls 8 random corner-point percentages plus
  rotation values for one irregular quadrilateral. No DOM, just numbers.
- `WonkyFrame.js` — `<WonkyFrame intervalMs borderColor borderWidth>{children}</WonkyFrame>`.
  Clips `children` into one randomly-generated quad via `clip-path`, and draws a stroked SVG
  polygon border on top using a **separately-rolled** set of points (intentionally not aligned
  with the mask — the border is meant to look "off" relative to what it's framing). Both reroll
  on mount and again every `intervalMs` (default 20s); each reroll is two independent
  `generateWonkyValues()` calls, one for the mask, one for the border. Structurally the mask div
  and the border SVG are siblings under a plain wrapper — never nest the border inside the masked
  div, since the mask's `clip-path` would clip the border too.
- `WonkyFrame.module.scss` — layout/stacking only (`position`, `z-index`, `overflow: visible` so
  the border's stroke-width isn't clipped at its own box edge, a `drop-shadow` filter for the
  soft glow). Colors/sizes are all passed as props, not hardcoded here.

`components/themes/ArcWonkyFrame.js` is Arc's specific configuration of this (gold `#d4af37`,
5px border, 20s interval) — the shared component stays generic, each consumer picks its own
look. Currently used by the camera frame (`cameraFrameWrapper` in the theme registry) and, once
re-enabled, the Arc logo (see below).

## The "Murray" / SoT logger connection

"Murray" is the custom external server referenced via `MURRAY_SERVER` (server-side) and
`NEXT_PUBLIC_MURRAY_SERVER` (client-side) env vars — this is the "SoT logger" the user mentioned.
It's not part of this repo; this app is just a client of it. Two directions of traffic:

1. **Server → Overlay (SSE)**: `Overlay.js` opens `new EventSource('${murrayURL}/overlay-events')`
   in `listenToServer()`. Every message is filtered by a hardcoded `uid == 'teaxc64in'` (looks
   like a fixed client/session identifier for this streamer's instance) then dispatched by
   `theEvent`:
   - `setTheme` → `setActiveTheme(data.theTarget)` — `'SoT'` or `'Arc'` (see Theming system above)
   - `setAlignment` → good/evil meter position (SoT's `Header.js` skull-meter animation)
   - `playaudio` → sets `currentAudio`, picked up by `AudioObject.js`
   - `overlayToggle` → sets `overlayToggle` state (`'', 'afk', 'whiskey', 'family'`), consumed by
     `CameraHolder`'s `afkType` prop to swap in a placeholder clip instead of the live feed
   - `showBartender` → toggles SoT's Header/Footer visibility
   - `shipsunk` / `shipresunk` / `*-flag` / `factionshipsunk*` → pushes a ship type onto
     `sunkShipArray`, rendered by SoT's `Sunks.js` as a sinking-ship animation
   - `didEvent` with target `bbsunk`/`bbpsunk` → same sunk animation, hardcoded to "Burning Blade"
   - `imagePush` → sets `pushedImage`, rendered by SoT's `DiscordImage.js` (see below)

   The ship-sunk/alignment/image-push events are Sea of Thieves game-log concepts specifically —
   Murray simply won't send them while Arc is active, so no theme-routing was added for them;
   the state just sits unused when `SotTheme` isn't mounted.
2. **Overlay/Sounder → Server (POST)**:
   - `/sounder` posts to `${murrayURL}/crewBoard/pushSound` (play a sound) and
     `${murrayURL}/murray-talks` (TTS) so a mod can trigger overlay effects without needing
     Twitch channel points.
   - `app/api/postToDiscord/route.js` (a Next.js API route, server-side) forwards to
     `${MURRAY_SERVER}/overlay/annoucestream` — used by "TEST POST TO DISCORD" in the overlay's
     hidden menu and by `streamHasStarted()` when Twitch stream-live is detected, to have Murray
     post a "we're live" announcement to Discord.

So: Murray/the SoT logger is the hub — it presumably ingests real Sea of Thieves game log events
(ship sinks, alignment, Discord image pushes) from somewhere else and rebroadcasts them over SSE
to any connected overlay instance, and separately exposes action endpoints the overlay/sounder
can call. It's also now the thing that decides which theme is on screen.

## Twitch integration (four independent pieces)

- **Stream-live check** — `app/api/checkTwitch/route.js` (server-side API route) does an
  app-token client-credentials OAuth flow (`TWITCH_CLIENT_ID`/`TWITCH_CLIENT_SECRET`, cached
  in module-level vars) and polls Helix `/streams`. `Overlay.js` calls this every 60s
  (`checkStreamStatus`) and fires the Discord announce POST the first time it flips to live.
- **Channel point rewards** — theme-scoped (`config/rewards/`, see Theming system above).
  `Overlay.js` passes the active theme's reward array to two components, only once a theme is set:
  - `RewardCreator.js` — takes `rewards` as a prop. On mount **and every time the active theme's
    reward list changes** (i.e. on a theme switch), it fetches the channel's existing custom
    rewards, deletes any whose title is in `allManagedRewardTitles` but *not* in the current
    theme's list (cleans up the previous theme's rewards from Twitch), then creates any from the
    current list that don't exist yet. Uses the user's own OAuth token, not the app token.
  - `EventSubHandler.js` — also takes `rewards` as a prop, kept in a ref so the long-lived
    EventSub WebSocket (`wss://eventsub.wss.twitch.tv/ws`, `channel.channel_points_custom_reward_redemption.add`)
    doesn't need to reconnect on a theme switch — it just matches incoming redemptions against
    whatever the ref currently holds. On match: `animation.type === 'ancient-coin'` triggers
    `AncientCoin.js` (SoT-only); `'audioonly'` sets `currentAudio` to `animation.audioObject`,
    played by `AudioObject.js` (theme-agnostic). It defensively deletes old EventSub *subscriptions*
    (not reward objects) before creating a new one, to avoid Twitch 429s from stale subs piling
    up across reloads.
- **Chat relay** — `ChatRelay.js` is now headless (returns `null`): it connects to Twitch IRC via
  `tmi.js` and calls an `onMessage(node)` prop instead of rendering anything itself. `Overlay.js`
  owns the resulting `chatMessage` state and hands it down to whichever theme is active to render.
- **Followers/subs ticker** — the poll (Helix `/channels/followers` + `/subscriptions`, every
  30s) now lives directly in `Overlay.js`, not in `Footer.js`. `Footer.js` is purely presentational
  now, taking `followers/subs/showingSubs/isChatting/chatMessage` as props — it's SoT's footer,
  rendered from inside `SotTheme.js`.

All client-side Twitch calls use the logged-in user's own token from `localStorage`, not a
server-brokered one — there is no token refresh; re-login is the only recovery path (see
`TWITCH_OVERLAY_SETUP.md` troubleshooting section for symptoms).

## Audio system

`AudioObject.js` is the single audio player for the whole overlay (mounted at the base level, so
it works regardless of theme): it takes a `currentAudio` string (set by `Overlay.js`) and a large
hardcoded if/else maps names → file paths on an external bucket (`NEXT_PUBLIC_BUCKET_URL`, not
`/public` — audio/video assets are too big/numerous to ship in the repo), plus one local file —
`'coin'` → `/public/audio/coin.mp3`, added so Arc's reward could reuse the same sound without
needing SoT's `AncientCoin` visual. Triggers all funnel into the same `setCurrentAudio`: channel
point redemption (`EventSubHandler`), a Murray `playaudio` SSE event, and manual buttons on
`/sounder`. `'stop'` is a special sentinel value that halts playback.

`AncientCoin.js` (SoT-only) plays its own coin sound directly from `/public/audio/coin.mp3`
independent of `AudioObject`, on top of its coin-drop visual.

## Commented-out / disabled features

- **`Listener.js`** — connects to `ws://localhost:3011` (a local-machine process, not Murray),
  presumably a local speech-trigger tool that sets `currentAudio` on recognized phrases. Still
  present, functional, just not mounted in `Overlay.js`.
- **Arc's logo** — `ArcTheme.js` has the logo (`fd-logo.png`, wrapped in `ArcWonkyFrame`, meant to
  sit top-right at 150px wide) commented out while sizing/placement gets finalized. The markup
  and `ArcTheme.module.scss` styles are intact; uncomment `ArcTheme.js`'s imports and return to
  bring it back.
- `TestCoinButton.js` (a dev-only manual coin-reward trigger) was removed entirely — the real
  reward-redemption path (`EventSubHandler` → `handleCoinRewardRedeemed` → `AncientCoin`) is
  untouched.

`CameraHolder` is **not** disabled — it's mounted at the base level and active on both themes
(see Theming system above for how it's configured per theme).

## Where the Sea-of-Thieves theme lives

- `SotTheme.js` bundles all of SoT's visual components: `Header` (crew banner + alignment meter,
  hardcoded tagline "The Gentlemen of Fortune and the Adventures of The Holy Bartender"), `Sunks`
  (sunk-ship types hardcoded to `galleon`/`brig`/`sloop`/`bblade`), `DiscordImage`, `Footer`
  (followers/subs/chat presentation), `AncientCoin`.
- `config/rewards/sot.js` — pirate-flavored reward titles/prompts/icons.
- `components/themes/SotCameraFrame.module.scss` — the camera's rounded-corner border/shadow look.
- Fonts/images/palette — `public/fonts/windlass.*` (pirate-style display font),
  `styles/_variables.scss` (gold/parchment/sea-green palette), and most of `public/images/*`
  (ribbons, skull meter, gold parchment texture, ancient coin) are SoT-styled assets referenced
  directly by class name/path — not yet routed through any theme-asset abstraction, so they'd
  need to move into `SotTheme`-scoped files if a future cleanup wants full isolation.
- `components/Overlay.js` — the default `streamDescription` text (Discord announce box default)
  still hardcodes "Sea of Thieves" and the streamer's Twitch handle; this is base-level, not
  theme-scoped, since it's just a textarea default value the streamer edits per-stream anyway.

## Where the Arc Raiders theme lives (work in progress)

- `ArcTheme.js` — currently renders `null` (logo commented out, see above). This is intentionally
  sparse; build it out the same way `SotTheme.js` is structured as more Arc-specific pieces exist.
- `config/rewards/arc.js` — one reward so far ("Toss a Dollar at your Raider"), no icon yet
  (Twitch uses its stock icon), `animation: { type: 'audioonly', audioObject: 'coin' }`.
- `components/themes/ArcCameraFrame.module.scss` — square-corner placeholder border (visual
  design still TBD, per the user).
- `components/themes/ArcWonkyFrame.js` — gold/5px/20s configuration of the shared `WonkyFrame`
  effect (see above), used for the camera frame.
- `components/themes/ArcTheme.module.scss` — logo positioning (`top: 20px; right: 20px; width:
  150px; overflow: hidden;` as a hard clip), currently unused while the logo is commented out.

## Environment variables (names only — see `.env.local`, not committed)

| Var | Used by | Purpose |
|---|---|---|
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | `app/api/checkTwitch` | server-side app-token flow for stream-live check |
| `TWITCH_USERNAME` | `app/api/checkTwitch` | channel to check live status for |
| `TWITCH_USERID` / `TWITCH_REDIRECT_URI` | present, server-side counterparts of the `NEXT_PUBLIC_*` vars below |
| `NEXT_PUBLIC_TWITCH_CLIENT_ID` | client Twitch OAuth + all Helix calls | app's client ID |
| `NEXT_PUBLIC_TWITCH_REDIRECT_URI` | `LoginButton`, `AuthGuard` | OAuth implicit-flow redirect target |
| `NEXT_PUBLIC_TWITCH_USERID` | `EventSubHandler`, `RewardCreator`, `Overlay.js` (followers/subs poll) | broadcaster ID for Helix calls |
| `MURRAY_SERVER` | `app/api/postToDiscord` | server-side base URL for the SoT logger/Discord relay |
| `NEXT_PUBLIC_MURRAY_SERVER` | `Overlay.js`, `/sounder` | client-side base URL for SSE + sound/TTS POSTs |
| `NEXT_PUBLIC_BUCKET_URL` | `AudioObject`, `Header`, `CameraHolder`, `FloatingAlert` | external bucket hosting audio/video assets too large for `/public` |

## Quick component map

```
app/page.js
└─ OverlayLayout
   └─ Overlay.js                        (base: auth, Murray SSE, Twitch, audio, theme lookup)
      ├─ LoginButton / LogOutButton            (auth gate)
      ├─ CameraHolder                          (theme-configured via props from themes registry)
      │  └─ FrameWrapper (per theme)           (Fragment for SoT, ArcWonkyFrame for Arc)
      ├─ AudioObject                           (plays currentAudio)
      ├─ ChatRelay                             (headless — tmi.js chat, reports via onMessage)
      ├─ RewardCreator / EventSubHandler       (theme-scoped rewards, mounted once a theme is set)
      └─ ActiveThemeComponent = themes[activeTheme].Component
         │
         ├─ SotTheme (when activeTheme === 'SoT')
         │  ├─ Header                          (crew banner + alignment meter)
         │  ├─ Sunks                           (sunk-ship animations from Murray SSE)
         │  ├─ DiscordImage                    (Discord image/gif pushes from Murray SSE)
         │  ├─ Footer                          (followers/subs/chat — presentational only)
         │  └─ AncientCoin                     (coin-toss reward animation)
         │
         └─ ArcTheme (when activeTheme === 'Arc')
            └─ (logo, commented out — see "Where the Arc Raiders theme lives")

components/themes/index.js            (the theme registry — see Theming system)
components/effects/WonkyFrame.js      (reusable random-mask + off-shape border effect)
config/rewards/{sot,arc,index}.js     (theme-scoped reward definitions)

app/sounder/page.js  → AuthGuard → soundboard + Murray TTS box
app/camera-cover/    → CameraCoverContent → FloatingAlert (AFK banner videos)
```
