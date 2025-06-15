/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import styles from './FloatingAlert.module.scss';


export default function FloatingAlert({overlayToggle}) {

    const [showAFK, setShowAFK] = useState(false);
    const [videoSRC, setVideoSRC] = useState('');

    useEffect(() => {
        //console.log('overlayToggle:', overlayToggle);

        setShowAFK(overlayToggle !== "" ? true : false);

        if (overlayToggle === "afk") {
            setVideoSRC('https://chenzorama.com/overlay/video/hoggle_peeing-small.mp4');
        } else if (overlayToggle === "whiskey") {
            setVideoSRC('https://chenzorama.com/overlay/video/whiskey_1.mp4');
        } else if (overlayToggle === "family") {
            setVideoSRC('https://chenzorama.com/overlay/video/family.mp4');
        }

    }, [overlayToggle]);

    if (showAFK) {
        return (
            <article className={styles.floatingAlert}>
                <div className={styles.border}>
                    <img src="https://chenzorama.com/overlay/images/ribbons-small.png" alt="" />
    
                </div>
                <div className={`${styles.videoHolder} ${styles.torn_3} ${styles.ds}`} key={videoSRC}>
                    <video autoPlay muted loop className={styles.video}>
                        <source src={videoSRC} type='video/mp4' />
                    </video>
                </div>
            </article>
        );
    }

    return null; // Don't render anything if showAFK is true

    
}

