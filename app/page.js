import Overlay from '@/components/Overlay';
import OverlayLayout from '@/components/OverlayLayout';

import styles from './page.module.css';

export default function Home() {
  return (
    <OverlayLayout>
      <div className={styles.page}>
        <Overlay />
      </div>
    </OverlayLayout>
  );
}
