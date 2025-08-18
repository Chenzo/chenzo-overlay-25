/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';

import styles from './Overlay.module.scss';
import Header from './Header';
import AudioObject from './AudioObject';
import Footer from './Footer';
import Sunks from './Sunks';
import DiscordImage from './DiscordImage';
import LoginButton from './LoginButton';
import LogOutButton from './LogOutButton';
import FloatingAlert from './FloatingAlert';
import AncientCoin from './AncientCoin';
import TestCoinButton from './TestCoinButton';
import RewardCreator from './RewardCreator';
import EventSubHandler from './EventSubHandler';

export default function Overlay({}) {
  const murrayURL = process.env.NEXT_PUBLIC_MURRAY_SERVER;
  const [alignment, setAlignment] = useState(50);
  const [currentAudio, setCurrentAudio] = useState('');
  const [sunkShipArray, setSunkShipArray] = useState([]);
  const [pushedImage, setPushedImage] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [overlayToggle, setOverlayToggle] = useState('');
  const [streamDescription, setStreamDescription] = useState(
    `The crew of the Holy Bartender has set sail again on The Sea of Thieves! There's a stream! Come watch along https://www.twitch.tv/chenzorama`
  );

  const isDevelopment = false; // = process.env.NODE_ENV === 'development';
  console.log('isDevelopment:', isDevelopment);

  //const [status, setStatus] = useState('Checking...');

  const [isLive, setIsLive] = useState(false);
  const [showCoin, setShowCoin] = useState(false);

  /* const listenToSoundBoard = () => {
    console.log('Listening to sound board events...');
    const eventSource = new EventSource('/api/serverEvents');

    eventSource.onmessage = (event) => {
      console.log('New event:', event.data);
      // Handle the event (update UI, play sound, etc.)
      console.log(`play audio: ${data.theTarget}`);
      setCurrentAudio(data.theTarget);
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
    };

    return eventSource;
  }; */

  const listenToServer = () => {
    console.log('Listening to server...');
    console.log(`${murrayURL}/overlay-events`);
    const eventSource = new EventSource(`${murrayURL}/overlay-events`);

    eventSource.onmessage = (event) => {
      console.log('event received');
      const data = JSON.parse(event.data);
      const uid = data?.uid;

      console.log(data);

      if (uid == 'teaxc64in') {
        if (data?.theEvent == 'setAlignment') {
          setAlignment(parseInt(data.theTarget));
        } else if (data?.theEvent == 'playaudio') {
          console.log(`play audio: ${data.theTarget}`);
          setCurrentAudio(data.theTarget);
        } else if (data?.theEvent == 'overlayToggle') {
          console.log(`doPopup: ${data.theTarget}`);
          setOverlayToggle(data.theTarget);
        } else if (
          data?.theEvent == 'shipsunk' ||
          data?.theEvent == 'shipresunk' ||
          data?.theEvent == 'shipsunk-flag' ||
          data?.theEvent == 'shipresunk-flag' ||
          data?.theEvent == 'factionshipsunk' ||
          data?.theEvent == 'factionshipsunk-flag'
        ) {
          let daShip = data?.theTarget.split('-')[0];
          setSunkShipArray((sunkShipArray) => [...sunkShipArray, daShip]);
        } else if (
          (data?.theEvent == 'didEvent' && data?.theTarget == 'bbsunk') ||
          (data?.theEvent == 'didEvent' && data?.theTarget == 'bbpsunk')
        ) {
          console.log('burning blade');
          setSunkShipArray((sunkShipArray) => [...sunkShipArray, 'bblade']);
        } else if (data?.theEvent == 'imagePush') {
          console.log('imagePush!!!');
          console.log(data);
          setPushedImage(data.theValue);
        }
      }
    };

    eventSource.onerror = () => {
      console.error('Connection lost. Reconnecting...');
    };
  };

  const checkStreamStatus = async () => {
    console.log('Checking Twitch status...');

    try {
      //const response = await fetch('/api/checkTwitch?username=your-twitch-username');
      const response = await fetch('/api/checkTwitch');
      const data = await response.json();

      if (data.isLive) {
        //setStatus(`🎥 ${data.streamData.user_name} is LIVE!`);
        setIsLive(true);
        streamHasStarted(data.streamData);
      } else {
        //setStatus('🔴 Currently offline.');
        setIsLive(false);
        setTimeout(() => {
          checkStreamStatus();
        }, 60000);
      }
    } catch (error) {
      console.error('Error fetching Twitch status:', error);
      setStatus('❌ Error checking status.');
    }
  };

  const fakePostToAnounce = () => {
    const streamData = {
      id: '52780894349',
      user_id: '58652316',
      user_login: 'chenzorama',
      user_name: 'Chenzorama',
      game_id: '490377',
      game_name: 'Sea of Thieves',
      type: 'live',
      title: 'TESTING: Testing new stream overlay and stream start detection.',
      viewer_count: 0,
      started_at: '2024-12-26T18:06:57Z',
      language: 'en',
      thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_chenzorama-{width}x{height}.jpg',
      tag_ids: [],
      tags: ['seaofthieves', 'jabroni', 'SoTOrb', 'English'],
      is_mature: false,
    };
    postToAnounce(streamData.title, streamData.game_name, streamData.thumbnail_url);
  };

  const postToAnounce = async (title, game_name, thumbnail_url) => {
    console.log('Posting to Discord...');

    const width = 1920;
    const height = 1080;

    //let streamDescription = `The crew of the Holy Bartender has set sail again in ${game_name}! There's a stream! Come watch along https://www.twitch.tv/chenzorama`;

    const cleaned_thumbnail_url = thumbnail_url.replace('{width}', width).replace('{height}', height);

    const randomNumber = Math.floor(Math.random() * 1000000);

    const data = {
      title: title,
      game_name: game_name,
      thumbnail_url: `${cleaned_thumbnail_url}?rn=${randomNumber}`,
      streamDescription: streamDescription,
    };

    const response = await fetch('/api/postToDiscord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Successfully posted:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };

  const streamHasStarted = (streamData) => {
    console.log('Stream has started:');
    console.log(streamData);
    /*
      {
      "id": "52780894349",
      "user_id": "58652316",
      "user_login": "chenzorama",
      "user_name": "Chenzorama",
      "game_id": "490377",
      "game_name": "Sea of Thieves",
      "type": "live",
      "title": "TESTING: Testing new stream overlay and stream start detection.",
      "viewer_count": 0,
      "started_at": "2024-12-26T18:06:57Z",
      "language": "en",
      "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_chenzorama-{width}x{height}.jpg",
      "tag_ids": [],
      "tags": [
          "seaofthieves",
          "jabroni",
          "SoTOrb",
          "English"
      ],
      "is_mature": false
  }*/
    postToAnounce(streamData.title, streamData.game_name, streamData.thumbnail_url);
  };

  const openMenu = () => {
    console.log('Opening menu...');
    setMenuOpen(true);
  };

  const closeMenu = () => {
    console.log('Closing menu...');
    setMenuOpen(false);
  };

  const handleCoinRewardRedeemed = () => {
    console.log('Ancient coin reward redeemed!');
    setShowCoin(true);
  };

  const handleCoinHidden = () => {
    setShowCoin(false);
  };

  useEffect(() => {
    if (!isDevelopment) {
      listenToServer();
      checkStreamStatus();
    }

    const accessToken = localStorage.getItem('twitchAccessToken');
    console.log('accessToken from storage', accessToken);

    if (accessToken) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }

    //const soundEvents = listenToSoundBoard();

    return () => {
      console.log('Cleaning up event listeners...');
      soundEvents.close();
    };
  }, []);

  return (
    <section className={styles.overlay}>
      <Header alignment={alignment} />

      <AudioObject currentAudio={currentAudio} setCurrentAudio={setCurrentAudio} />
      <Sunks sunkShipArray={sunkShipArray} />
      <DiscordImage pushedImage={pushedImage} setPushedImage={setPushedImage} setCurrentAudio={setCurrentAudio} />
      <FloatingAlert overlayToggle={overlayToggle} setOverlayToggle={setOverlayToggle} />
      <Footer loggedIn={loggedIn} onCoinRewardRedeemed={handleCoinRewardRedeemed} />
      <AncientCoin showCoin={showCoin} onCoinHidden={handleCoinHidden} />
      <TestCoinButton onTestCoin={handleCoinRewardRedeemed} />
      <RewardCreator />
      <EventSubHandler onCoinRewardRedeemed={handleCoinRewardRedeemed} setCurrentAudio={setCurrentAudio} />
      {!isLive && (
        <div className={styles.twitchStatus}>
          <img src='/images/disconnect-plug-icon.png' alt='' />
        </div>
      )}

      {menuOpen && (
        <div className={styles.menuWindow}>
          <div className={styles.menuContent}>
            <button className={styles.closeMenu} onClick={closeMenu} />
            {loggedIn && <LogOutButton setLoggedIn={setLoggedIn} />}
            {!loggedIn && <LoginButton />}
            <hr />
            <div className={styles.testButton}>
              <button onClick={fakePostToAnounce}>TEST POST TO DISCORD</button>
            </div>

            <div className={styles.inputSpace}>
              <textarea
                placeholder='Enter a message to post to Discord...'
                value={streamDescription}
                maxLength='175'
                onChange={(e) => setStreamDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      <div className={styles.belowSpace}>
        <button onClick={openMenu}>Open Menu</button>
      </div>
    </section>
  );
}
