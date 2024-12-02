'use client';

import { useEffect, useState } from 'react';
import styles from './Overlay.module.scss';
import Header from './Header';
import AudioObject from './AudioObject';

export default function Overlay({}) {
  const [alignment, setAlignment] = useState(50);
  const [currentAudio, setCurrentAudio] = useState('');

  const listenToServer = () => {
    const eventSource = new EventSource('http://localhost:3000/overlay-events');

    eventSource.onmessage = (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);

      console.log(data?.theEvent == 'playaudio');

      if (data?.theEvent == 'setAlignment') {
        setAlignment(parseInt(data.theTarget));
      } else if (data?.theEvent == 'playaudio') {
        console.log(`play audio: ${data.theTarget}`);
        setCurrentAudio(data.theTarget);
      }
    };

    eventSource.onerror = () => {
      console.error('Connection lost. Reconnecting...');
    };
  };

  useEffect(() => {
    listenToServer();
  }, []);

  return (
    <section className={styles.overlay}>
      <Header alignment={alignment} />
      <AudioObject currentAudio={currentAudio} setCurrentAudio={setCurrentAudio} />
    </section>
  );
}
