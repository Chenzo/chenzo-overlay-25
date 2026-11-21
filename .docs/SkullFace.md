# Skull Face

A floating placeholder skull that replaces the live camera in the overlay. The camera is still used, hidden, to track facial expressions with MediaPipe Face Landmarker.

## Current state

- **Approach:** 2D SVG skull animated with CSS custom properties (no 3D library).
- **Dependency:** `@mediapipe/tasks-vision@1.2.3`.
- **Loaded from external URLs (fine for testing):**
  - WASM runtime: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm`
  - Model: Google's hosted `face_landmarker.task` (float16)
  - These could later be moved to `NEXT_PUBLIC_BUCKET_URL`.
- **Turned on with the push API:** send `overlayToggle` with `theTarget: "skullvatar"`. Send `""` to go back to the live camera. It's off by default and works in any theme. See `.docs/push-api.md`.
- **Usage:** pick a camera by clicking the frame, same as before. The camera has to be running for the skull to track.
- **Tracking only runs while the skull is showing.** MediaPipe loads when `skullvatar` turns on and shuts down when it turns off.
- `afk`, `whiskey` and `family` are the same toggle, so sending one replaces the skull. Sending `""` afterward returns to the live camera, not the skull.

### What the skull does

| Face input (MediaPipe blendshape) | Skull reaction | Tuning (in `SkullAvatar.module.scss`) |
| --- | --- | --- |
| `jawOpen` | Jaw drops | `calc(var(--jaw) * 20px)` (was 14) |
| `eyeBlinkLeft` / `eyeBlinkRight` | Eye glows squash | `* 0.9` in `.glowViewerLeft` / `.glowViewerRight` |
| `browInnerUp` | Brow ridge lifts | `calc(var(--brow) * -8px)` (was -5) |

- The viewer-right socket follows the subject's left eye, matching the unmirrored camera view. The whole skull is flipped when the theme's `cameraMirror` is true.
- A constant idle bob (CSS `float` keyframes) keeps it looking like it's floating.
- Smoothing: `SMOOTHING = 0.5` in `useFaceTracking.js`. Lower is smoother but laggier.
- When no face is found, all values ease back to neutral (jaw closed, eyes open).

### Head tracking: turned off

The hook still calculates head pose (yaw, pitch, roll, x, y), but the skull no longer uses it. To bring it back, `SkullAvatar.js` needs to set `--yaw`, `--pitch`, `--roll`, `--x` and `--y` again, and `.skull` needs its transform back:

```scss
transform: translate(calc(var(--x) * 4px), calc(var(--y) * 4px)) rotateX(calc(var(--pitch) * 1deg))
  rotateY(calc(var(--yaw) * 1deg)) rotateZ(calc(var(--roll) * 1deg));
```

In JS, pitch, roll and y are negated, because tracking space is y-up and CSS is y-down. The signs were never verified on camera.

### Temporary debug panel

`TrackingDebug` renders under the frame and shows `face yes/NO` plus every tracked value each frame. To remove it, delete the `{showSkull && <TrackingDebug ... />}` line and its import in `CameraHolder.js`.

## Files

- `components/useFaceTracking.js`: new. Loads MediaPipe and runs detection on the hidden video with requestAnimationFrame, skipping frames that haven't changed. Writes smoothed values plus `faceFound` to a ref, not state, so React doesn't re-render every frame.
- `components/SkullAvatar.js` and `SkullAvatar.module.scss`: new. The SVG skull. A requestAnimationFrame loop copies tracking values into CSS variables.
- `components/TrackingDebug.js` and `TrackingDebug.module.scss`: new, temporary. The numbers panel.
- `components/CameraHolder.js`: shows the skull when `afkType === 'skullvatar'`. It renders the skull and keeps the live video playing but invisible (the `.trackingSource` class rather than `display: none`), since it's the tracking source.
- `components/CameraHolder.module.scss`: adds the `.trackingSource` class.
- `components/Overlay.js`: the `overlayToggle` comments list `'skullvatar'` as a value.

## Known issues

- **Jaw bounces shut while the mouth is open.** Likely causes:
  1. Any frame where the face is lost resets the targets to neutral, so the jaw snaps closed.
  2. The `jawOpen` score is noisy and often tops out around 0.4–0.7 rather than 1.
  3. `SMOOTHING = 0.5` reacts quickly to single bad frames.
- **Tracking drops when the head turns to profile.** This is a limit of MediaPipe's face model, which usually loses the face past about 60–70° of yaw. Use the debug panel's `yaw` and `face` lines to find the exact cutoff.
- **RaiderToken shows through.** Both theme frames have a see-through background, so in the Arc theme the RaiderToken behind the frame is visible behind the skull.
- **GPU load.** Tracking runs on the GPU alongside the game. Watch for stutter in Arc Raiders.

## Open questions and next options

Waiting on a decision. None of these are implemented yet.

1. **Hold the last expression when the face drops** (recommended first). Keep the jaw, eyes and brows as they were, for a short grace period or until the face returns, instead of easing to neutral. Fixes the bounce and the snap when turning to profile.
2. **Lower the MediaPipe confidence thresholds.** Change `minFaceDetectionConfidence`, `minFacePresenceConfidence` and `minTrackingConfidence` from 0.5 to about 0.3. It keeps tracking a little further into a head turn, but false detections become more likely.
3. **Close slower than it opens.** Use asymmetric smoothing so the jaw opens quickly but brief dips barely close it.
4. **Hysteresis or deadzone on `jawOpen`.** For example, "open" above about 0.15 and "closed" only once the score drops below a lower threshold.
5. **Rescale the `jawOpen` range.** Map the realistic range (about 0.05–0.5) to 0–1 so a normally open mouth reaches full open.
6. **Camera placement.** Angle the camera toward the side you usually turn to.

Later: replace the placeholder skull art, possibly move to 3D (Three.js and a GLTF skull), and host the MediaPipe files in the bucket.
