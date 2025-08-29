'use client';

import styles from '../app/overlay-layout.module.scss';

export default function OverlayLayout({ children }) {
  return <div className={styles.overlayLayout}>{children}</div>;
}
