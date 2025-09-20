import { useState, useEffect, useRef } from 'react';
import styles from './AudioObject.module.scss';

export default function AudioObject({ currentAudio, setCurrentAudio }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsPlaying(false);
    setCurrentAudio('');
  };

  const findAndPlay = (audioName) => {
    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    audioRef.current = new Audio();

    if (audioName == 'babyshark') {
      audioRef.current.src = `${BUCKET_URL}/audio/babyshark.mp3`;
      audioRef.current.volume = 1;
    } else if (audioName == 'digs') {
      audioRef.current.src = `${BUCKET_URL}/audio/dogs.mp3`;
      audioRef.current.volume = 1;
    } else if (audioName == '3') {
      audioRef.current.src = `${BUCKET_URL}/audio/umm-3.mp3`;
      audioRef.current.volume = 1;
    } else if (audioName == 'sharkbait') {
      audioRef.current.src = `${BUCKET_URL}/audio/sharkbait.mp3`;
      audioRef.current.volume = 1;
    } else if (audioName == 'carl') {
      audioRef.current.src = `${BUCKET_URL}/audio/carl.mp3`;
      audioRef.current.volume = 0.7;
    } else if (audioName == 'wind') {
      audioRef.current.src = `${BUCKET_URL}/audio/wind.mp3`;
      audioRef.current.volume = 0.5;
    } else if (audioName == 'chunky') {
      audioRef.current.src = `${BUCKET_URL}/audio/chunky.mp3`;
      audioRef.current.volume = 0.7;
    } else if (audioName == 'fire') {
      audioRef.current.src = `${BUCKET_URL}/audio/fire.mp3`;
      audioRef.current.volume = 0.3;
    } else if (audioName == 'sosalty') {
      audioRef.current.src = `${BUCKET_URL}/audio/sosalty.mp3`;
      audioRef.current.volume = 0.2;
    } else if (audioName == 'forgiveness') {
      audioRef.current.src = `${BUCKET_URL}/audio/forgiveness.mp3`;
      audioRef.current.volume = 0.7;
    } else if (audioName == 'scooty') {
      audioRef.current.src = `${BUCKET_URL}/audio/booty_scooty.mp3`;
      audioRef.current.volume = 0.7;
    } else if (audioName == 'warrenty') {
      audioRef.current.src = `${BUCKET_URL}/audio/warrenty.mp3`;
      audioRef.current.volume = 1;
    } else if (audioName == 'blastem') {
      audioRef.current.src = `${BUCKET_URL}/audio/blast-them.mp3`;
      audioRef.current.volume = 1;
    } else if (audioName == 'shutter') {
      audioRef.current.src = `${BUCKET_URL}/audio/shutter_sound.mp3`;
      audioRef.current.volume = 1;
    } else if (audioName == 'rocklobster') {
      audioRef.current.src = `${BUCKET_URL}/audio/rocklobster.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'dora') {
      audioRef.current.src = `${BUCKET_URL}/audio/dora-sandwich.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'sitcom') {
      audioRef.current.src = `${BUCKET_URL}/audio/laughs/sitcom-laughing.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'biglaugh') {
      audioRef.current.src = `${BUCKET_URL}/audio/laughs/mixkit-big-crowd-laughing-460.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'mediumlaughclap') {
      audioRef.current.src = `${BUCKET_URL}/audio/laughs/mixkit-medium-size-group-applause-and-laugh-516.mp3`;
      audioRef.current.volume = 0.8;
    } else if (audioName == 'lightlaughclap') {
      audioRef.current.src = `${BUCKET_URL}/audio/laughs/mixkit-light-applause-with-laughter-audience-512.mp3`;
      audioRef.current.volume = 0.8;
    } else if (audioName == 'wood') {
      audioRef.current.src = `${BUCKET_URL}/audio/wood_intro.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'sailingaway') {
      audioRef.current.src = `${BUCKET_URL}/audio/sailingaway.mp3`;
      audioRef.current.volume = 0.3;
    } else if (audioName == 'peoples_song') {
      audioRef.current.src = `${BUCKET_URL}/audio/peoples_song.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'peoples_song_short') {
      audioRef.current.src = `${BUCKET_URL}/audio/peoples_song_short.mp3`;
      audioRef.current.volume = 0.4;
    } else if (audioName == 'hero') {
      audioRef.current.src = `${BUCKET_URL}/audio/greatest_hero.mp3`;
      audioRef.current.volume = 0.7;
    } else if (audioName == 'chenzo') {
      audioRef.current.src = `${BUCKET_URL}/audio/chenzo-shanty.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'chenzo_short') {
      audioRef.current.src = `${BUCKET_URL}/audio/chenz-short.mp3`;
      audioRef.current.volume = 0.4;
    } else if (audioName == 'bbetty1') {
      audioRef.current.src = `${BUCKET_URL}/audio/Black_Betty_Intro.mp3`;
      audioRef.current.volume = 0.7;
    } else if (audioName == 'bbetty2') {
      audioRef.current.src = `${BUCKET_URL}/audio/Black-Betty-Rambalam.mp3`;
      audioRef.current.volume = 0.7;
    } else if (audioName == 'binobo_not_evil') {
      audioRef.current.src = `${BUCKET_URL}/audio/Binobo-hes_not_really_evil.mp3`;
      audioRef.current.volume = 0.6;
    } else if (audioName == 'scratch') {
      audioRef.current.src = `${BUCKET_URL}/audio/scratch.mp3`;
      audioRef.current.volume = 0.7;
    }

    audioRef.current.addEventListener('ended', function () {
      setCurrentAudio('');
      setIsPlaying(false);
    });
    setIsPlaying(true);
    audioRef.current.play();
  };

  useEffect(() => {
    if (currentAudio === 'stop') {
      stopAudio();
    } else if (!isPlaying && currentAudio !== '') {
      findAndPlay(currentAudio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudio]);

  return (
    <aside className={`${styles.trumpet} ${currentAudio != '' ? styles.active : ''}`}>
      <img src='images/Speaking_Trumpet.webp' alt='' />
    </aside>
  );
}
