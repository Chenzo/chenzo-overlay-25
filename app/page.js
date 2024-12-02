import Overlay from '@/components/Overlay';

import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <Overlay />
    </div>
  );
}
