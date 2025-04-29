/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import styles from './FloatingAlert.module.scss';


export default function FloatingAlert({overlayToggle}) {

    const [showAFK, setShowAFK] = useState(false);

    useEffect(() => {
        console.log('overlayToggle:', overlayToggle);

        if (overlayToggle === "afk") {
            setShowAFK(true);
        }  else {
            setShowAFK(false);
        }
    }, [overlayToggle]);

    if (showAFK) {
        return (
            <article className={styles.floatingAlert}>
                <div className={styles.border}>
                    <img src="https://chenzorama.com/overlay/images/ribbons.png" alt="" />
    
                </div>
                <div className={`${styles.videoHolder} ${styles.torn_3} ${styles.ds}`}>
                    <video autoPlay muted loop className={styles.video}>
                        <source src='https://chenzorama.com/overlay/video/hoggle_peeing.mp4' type='video/mp4' />
                    </video>
                </div>
            </article>
        );
    }

    return null; // Don't render anything if showAFK is true

    
}

