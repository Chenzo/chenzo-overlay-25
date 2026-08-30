'use client';

import { useEffect, useState } from 'react';
import { generateWonkyValues } from './wonkyValues';
import styles from './WonkyFrame.module.scss';

const DEFAULT_INTERVAL_MS = 20000;

const toClipPath = (values) =>
  `polygon(${values.tlX}% ${values.tlY}%, ${values.trX}% ${values.trY}%, ${values.brX}% ${values.brY}%, ${values.blX}% ${values.blY}%)`;

const toPolygonPoints = (values) =>
  `${values.tlX},${values.tlY} ${values.trX},${values.trY} ${values.brX},${values.brY} ${values.blX},${values.blY}`;

// Clips children into a randomly-shaped "wonky" mask, with a stroked border drawn on top that
// rolls its OWN independent wonky shape (on purpose — the border isn't meant to line up with
// the mask edge underneath it). Ported from wonky-background.ts. Both shapes re-roll on mount
// and again every `intervalMs`; pass `intervalMs={0}` to roll once and leave them alone.
export default function WonkyFrame({
  children,
  intervalMs = DEFAULT_INTERVAL_MS,
  className,
  borderColor = 'rgba(255, 255, 255, 0.65)',
  borderWidth = 5,
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
        <polygon points={toPolygonPoints(borderValues)} style={{ stroke: borderColor, strokeWidth: borderWidth }} />
      </svg>
    </div>
  );
}
