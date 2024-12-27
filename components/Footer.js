'use client';

import { useEffect, useState } from 'react';
import ChatRelay from './ChatRelay';
import styles from './Footer.module.scss';

export default function Footer({ loggedIn }) {
  const [followers, setFollowers] = useState([]);
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('twitchAccessToken');

    const fetchFollowers = async () => {
      try {
        const response = await fetch(
          'https://api.twitch.tv/helix/channels/followers?broadcaster_id=58652316&first=10',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch followers');
        }

        const data = await response.json();
        console.log('found followers');
        console.log(data);
        setFollowers(data.data || []);
      } catch (error) {
        console.error(error);
        alert('Error fetching followers');
      }
    };

    if (loggedIn && accessToken) {
      console.log('fetchFollowers');
      fetchFollowers();
    }
  }, [loggedIn]);

  return (
    <footer className={styles.chenzo_footer}>
      <ul className={`${styles.followers} ${isChatting ? styles.hide : ''}`}>
        <li>Recent Follows... </li>
        {followers.map((follower, idx) => {
          if (idx > 4) return;
          return <li key={`flr_${idx}`}>{follower.user_name}</li>;
        })}
      </ul>
      <ChatRelay setIsChatting={setIsChatting} />
    </footer>
  );
}
