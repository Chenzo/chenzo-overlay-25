'use client';

import { useState } from 'react';
import styles from './page.module.scss';
import AuthGuard from '../../components/AuthGuard';

export default function SoundBoard() {
  const [murrayText, setMurrayText] = useState('');
  const soundsArray = [
    {
      name: 'New',
      sounds: [
        { id: 'dora', name: "Dora's Sandwich" },
        { id: 'rocklobster', name: 'Rock Lobster' },
        { id: 'wood', name: 'Norwegian' },
        { id: 'sailingaway', name: 'Sailing Away' },
        { id: 'peoples_song', name: "People's Song" },
      ],
    },
    {
      name: 'classics',
      sounds: [
        { id: '3', name: '3' },
        { id: 'digs', name: 'Digs' },
        { id: 'babyshark', name: 'Baby Shark' },
        { id: 'sharkbait', name: 'Shark Bait' },
        { id: 'carl', name: 'Carl' },
        { id: 'forgiveness', name: 'Forgiveness' },
        { id: 'scooty', name: 'Booty Scooty' },
        { id: 'wind', name: 'Against The Wind' },
        { id: 'warrenty', name: 'Warrenty' },
        { id: 'blastem', name: 'Blast Them!' },
      ],
    },
    {
      name: 'Laugh Track',
      sounds: [
        { id: 'sitcom', name: 'SitCom Laughing' },
        { id: 'biglaugh', name: 'Big Crowd Laugh' },
        { id: 'lightlaughclap', name: 'Light Laugh Clap' },
        { id: 'mediumlaughclap', name: 'Medium Laugh Clap' },
      ],
    },
  ];

  const doThing = async (evt) => {
    const soundID = evt.target.value;
    console.log('Doing the thing!:', soundID);
    const murrayURL = process.env.NEXT_PUBLIC_MURRAY_SERVER;

    if (!soundID) return;

    await fetch(`${murrayURL}/crewBoard/pushSound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theEvent: 'playaudio',
        theTarget: soundID,
        theValue: '',
        uid: 'teaxc64in',
      }),
    });
  };

  const handleMurraySpeaks = async () => {
    if (!murrayText.trim()) return;

    console.log('Murray speaks:', murrayText);
    const murrayURL = process.env.NEXT_PUBLIC_MURRAY_SERVER;

    try {
      const response = await fetch(`${murrayURL}/murray-talks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: murrayText,
        }),
      });

      if (response.ok) {
        console.log('Murray message sent successfully');
        setMurrayText(''); // Clear the input after successful send
      } else {
        console.error('Failed to send Murray message');
      }
    } catch (error) {
      console.error('Error sending Murray message:', error);
    }
  };

  return (
    <AuthGuard>
      <div className={styles.page}>
        <h2>Chenzo Sound Remote</h2>
        <button onClick={doThing} value='stop'>
          stop
        </button>
        <section className={styles.soundCats}>
          {soundsArray.map((category) => (
            <article key={category.name} className={styles.soundCategory}>
              <h2>{category.name}</h2>
              <ul>
                {category.sounds.map((sound) => (
                  <li key={sound.id}>
                    <button onClick={doThing} value={sound.id}>
                      {sound.name}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className={styles.murraySpeaks}>
          <h2>Murray Speaks</h2>
          <div className={styles.murrayInput}>
            <textarea
              value={murrayText}
              onChange={(e) => setMurrayText(e.target.value)}
              placeholder='Enter text for Murray to speak...'
              rows={3}
            />
            <button onClick={handleMurraySpeaks} className={styles.murraySubmit}>
              Send
            </button>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
