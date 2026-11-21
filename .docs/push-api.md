# Push API

Commands are sent to the Murray server as a JSON `POST`. Murray rebroadcasts them over SSE (`${NEXT_PUBLIC_MURRAY_SERVER}/overlay-events`), and the overlay (`components/Overlay.js`, `listenToServer()`) handles them.

## Endpoint

```
POST http://localhost:3000/crewBoard/pushSound
Content-Type: application/json
```

```json
{
  "theEvent": "overlayToggle",
  "theTarget": "",
  "theValue": "",
  "uid": "teaxc64in"
}
```

| Field | Notes |
| --- | --- |
| `theEvent` | Which command to run (see below). |
| `theTarget` | The command's main value. |
| `theValue` | Only used by `imagePush`. Otherwise send `""`. |
| `uid` | Must be `teaxc64in`, or the overlay ignores the message. |

The endpoint is named `pushSound`, but the overlay acts on any `theEvent` it receives. Murray's side isn't in this repo; the only caller here is `/sounder` (`app/sounder/page.js`), which sends `playaudio`.

## Commands

| `theEvent` | `theTarget` | What it does |
| --- | --- | --- |
| `setTheme` | `SoT`, `Arc` | Sets the active theme |
| `overlayToggle` | `""`, `afk`, `whiskey`, `family`, `skullvatar` | Swaps the camera for a placeholder video or the face-tracked skull |
| `playaudio` | sound id, or `stop` | Plays a sound |
| `setAlignment` | `0`–`100` | Moves the SoT good/evil meter |
| `showBartender` | `true`, `false` | Shows or hides the SoT header and footer |
| `showCamera` | `true`, `false` | Shows or hides the camera section, in any theme |
| `showWaveform` | `true`, `false` | Shows or hides the mic waveform bar |
| `shipsunk`, `shipresunk`, `shipsunk-flag`, `shipresunk-flag`, `factionshipsunk`, `factionshipsunk-flag` | `galleon`, `brig`, `sloop` | Plays the SoT sinking-ship animation |
| `didEvent` | `bbsunk`, `bbpsunk` | Plays the Burning Blade sinking animation |
| `imagePush` | (unused) | Shows a Discord image. The data goes in `theValue` |

## Details

### `setTheme`

Sets which theme is mounted. Nothing themed (including the camera) renders until a theme is set.

- `theTarget`: `SoT` (Sea of Thieves) or `Arc` (Arc Raiders). Must match a key in `components/themes/index.js`.

```json
{ "theEvent": "setTheme", "theTarget": "Arc", "theValue": "", "uid": "teaxc64in" }
```

### `overlayToggle`

Replaces the camera with a looping video from `NEXT_PUBLIC_BUCKET_URL/video/` or with the skull avatar. Send `""` to return to the live camera. Only one can be active at a time.

| `theTarget` | Video |
| --- | --- |
| `afk` | `hoggle_peeing-small.mp4` |
| `whiskey` | `whiskey_1.mp4` |
| `family` | `family.mp4` |
| `skullvatar` | Face-tracked skull (see `.docs/SkullFace.md`). Face tracking runs only while this is active. A camera must be selected. |
| `""` | back to the camera |

```json
{ "theEvent": "overlayToggle", "theTarget": "afk", "theValue": "", "uid": "teaxc64in" }
```

### `playaudio`

Plays a sound from `NEXT_PUBLIC_BUCKET_URL/audio/` (`components/AudioObject.js`). Starting a new sound stops the current one. Send `stop` to stop playback.

```json
{ "theEvent": "playaudio", "theTarget": "airhorn", "theValue": "", "uid": "teaxc64in" }
```

Sound ids:

- **Laughs:** `sitcom`, `biglaugh`, `mediumlaughclap`, `lightlaughclap`
- **Themes and songs:** `chenzo`, `chenzo_short`, `binobo_song_1`, `binobo_song_2`, `binobo_not_evil`, `peoples_song`, `peoples_song_short`, `hero`, `wood`, `sailingaway`, `bbetty1`, `bbetty2`, `rocklobster`, `rl_short`
- **Clips:** `pricefail`, `dicks`, `mbrothers`, `brave`, `airhorn`, `mywife`, `spongebobfail`, `doradidit`, `dora`, `janet`, `trap`, `3`, `digs`, `babyshark`, `sharkbait`, `carl`, `forgiveness`, `scooty`, `wind`, `fire`, `warrenty`, `blastem`, `chunky`, `sosalty`, `scratch`
- **Used by the overlay itself:** `shutter` (image push), `coin` (ancient coin reward), `token` (raider token reward)
- **Control:** `stop`

