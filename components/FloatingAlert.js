/* eslint-disable prettier/prettier */
import styles from './FloatingAlert.module.scss';

export default function FloatingAlert() {
    return (
        <article className={styles.floatingAlert}>
            <div className={styles.border}>
                <img src="https://chenzorama.com/overlay/images/ribbons.png" />

            </div>
            <div className={`${styles.videoHolder} ${styles.torn_3} ${styles.ds}`}>
                <video autoPlay muted loop className={styles.video}>
                    <source src='https://chenzorama.com/overlay/video/hoggle_peeing.mp4' type='video/mp4' />
                </video>
            </div>
        </article>
    );
}

