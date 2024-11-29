/* eslint-disable jsx-a11y/alt-text */
'use client';

import { useRef } from 'react';
import styles from './Header.module.scss';

export default function Header({}) {
  const skull = useRef();

  const eventSource = new EventSource('http://localhost:3000/overlay-events');

  eventSource.onmessage = (event) => {
    console.log(event.data);
    /* const data = JSON.parse(event.data);
    const messagesDiv = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.textContent = `New message: ${data.message}`;
    messagesDiv.appendChild(newMessage); */
  };

  eventSource.onerror = () => {
    console.error('Connection lost. Reconnecting...');
  };

  return (
    <header className={styles.chenzHeader}>
      <div className={`${styles.innerBar} ${styles.top_clip} windlass`}>
        <span className='dropshadow_effect_11x tshadow'>
          The Gentlemen of Fortune and the Adventures of The Holy Bartender
        </span>
        <video width='1200' autoPlay={true} muted={true} loop={true}>
          <source src='https://chenzorama.com/overlay/video/waterup.webm' type='video/webm' />
        </video>
      </div>
      <div className={styles.alignment}>
        <img src='images/ribbon_evil.png' className={styles.evil} />
        <img src='images/ribbon_good.png' className={styles.good} />
        <img id='skullmeter' src='images/skull_meter.png' ref={skull} className={styles.skullmeter} />
      </div>
    </header>
  );
}
