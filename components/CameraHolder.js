'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CameraHolder.module.scss';

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

export default function CameraHolder({ afkType }) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(true);
  const [videoSRC, setVideoSRC] = useState(afkType);

  useEffect(() => {
    if (afkType === 'afk') {
      setVideoSRC(`${BUCKET_URL}/video/hoggle_peeing-small.mp4`);
    } else if (afkType === 'whiskey') {
      setVideoSRC(`${BUCKET_URL}/video/whiskey_1.mp4`);
    } else if (afkType === 'family') {
      setVideoSRC(`${BUCKET_URL}/video/family.mp4`);
    }
  }, [afkType]);

  //const [afkType, setAfkType] = useState(''); // Possible values: '', 'afk', 'whiskey', 'family'

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Unable to access camera', err);
        setError('Unable to access camera. Check permissions and that another app is not using it.');
      } finally {
        setIsStarting(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className={styles.cameraHolder}>
      <div className={styles.frame}>
        {afkType && (
          <video autoPlay muted loop className={styles.video}>
            <source src={videoSRC} type='video/mp4' />
          </video>
        )}
        {!afkType && <video ref={videoRef} muted playsInline autoPlay className={styles.video} />}
      </div>
      {isStarting && !error && <span className={styles.status}>Starting camera…</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
