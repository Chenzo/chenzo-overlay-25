'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './RaiderToken.module.scss';

export default function RaiderToken({ showToken, onTokenHidden, className }) {
  const [isVisible, setIsVisible] = useState(false);
  const [randomX, setRandomX] = useState(50);
  const onTokenHiddenRef = useRef(onTokenHidden);

  useEffect(() => {
    onTokenHiddenRef.current = onTokenHidden;
  }, [onTokenHidden]);

  useEffect(() => {
    if (showToken) {
      // Random horizontal spot within the frame width, re-rolled on every redemption.
      setRandomX(Math.random() * 70 + 15); // 15% to 85%
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        onTokenHiddenRef.current();
      }, 3000);

      return () => clearTimeout(timer);
    }
    // onTokenHidden is read via a ref so an Overlay re-render (which gives it a new identity
    // every time) doesn't re-trigger this effect and reroll/reset a token that's mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToken]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.raiderTokenWrapper} ${className || ''}`}>
      <img
        src='/images/raider-token.webp'
        alt='Raider Token'
        className={styles.raiderToken}
        style={{ left: `${randomX}%` }}
      />
    </div>
  );
}
