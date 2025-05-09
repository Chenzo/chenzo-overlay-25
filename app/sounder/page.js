'use client';

import styles from './page.module.scss';

export default function SoundBoard() {
  const soundsArray = [
    {
      name: 'New',
      sounds: [
        { id: 'dora', name: "Dora's Sandwich" },
        { id: 'rocklobster', name: 'Rock Lobster' },
        { id: 'wood', name: 'Norwegian' },
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

  return (
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
    </div>
  );
}
