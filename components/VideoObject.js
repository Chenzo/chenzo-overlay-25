import { useState, useEffect, useRef } from 'react';
import ArcWonkyFrame from './themes/ArcWonkyFrame';
import styles from './VideoObject.module.scss';

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;
// Keep in sync with the .fading transition in VideoObject.module.scss.
const FADE_OUT_MS = 600;

// Triggered through the same playaudio event as sounds; Overlay routes any id listed here to video.
export const videoClips = [
  { id: 'circlek', src: 'video/Strange-things-are-afoot-at-the-Circle-K.mp4', volume: 1 },
  { id: 'trap-video', src: 'video/It-s-A-Trap.mp4', volume: 0.5 },
  { id: 'mostly', src: 'video/mostly.mp4', volume: 1 },
];

export default function VideoObject({ currentVideo, setCurrentVideo }) {
  const videoRefs = useRef({});
  const [activeId, setActiveId] = useState('');
  const [isFading, setIsFading] = useState(false);

  const fadeOut = (videoId) => {
    setIsFading(true);
    setTimeout(() => {
      const video = videoRefs.current[videoId];
      if (video) {
        video.pause();
        video.currentTime = 0;
      }

      setActiveId('');
      setIsFading(false);
      setCurrentVideo('');
    }, FADE_OUT_MS);
  };

  const findAndPlay = (videoId) => {
    const clip = videoClips.find((videoClip) => videoClip.id === videoId);
    const video = videoRefs.current[videoId];

    if (!clip || !video) {
      setCurrentVideo('');
      return;
    }

    video.volume = clip.volume;
    video.currentTime = 0;
    setActiveId(videoId);
    video.play().catch((error) => {
      console.error(`Error playing video ${videoId}:`, error);
      setActiveId('');
      setCurrentVideo('');
    });
  };

  useEffect(() => {
    if (currentVideo === 'stop') {
      if (activeId && !isFading) {
        fadeOut(activeId);
      } else if (!activeId) {
        setCurrentVideo('');
      }
    } else if (!activeId && currentVideo !== '') {
      findAndPlay(currentVideo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideo]);

  return (
    <aside className={`${styles.videoObject} ${activeId ? styles.active : ''} ${isFading ? styles.fading : ''}`}>
      <ArcWonkyFrame>
        {videoClips.map((clip) => (
          <video
            key={clip.id}
            ref={(el) => {
              videoRefs.current[clip.id] = el;
            }}
            src={`${BUCKET_URL}/${clip.src}`}
            preload='auto'
            playsInline
            onEnded={() => fadeOut(clip.id)}
            className={`${styles.video} ${clip.id === activeId ? styles.activeVideo : ''}`}
          />
        ))}
      </ArcWonkyFrame>
    </aside>
  );
}
