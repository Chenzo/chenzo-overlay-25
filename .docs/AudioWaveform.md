# Audio Waveform

A mirrored waveform bar showing the live mic level. New bars appear in the center and scroll out to both the left and right edges. It works in any theme and is separate from the camera section.

## Turning it on and off

Use the push API (see `.docs/push-api.md`):

```
POST http://localhost:3000/crewBoard/pushSound
```

```json
{ "theEvent": "showWaveform", "theTarget": "true", "theValue": "", "uid": "teaxc64in" }
```

- Send `"false"` to hide it. Anything other than `"true"` hides it.
- It's off by default.
- The mic only runs while the waveform is showing. Hiding it stops the mic and the drawing loop.

## Picking a mic

- The first time it's shown, the bar says "Click to choose a mic". Click it to list audio inputs, then pick one.
- If the browser hasn't granted mic permission yet, it asks for it once so the device names show.
- The chosen mic is kept while the waveform is toggled off and back on, but it resets when the page reloads.
- To switch mics, click the bar again.

## Layout

From `components/AudioWaveform.module.scss`:

- Centered at the bottom of the screen, 20px from the bottom.
- 60% of the screen width, 100px tall. The loudest bars use the full height.
- `z-index: 6`, the same as the camera.

## How it looks

- **Bars:** each bar is the mic volume (RMS) at one animation frame. Bars grow up and down from the middle line.
- **Mirroring:** the newest bar is at the center, and older bars move one step outward each frame on both sides. Each side holds half the width's worth of bars, about 2 seconds of history at 60fps.
- **Brightness:**
  - Full white at the center, easing to 40% by 10% of the way out to each edge.
  - Steady at 40% through the middle stretch.
  - Fades to transparent over the last 20% before each edge.
- **Glow:** white glow on the center bars. It's full at the center and gone by the 10% mark, following the white-to-40% fade.
- **Center line:** a 1px pure green (`#00ff00`) vertical line down the middle of the center bar, always the same height as that bar. It has no glow or shadow.
- **Backdrop image:** `public/CHENZO-transparent.png` sits behind the bars, centered on the waveform at 30% of its natural size (127px tall, about 261px wide, so it extends a little above and below the 100px bar), at 10% opacity.
- **Drop shadow:** every bar has a 1px solid black shadow offset 1px down and to the right, faded the same as its bar. Only the right and bottom strips that peek out are drawn, so the see-through bars don't turn gray over a full black copy.

## Tuning

All settings are at the top of `components/AudioWaveform.js`.

| Setting | Current value | What it does |
| --- | --- | --- |
| `BAR_WIDTH` | `3` | Bar width in px |
| `BAR_GAP` | `2` | Space between bars in px |
| `BAR_ALPHA` | `0.4` | Normal bar brightness outside the center |
| `CENTER_FADE_END` | `0.1` | How far out (0 = center, 1 = edge) the white center and glow fade to `BAR_ALPHA` |
| `EDGE_FADE_START` | `0.8` | Where the fade out to transparent begins |
| `GLOW_BLUR` | `12` | Center glow size in px |
| `CENTER_LINE_COLOR` | `#00ff00` | Color of the center line |
| `LEVEL_GAIN` | `4` | Multiplier on mic volume. Raise it for taller bars from the same volume |

Bar color is white, hardcoded in the `rgba(255, 255, 255, …)` fill.

## Files

- `components/AudioWaveform.js`: new. Mic picker, Web Audio `AnalyserNode` and canvas drawing loop. No new dependencies.
- `components/AudioWaveform.module.scss`: new. Layout, hint text and the mic list.
- `components/Overlay.js`: new `showWaveform` state, defaulting to `false`, set by the `showWaveform` push event. Renders `<AudioWaveform active={showWaveform} />` outside of any theme.

## Future ideas

- **More styles, switched by a command:** a possible `waveformStyle` event for:
  - `mirrored` (current)
  - `bars` (bouncing equalizer)
  - `line` (oscilloscope)
- **Color:** currently white with a green center line.