### `setAlignment`

Moves the skull on the SoT good/evil meter (`components/Header.js`). The value is parsed as an integer.

- `0` is fully evil, `50` is neutral, `100` is fully good.
- Below about `28`, the header gets the evil style. Above about `72`, it gets the good style.

```json
{ "theEvent": "setAlignment", "theTarget": "75", "theValue": "", "uid": "teaxc64in" }
```

### `showBartender`

Shows or hides the SoT header and footer.

- `theTarget`: the string `true` or `false`. Anything other than `true` hides them.

```json
{ "theEvent": "showBartender", "theTarget": "false", "theValue": "", "uid": "teaxc64in" }
```

### `showCamera`

Shows or hides the whole camera section (camera, skull, videos and debug panel) in any theme. It's on by default.

- `theTarget`: the string `true` or `false`. Anything other than `true` hides it.
- The camera is hidden with CSS rather than removed, so the stream and the chosen device are still there when it comes back.
- Skull face tracking pauses while the camera is hidden.
- Independent of `overlayToggle`: whatever was showing (camera, skull or AFK video) comes back as it was.

```json
{ "theEvent": "showCamera", "theTarget": "false", "theValue": "", "uid": "teaxc64in" }
```

### `showWaveform`

Shows or hides a mirrored, scrolling waveform of your mic level (`components/AudioWaveform.js`). It sits centered at the bottom of the screen: 60% of the screen width, 100px tall and 20px from the bottom. It's off by default and works in any theme.

- `theTarget`: the string `true` or `false`. Anything other than `true` hides it.
- The first time it's shown, click the bar to pick a mic. Until a mic is picked, the bar shows "Click to choose a mic".
- The mic only runs while the waveform is showing. The chosen mic is remembered until the page reloads.

```json
{ "theEvent": "showWaveform", "theTarget": "true", "theValue": "", "uid": "teaxc64in" }
```

### Ship sunk events

`shipsunk`, `shipresunk`, `shipsunk-flag`, `shipresunk-flag`, `factionshipsunk` and `factionshipsunk-flag` all behave the same way: they add a sinking-ship animation (`components/Sunks.js`, SoT theme).

- `theTarget`: the ship type. Anything after the first `-` is ignored, so `sloop-123` works.
- Ship types with art: `galleon`, `brig`, `sloop`. Any other type is added but draws nothing.

```json
{ "theEvent": "shipsunk", "theTarget": "galleon", "theValue": "", "uid": "teaxc64in" }
```

### `didEvent`

Only two targets do anything, and both add the Burning Blade sinking animation:

- `bbsunk`
- `bbpsunk`

```json
{ "theEvent": "didEvent", "theTarget": "bbsunk", "theValue": "", "uid": "teaxc64in" }
```

### `imagePush`

Shows a pushed Discord image with a caption for 18 seconds and plays the `shutter` sound (`components/DiscordImage.js`, SoT theme). Tenor URLs are shown with Tenor's embed.

- `theTarget`: unused.
- `theValue`: an object, not a string:

| Field | Meaning |
| --- | --- |
| `url` | Image URL |
| `pusher` | Who pushed it |
| `author` | Who originally posted it |
| `channel` | Discord channel name |

```json
{
  "theEvent": "imagePush",
  "theTarget": "",
  "theValue": {
    "url": "https://example.com/image.png",
    "pusher": "Chenzo",
    "author": "SomeUser",
    "channel": "general"
  },
  "uid": "teaxc64in"
}
```

## Other Murray endpoints used by this repo

These aren't overlay commands.

- **`POST /murray-talks`** with `{ "text": "..." }`: Murray text-to-speech, called from `/sounder`.
- **`/overlay/annoucestream`** (spelled that way): the "we're live" Discord announcement. Called server-side by `app/api/postToDiscord/route.js`.
