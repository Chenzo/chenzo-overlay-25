/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import styles from './FloatingAlert.module.scss';

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;


export default function FloatingAlert({ overlayToggle }) {

    const [showAFK, setShowAFK] = useState(false);
    const [videoSRC, setVideoSRC] = useState(null);

    useEffect(() => {
        //console.log('overlayToggle:', overlayToggle);

        setShowAFK(overlayToggle !== "" ? true : false);

        if (overlayToggle === "afk") {
            setVideoSRC(`${BUCKET_URL}/video/hoggle_peeing-small.mp4`);
        } else if (overlayToggle === "whiskey") {
            setVideoSRC(`${BUCKET_URL}/video/whiskey_1.mp4`);
        } else if (overlayToggle === "family") {
            setVideoSRC(`${BUCKET_URL}/video/family.mp4`);
        }

    }, [overlayToggle]);

    if (showAFK) {
        return (
            <article className={styles.floatingAlert}>
                <div className={styles.border}>
                    <img src={`${BUCKET_URL}/images/ribbons-small.png`} alt="" />
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

