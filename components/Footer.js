'use client';

import ChatRelay from './ChatRelay';
import styles from './Footer.module.scss';

export default function Footer({}) {
  return (
    <footer className={styles.chenzo_footer}>
      <ChatRelay />
    </footer>
  );
}
