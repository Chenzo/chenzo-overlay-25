import SotTheme from './SotTheme';
import ArcTheme from './ArcTheme';
import sotCameraFrame from './SotCameraFrame.module.scss';
import arcCameraFrame from './ArcCameraFrame.module.scss';
import ArcWonkyFrame from './ArcWonkyFrame';
import RaiderToken from '../RaiderToken';

// Registry of everything the base overlay needs to know about a theme, keyed by the same
// theme name Murray sends in its setTheme event. Add new shared-but-themed pieces here
// (rather than growing ad-hoc `activeTheme === 'X'` checks in Overlay.js) as they come up.
export const themes = {
  SoT: {
    Component: SotTheme,
    cameraFrameClassName: sotCameraFrame.frame,
    cameraMirror: true,
    cameraPositionSide: 'right',
  },
  Arc: {
    Component: ArcTheme,
    cameraFrameClassName: arcCameraFrame.frame,
    // Wraps the camera frame in the randomly-shaped, periodically-reshuffling gold border/mask.
    cameraFrameWrapper: ArcWonkyFrame,
    // Rendered behind the camera frame (see CameraHolder's frameStack/behindContent), so it's
    // hidden by the opaque video until it animates up past the frame's edges.
    cameraBehindContent: RaiderToken,
    cameraMirror: false,
    cameraPositionSide: 'left',
  },
};
