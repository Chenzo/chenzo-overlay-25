'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FloatingAlert from '@/components/FloatingAlert';
import styles from './page.module.scss';

export default function CameraCover() {
  const searchParams = useSearchParams();
  const [overlayType, setOverlayType] = useState('');

  //http://localhost:3001/camera-cover?overlayType=family

  useEffect(() => {
    setOverlayType(searchParams.get('overlayType') || '');
  }, [searchParams]);

  return (
    <div className={styles.CameraCover}>
      <FloatingAlert overlayToggle={overlayType} />
    </div>
  );
}
