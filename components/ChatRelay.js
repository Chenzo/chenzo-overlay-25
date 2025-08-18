'use client';
import tmi from 'tmi.js';
import { useEffect, useState } from 'react';
import styles from './ChatRelay.module.scss';

export default function ChatRelay({ setIsChatting, onClientReady }) {
  const [latestChat, setLatestChat] = useState(null);
  const [messageId, setMessageId] = useState(0); // Track unique message IDs

  const convertEmotes = (message, emotes) => {
    if (!emotes) return message;
    const replacements = Object.entries(emotes)
      .flatMap(([id, ranges]) => {
        return ranges.map((range) => {
          const [start, end] = range.split('-').map(Number);
          return { id, start, end };
        });
      })
      .sort((a, b) => b.start - a.start); // Sort in descending order to prevent index shifting

    let resultString = message;

    // Replace ranges with the corresponding emote ID
    replacements.forEach(({ id, start, end }) => {
      const imgTag = `<img src="https://static-cdn.jtvnw.net/emoticons/v1/${id}/2.0" />`;
      resultString = resultString.slice(0, start) + imgTag + resultString.slice(end + 1);
    });

    return resultString;
  };

  useEffect(() => {
    const client = new tmi.Client({
      //options: { debug: true },
      connection: {
        reconnect: true,
        secure: true,
      },
      channels: ['chenzorama'],
    });

    client.connect();

    client.on('connected', () => {
      console.log('✅ Connected to Twitch chat');
      if (onClientReady) {
        onClientReady(client);
      }
    });

    client.on('message', (channel, tags, message, self) => {
      //console.log(`${tags['display-name']}: ${message}`);
      const newMessage = convertEmotes(message, tags.emotes);
      const user = tags['display-name'];

      const messageParts = newMessage.split(/(?!<[^>]+)\s(?![^<]*>)/g);

      const prts = messageParts.map((part, idx) => {
        if (part === '') return null;
        return <span key={`pt-${idx}`} dangerouslySetInnerHTML={{ __html: part }} />;
      });

      const newC = (
        <div key={messageId} className={styles.messageContainer}>
          <span>{user}:</span>
          {prts}
        </div>
      );

      setLatestChat(newC);
      setIsChatting(true);
      const chatCount = setTimeout(() => {
        setIsChatting(false);
      }, 10000);
      setMessageId((prev) => prev + 1); // Increment message ID for each new message

      if (self) return;

      return () => clearTimeout(chatCount);
    });

    return () => client.disconnect(); // Cleanup on component unmount
  }, [messageId]);

  return <section className={styles.chatSpace}>{latestChat}</section>;
}
