# Overlay Architecture Notes

Internal reference doc for working in this repo. Written for future-Claude, not end users.

## What this is

A Next.js (App Router, JS/JSX, no TS) browser-source overlay for OBS, hosted on Vercel. It's a
single always-on page (`app/page.js` → `Overlay.js`) that OBS loads as a browser source, plus a
couple of auxiliary pages for the streamer's own control panel. Everything is currently
**100% Sea of Thieves themed** — see "Where the game theme lives" below, since the plan is to
eventually support multiple games/themes.

Run locally: `npm run dev` → `http://localhost:3001`. OBS target (from README):
`obs64.exe --enable-gpu --use-fake-ui-for-media-stream`.

## The three surfaces

- **`/` (`app/page.js` → `components/Overlay.js`)** — the actual stream overlay. Requires Twitch
  login AND access level 0 (`hasFullAccess`, see Auth below) or it just shows "Access Denied".
  This is what's added as an OBS browser source.
- **`/sounder` (`app/sounder/page.js`)** — a manual control panel (soundboard + "Murray speaks"
  text box) gated by `AuthGuard` at access level ≤ 1. Not shown in OBS; it's a second browser
  tab the streamer/mods use to trigger sounds and TTS on the overlay via the Murray server.
- **`/camera-cover` (`app/camera-cover/`)** — a separate, smaller OBS browser source. Reads an
  `?overlayType=` query param and renders `FloatingAlert`, a full-screen AFK-style video banner
  (`afk` / `whiskey` / `family`). Meant to be its own OBS scene item you toggle by changing the
  source URL, independent of the main overlay's `overlayToggle` state (which is currently wired
  up but the component that drove it, `CameraHolder`, is commented out — see below).

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

## The "Murray" / SoT logger connection

"Murray" is the custom external server referenced via `MURRAY_SERVER` (server-side) and
`NEXT_PUBLIC_MURRAY_SERVER` (client-side) env vars — this is the "SoT logger" the user mentioned.
It's not part of this repo; this app is just a client of it. Two directions of traffic:

