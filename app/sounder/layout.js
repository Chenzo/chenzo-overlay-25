'use client';

import '../globals.scss';
import styles from './layout.module.scss';

export default function SounderLayout({ children }) {
  return <div className={styles.standalone}>{children}</div>;
}
