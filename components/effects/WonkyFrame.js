'use client';

import { useEffect, useRef, useState } from 'react';
import { generateWonkyValues } from './wonkyValues';
import styles from './WonkyFrame.module.scss';

const DEFAULT_INTERVAL_MS = 20000;
const BORDER_TRANSITION_MS = 900;

const toClipPath = (values) =>
  `polygon(${values.tlX}% ${values.tlY}%, ${values.trX}% ${values.trY}%, ${values.brX}% ${values.brY}%, ${values.blX}% ${values.blY}%)`;

const toPolygonPoints = (values) =>
  `${values.tlX},${values.tlY} ${values.trX},${values.trY} ${values.brX},${values.brY} ${values.blX},${values.blY}`;

// SVG polygon points aren't CSS-animatable, so a polygon's shape is tweened here by hand
// whenever its target `values` change, easing from whatever was last rendered.
function useTweenedPolygonPoints(values, durationMs) {
  const polygonRef = useRef(null);
  const renderedRef = useRef(null);

  useEffect(() => {
    if (!values) return;
    const polygon = polygonRef.current;
    if (!polygon) return;

    const from = renderedRef.current || values;
    const to = values;
    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const interpolated = {
        tlX: from.tlX + (to.tlX - from.tlX) * eased,
        tlY: from.tlY + (to.tlY - from.tlY) * eased,
        trX: from.trX + (to.trX - from.trX) * eased,
        trY: from.trY + (to.trY - from.trY) * eased,
        brX: from.brX + (to.brX - from.brX) * eased,
        brY: from.brY + (to.brY - from.brY) * eased,
        blX: from.blX + (to.blX - from.blX) * eased,
        blY: from.blY + (to.blY - from.blY) * eased,
      };
      polygon.setAttribute('points', toPolygonPoints(interpolated));
      renderedRef.current = interpolated;

      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [values, durationMs]);

  return polygonRef;
}

// Clips children into a randomly-shaped "wonky" mask, with a stroked border drawn on top that
// rolls its OWN independent wonky shape (on purpose — the border isn't meant to line up with
// the mask edge underneath it). Ported from wonky-background.ts. Both shapes re-roll on mount
// and again every `intervalMs`; pass `intervalMs={0}` to roll once and leave them alone.
// Optionally pass `maskOutlineColor` to also trace the mask's exact edge with its own stroke.
export default function WonkyFrame({
  children,
  intervalMs = DEFAULT_INTERVAL_MS,
  className,
  borderColor = 'rgba(255, 255, 255, 0.65)',
  borderWidth = 5,
  maskOutlineColor = null,
  maskOutlineWidth = 2,
}) {
  const [maskValues, setMaskValues] = useState(null);
  const [borderValues, setBorderValues] = useState(null);

  useEffect(() => {
    const reroll = () => {
      setMaskValues(generateWonkyValues());
      setBorderValues(generateWonkyValues());
    };
    reroll();

    if (!intervalMs) return;

    const interval = setInterval(reroll, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  const borderPolygonRef = useTweenedPolygonPoints(borderValues, BORDER_TRANSITION_MS);
  const maskOutlinePolygonRef = useTweenedPolygonPoints(maskOutlineColor ? maskValues : null, BORDER_TRANSITION_MS);

  if (!maskValues || !borderValues) {
    return (
      <div className={`${styles.wonkyWrapper} ${className || ''}`}>
        <div className={styles.wonkyMask}>{children}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.wonkyWrapper} ${className || ''}`}>
      <div className={styles.wonkyMask} style={{ clipPath: toClipPath(maskValues) }}>
        {children}
      </div>
      <svg
        className={styles.wonkyOutline}
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        aria-hidden='true'
        focusable='false'
      >
        {maskOutlineColor && (
          <polygon ref={maskOutlinePolygonRef} style={{ stroke: maskOutlineColor, strokeWidth: maskOutlineWidth }} />
        )}
        <polygon ref={borderPolygonRef} style={{ stroke: borderColor, strokeWidth: borderWidth }} />
      </svg>
    </div>
  );
}
