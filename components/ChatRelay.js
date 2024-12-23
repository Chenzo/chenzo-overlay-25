'use client';
import tmi from 'tmi.js';
import { useEffect, useState } from 'react';
import styles from './ChatRelay.module.scss';

export default function ChatRelay({}) {
  const [latestChat, setLatestChat] = useState('');

  useEffect(() => {
    const client = new tmi.Client({
      channels: ['chenzorama'],
    });

    client.connect();

    client.on('message', (channel, tags, message, self) => {
      // "Alca: Hello, World!"
      console.log(`${tags['display-name']}: ${message}`);
      setLatestChat(`${tags['display-name']}: ${message}`);
      if (self) return;
    });
  }, []);

  return <section className={styles.chatSpace}>{latestChat}</section>;
}
