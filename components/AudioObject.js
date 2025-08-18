import { useState, useEffect } from 'react';
import styles from './AudioObject.module.scss';

export default function AudioObject({ currentAudio, setCurrentAudio }) {
  let theAudio;
  const [isPlaying, setIsPlaying] = useState(false);

  const findAndPlay = (audioName) => {
    theAudio = new Audio();

    if (audioName == 'babyshark') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/babyshark.mp3';
      theAudio.volume = 1;
    } else if (audioName == 'digs') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/dogs.mp3';
      theAudio.volume = 1;
    } else if (audioName == '3') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/umm-3.mp3';
      theAudio.volume = 1;
    } else if (audioName == 'sharkbait') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/sharkbait.mp3';
      theAudio.volume = 1;
    } else if (audioName == 'carl') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/carl.mp3';
      theAudio.volume = 0.7;
    } else if (audioName == 'wind') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/wind.mp3';
      theAudio.volume = 0.5;
    } else if (audioName == 'chunky') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/chunky.mp3';
      theAudio.volume = 0.7;
    } else if (audioName == 'fire') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/fire.mp3';
      theAudio.volume = 0.3;
    } else if (audioName == 'sosalty') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/sosalty.mp3';
      theAudio.volume = 0.2;
    } else if (audioName == 'forgiveness') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/forgiveness.mp3';
      theAudio.volume = 0.7;
    } else if (audioName == 'scooty') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/booty_scooty.mp3';
      theAudio.volume = 0.7;
    } else if (audioName == 'warrenty') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/warrenty.mp3';
      theAudio.volume = 1;
    } else if (audioName == 'blastem') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/blast-them.mp3';
      theAudio.volume = 1;
    } else if (audioName == 'shutter') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/shutter_sound.mp3';
      theAudio.volume = 1;
    } else if (audioName == 'rocklobster') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/rocklobster.mp3';
      theAudio.volume = 0.6;
    } else if (audioName == 'dora') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/dora-sandwich.mp3';
      theAudio.volume = 0.6;
    } else if (audioName == 'sitcom') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/laughs/sitcom-laughing.mp3';
      theAudio.volume = 0.6;
    } else if (audioName == 'biglaugh') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/laughs/mixkit-big-crowd-laughing-460.mp3';
      theAudio.volume = 0.6;
    } else if (audioName == 'mediumlaughclap') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/laughs/mixkit-medium-size-group-applause-and-laugh-516.mp3';
      theAudio.volume = 0.8;
    } else if (audioName == 'lightlaughclap') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/laughs/mixkit-light-applause-with-laughter-audience-512.mp3';
      theAudio.volume = 0.8;
    } else if (audioName == 'wood') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/wood_intro.mp3';
      theAudio.volume = 0.6;
    } else if (audioName == 'sailingaway') {
      theAudio.src = 'https://chenzorama.com/overlay/audio/sailingaway.mp3';
      theAudio.volume = 0.3;
    }

    theAudio.addEventListener('ended', function () {
      setCurrentAudio('');
      setIsPlaying(false);
    });
    setIsPlaying(true);
    theAudio.play();
  };

  useEffect(() => {
    if (!isPlaying && currentAudio != '') {
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
