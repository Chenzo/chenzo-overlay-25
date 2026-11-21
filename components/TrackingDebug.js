'use client';

import { useEffect, useRef } from 'react';
import styles from './TrackingDebug.module.scss';

// Temporary readout of useFaceTracking's current values, for tuning the skull.
export default function TrackingDebug({ trackingRef }) {
  const textRef = useRef(null);

  useEffect(() => {
    let rafId;

    const tick = () => {
      const text = textRef.current;
      const tracking = trackingRef.current;

      if (text && tracking) {
        const lines = [`face        ${tracking.faceFound ? 'yes' : 'NO'}`];
        Object.keys(tracking).forEach((key) => {
          if (key === 'faceFound') return;
          lines.push(`${key.padEnd(11)} ${tracking[key].toFixed(2)}`);
        });
        text.textContent = lines.join('\n');
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [trackingRef]);

  return <pre ref={textRef} className={styles.debug} />;
}
