'use client';

import { useEffect, useRef } from 'react';
import styles from './SkullAvatar.module.scss';

// Placeholder floating skull driven by useFaceTracking's values. Values are written straight to
// CSS custom properties each animation frame (see SkullAvatar.module.scss for how they're used).
export default function SkullAvatar({ trackingRef, mirror = false }) {
  const skullRef = useRef(null);

  useEffect(() => {
    let rafId;

    const tick = () => {
      const skull = skullRef.current;
      const tracking = trackingRef.current;

      if (skull && tracking) {
        skull.style.setProperty('--jaw', tracking.jawOpen);
        // The viewer-right socket is the subject's left eye (unmirrored camera view).
        skull.style.setProperty('--blink-viewer-left', tracking.blinkRight);
        skull.style.setProperty('--blink-viewer-right', tracking.blinkLeft);
        skull.style.setProperty('--brow', tracking.browUp);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [trackingRef]);

  return (
    <div className={`${styles.stage} ${mirror ? styles.mirrored : ''}`}>
      <div className={styles.float}>
        <svg ref={skullRef} className={styles.skull} viewBox='0 0 100 112' aria-hidden='true'>
          <path
            className={styles.bone}
            d='M50 4 C24 4 10 22 10 46 C10 60 16 68 22 72 L24 84 L76 84 L78 72 C84 68 90 60 90 46 C90 22 76 4 50 4 Z'
          />
          <path className={styles.brow} d='M20 40 Q34 32 48 40 M52 40 Q66 32 80 40' />
          <ellipse className={styles.socket} cx='34' cy='50' rx='11' ry='10' />
          <ellipse className={styles.socket} cx='66' cy='50' rx='11' ry='10' />
          <circle className={`${styles.glow} ${styles.glowViewerLeft}`} cx='34' cy='51' r='4' />
          <circle className={`${styles.glow} ${styles.glowViewerRight}`} cx='66' cy='51' r='4' />
          <path className={styles.socket} d='M50 60 L45 71 L55 71 Z' />
          <path className={styles.teeth} d='M30 78 H70 M36 78 V84 M43 78 V84 M50 78 V84 M57 78 V84 M64 78 V84' />
          <g className={styles.jaw}>
            <path className={styles.bone} d='M24 84 L76 84 L74 96 C68 108 32 108 26 96 Z' />
            <path className={styles.teeth} d='M30 90 H70 M36 84 V90 M43 84 V90 M50 84 V90 M57 84 V90 M64 84 V90' />
          </g>
        </svg>
      </div>
    </div>
  );
}
