'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FloatingAlert from '@/components/FloatingAlert';
import styles from './page.module.scss';

export default function CameraCoverContent() {
  const searchParams = useSearchParams();
  const [overlayType, setOverlayType] = useState('');

  useEffect(() => {
    setOverlayType(searchParams.get('overlayType') || '');
  }, [searchParams]);

  return (
    <div className={styles.CameraCover}>
      <FloatingAlert overlayToggle={overlayType} />
    </div>
  );
}