1. **Server → Overlay (SSE)**: `Overlay.js` opens `new EventSource('${murrayURL}/overlay-events')`
   in `listenToServer()`. Every message is filtered by a hardcoded `uid == 'teaxc64in'` (looks
   like a fixed client/session identifier for this streamer's instance) then dispatched by
   `theEvent`:
   - `setAlignment` → good/evil meter position (`Header.js` skull-meter animation)
   - `playaudio` → sets `currentAudio`, picked up by `AudioObject.js`
   - `overlayToggle` → sets `overlayToggle` state (`'', 'afk', 'whiskey', 'family'`) — currently
     has no consumer since `CameraHolder`/`Listener` are commented out of the render tree
   - `showBartender` → toggles Header/Footer visibility
   - `shipsunk` / `shipresunk` / `*-flag` / `factionshipsunk*` → pushes a ship type onto
     `sunkShipArray`, rendered by `Sunks.js` as a sinking-ship animation
   - `didEvent` with target `bbsunk`/`bbpsunk` → same sunk animation, hardcoded to "Burning Blade"
   - `imagePush` → sets `pushedImage`, rendered by `DiscordImage.js` (see below)
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
can call.

## Twitch integration (four independent pieces)

- **Stream-live check** — `app/api/checkTwitch/route.js` (server-side API route) does an
  app-token client-credentials OAuth flow (`TWITCH_CLIENT_ID`/`TWITCH_CLIENT_SECRET`, cached
  in module-level vars) and polls Helix `/streams`. `Overlay.js` calls this every 60s
  (`checkStreamStatus`) and fires the Discord announce POST the first time it flips to live.
- **Channel point rewards** — `config/rewards.js` is the single source of truth for reward
  definitions (title, cost, prompt, icon, `animation.type`). Two components consume it:
  - `RewardCreator.js` — on mount, checks existing custom rewards on the user's channel via
    Helix and creates any that are missing (uses the user's own OAuth token, not the app token).
  - `EventSubHandler.js` — opens a Twitch EventSub WebSocket (`wss://eventsub.wss.twitch.tv/ws`),
    subscribes to `channel.channel_points_custom_reward_redemption.add`, and on redemption
    matches the title against `config/rewards.js` to decide what to do: `animation.type ===
    'ancient-coin'` triggers `AncientCoin.js`; `'audioonly'` sets `currentAudio` to
    `animation.audioObject`, which `AudioObject.js` plays. It defensively deletes old
    subscriptions for this event type before creating a new one (avoids Twitch 429s from stale
    subs piling up across reloads).
- **Chat relay** — `ChatRelay.js` connects directly to Twitch IRC via `tmi.js` (no server
  involved) and renders the latest chat message with emotes swapped for `<img>` tags.
- **Followers/subs ticker** — `Footer.js` polls Helix `/channels/followers` and `/subscriptions`
  directly from the client every 30s and alternates displaying the two lists.

All client-side Twitch calls use the logged-in user's own token from `localStorage`, not a
server-brokered one — there is no token refresh; re-login is the only recovery path (see
`TWITCH_OVERLAY_SETUP.md` troubleshooting section for symptoms).

## Audio system

`AudioObject.js` is the single audio player for the whole overlay: it takes a `currentAudio`
string (set by parent `Overlay.js`) and a large hardcoded if/else maps names → file paths on an
external bucket (`NEXT_PUBLIC_BUCKET_URL`, not `/public` — audio/video assets are too big/numerous
to ship in the repo). Three different triggers all funnel into the same `setCurrentAudio`:
channel point redemption (`EventSubHandler`), a Murray `playaudio` SSE event, and manual buttons
on `/sounder`. `'stop'` is a special sentinel value that halts playback.

`AncientCoin.js` plays its own coin sound directly from `/public/audio/coin.mp3` (small, local)
independent of `AudioObject`.

## Commented-out / disabled features

Per the recent "turning off camera for now" commit, `Overlay.js` currently has these imports
commented out and not rendered:

- **`CameraHolder.js`** — a draggable, resizable webcam picker box (getUserMedia + device
  selection) that also swapped in a placeholder video (afk/whiskey/family) based on `afkType`.
- **`Listener.js`** — connects to `ws://localhost:3011` (a local-machine process, not Murray),
  presumably a local speech-trigger tool that sets `currentAudio` on recognized phrases.

Both are still present in the codebase and functional, just not wired into the render tree.
`overlayToggle` state and the Murray `overlayToggle` SSE event still exist in `Overlay.js` but
currently have no consumer as a result.

## Where the Sea-of-Thieves theme is hardcoded

Relevant for the future multi-game/theme work — these are the places game-specific content lives
today, all as hardcoded values rather than config:

- `config/rewards.js` — reward titles/prompts/icons are pirate-flavored, plus hosted icon URLs
  under `chenzorama.com/overlay/twitch/redemption_icons/`.
- `components/Sunks.js` — ship types are hardcoded to `galleon`, `brig`, `sloop`, `bblade`
  (Burning Blade), each with its own image under `public/images/sunk/`.
- `components/Header.js` — hardcoded crew name/tagline ("The Gentlemen of Fortune and the
  Adventures of The Holy Bartender") and a good/evil "skull meter" alignment bar (maps to SoT's
  Pirate Emissary reputation mechanic).
- `components/AudioObject.js` — sound names are a mix of general meme sounds and SoT/community
  in-jokes; not theme-structured, just a flat list.
- `components/AncientCoin.js` / the `fake-coin` reward — SoT-specific "toss a coin to your
  pirate" flavor.
- `components/Overlay.js` — default `streamDescription` text mentions "Sea of Thieves" and the
  streamer's Twitch handle directly.
- Fonts/images/palette — `public/fonts/windlass.*` (pirate-style display font),
  `styles/_variables.scss` (gold/parchment/sea-green palette), and most of `public/images/*`
  (ribbons, skull meter, gold parchment texture, ancient coin) are SoT-styled assets referenced
  directly by class name/path throughout components rather than through any theme abstraction.

None of this is parameterized yet — reskinning for another game currently means editing these
files directly.

## Environment variables (names only — see `.env.local`, not committed)

| Var | Used by | Purpose |
|---|---|---|
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | `app/api/checkTwitch` | server-side app-token flow for stream-live check |
| `TWITCH_USERNAME` | `app/api/checkTwitch` | channel to check live status for |
| `TWITCH_USERID` / `TWITCH_REDIRECT_URI` | present, server-side counterparts of the `NEXT_PUBLIC_*` vars below |
| `NEXT_PUBLIC_TWITCH_CLIENT_ID` | client Twitch OAuth + all Helix calls | app's client ID |
| `NEXT_PUBLIC_TWITCH_REDIRECT_URI` | `LoginButton`, `AuthGuard` | OAuth implicit-flow redirect target |
| `NEXT_PUBLIC_TWITCH_USERID` | `EventSubHandler`, `RewardCreator`, `Footer` | broadcaster ID for Helix calls |
| `MURRAY_SERVER` | `app/api/postToDiscord` | server-side base URL for the SoT logger/Discord relay |
| `NEXT_PUBLIC_MURRAY_SERVER` | `Overlay.js`, `/sounder` | client-side base URL for SSE + sound/TTS POSTs |
| `NEXT_PUBLIC_BUCKET_URL` | `AudioObject`, `Header`, `CameraHolder`, `FloatingAlert` | external bucket hosting audio/video assets too large for `/public` |

## Quick component map

```
app/page.js
└─ OverlayLayout
   └─ Overlay.js                 (orchestrator: all shared state lives here)
      ├─ LoginButton / LogOutButton     (auth gate)
      ├─ Header                        (crew banner + alignment meter)
      ├─ AudioObject                   (plays currentAudio)
      ├─ Sunks                         (sunk-ship animations from Murray SSE)
      ├─ DiscordImage                  (Discord image/gif pushes from Murray SSE)
      ├─ Footer                        (followers/subs ticker)
      │  └─ ChatRelay                  (tmi.js live chat line)
      ├─ AncientCoin / TestCoinButton  (coin-toss reward animation)
      ├─ RewardCreator                 (ensures channel-point rewards exist)
      └─ EventSubHandler               (Twitch EventSub WS → reward redemptions)

app/sounder/page.js  → AuthGuard → soundboard + Murray TTS box
app/camera-cover/    → CameraCoverContent → FloatingAlert (AFK banner videos)
```
