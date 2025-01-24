/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import ChatRelay from './ChatRelay';
import styles from './Footer.module.scss';

export default function Footer({ loggedIn }) {
  const [followers, setFollowers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const broadcaster_id = process.env.NEXT_PUBLIC_TWITCH_USERID;
  const [showingSubs, setShowingSubs] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const accessToken = localStorage.getItem('twitchAccessToken');

    const fetchSubscribers = async () => {
      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcaster_id}&first=10`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch subscribers');
        }

        const data = await response.json();

        setSubs(data.data || []);
        return data.data;
      } catch (error) {
        console.error(error);
        alert('Error fetching subscribers');
      }
    };

    const fetchFollowers = async () => {
      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcaster_id}&first=10`,
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
        setFollowers(data.data || []);
      } catch (error) {
        console.error(error);
        alert('Error fetching followers');
      }
    };

    if (loggedIn && accessToken && !isDevelopment) {
      fetchFollowers();
      fetchSubscribers();
    }

    const interval = setInterval(() => {
      if (!isDevelopment) {
        setShowingSubs((prevShowingSubs) => !prevShowingSubs);
        fetchFollowers();
        fetchSubscribers();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loggedIn]);

  return (
    <footer className={styles.chenzo_footer}>
      <ul className={`${styles.followers} ${isChatting || showingSubs ? styles.hide : ''}`}>
        <li>Recent Follows... </li>
        {followers.map((follower, idx) => {
          if (idx > 4) return;
          return <li key={`flr_${idx}`}>{follower.user_name}</li>;
        })}
      </ul>

      <ul className={`${styles.subs} ${isChatting || !showingSubs ? styles.hide : ''}`}>
        <li>Recent Subs... </li>
        {subs.map((sub, idx) => {
          if (idx > 4 || sub.user_name == 'Chenzorama') return;
          return <li key={`sub_${idx}`}>{sub.user_name}</li>;
        })}
      </ul>
      <ChatRelay setIsChatting={setIsChatting} />
    </footer>
  );
}
