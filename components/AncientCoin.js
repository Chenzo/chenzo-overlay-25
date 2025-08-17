'use client';
import { useEffect, useState } from 'react';
import styles from './AncientCoin.module.scss';

export default function AncientCoin({ showCoin, onCoinHidden }) {
  const [isVisible, setIsVisible] = useState(false);
  const [randomPosition, setRandomPosition] = useState(0);

  useEffect(() => {
    if (showCoin) {
      // Generate random position between 20% and 80% of screen width
      const newPosition = Math.random() * 60 + 20; // 20% to 80%
      setRandomPosition(newPosition);
      setIsVisible(true);

      // Hide the coin after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onCoinHidden();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showCoin, onCoinHidden]);

  if (!isVisible) return null;

  return (
    <div className={styles.ancientCoinContainer} style={{ left: `${randomPosition}%` }}>
      <img src='/images/ancient_coin.webp' alt='Ancient Coin' className={styles.ancientCoin} />
    </div>
  );
}
