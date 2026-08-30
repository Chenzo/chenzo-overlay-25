import WonkyFrame from '../effects/WonkyFrame';

// Arc's shared visual identity for the wonky effect: gold border, reshuffling every 20s.
// Used by anything in the Arc theme that wants the same wonky mask/border treatment
// (the camera frame, the logo, and whatever comes next).
export default function ArcWonkyFrame({ children, className }) {
  return (
    <WonkyFrame intervalMs={20000} borderColor='#d4af37' borderWidth={5} className={className}>
      {children}
    </WonkyFrame>
  );
}
