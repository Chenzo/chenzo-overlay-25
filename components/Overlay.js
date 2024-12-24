'use client';

import { useEffect, useState } from 'react';
import styles from './Overlay.module.scss';
import Header from './Header';
import AudioObject from './AudioObject';
import Footer from './Footer';
import Sunks from './Sunks';
import DiscordImage from './DiscordImage';

export default function Overlay({}) {
  const [alignment, setAlignment] = useState(50);
  const [currentAudio, setCurrentAudio] = useState('');
  const [sunkShipArray, setSunkShipArray] = useState([]);
  const [pushedImage, setPushedImage] = useState(null);

  //const [status, setStatus] = useState('Checking...');

  const [isLive, setIsLive] = useState(false);

  const listenToServer = () => {
    const eventSource = new EventSource('http://localhost:3000/overlay-events');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const uid = data?.uid;

      if (uid == 'teaxc64in') {
        if (data?.theEvent == 'setAlignment') {
          setAlignment(parseInt(data.theTarget));
        } else if (data?.theEvent == 'playaudio') {
          console.log(`play audio: ${data.theTarget}`);
          setCurrentAudio(data.theTarget);
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

  useEffect(() => {
    listenToServer();
    checkStreamStatus();
  }, []);

  return (
    <section className={styles.overlay}>
      <Header alignment={alignment} />
      <AudioObject currentAudio={currentAudio} setCurrentAudio={setCurrentAudio} />
      <Sunks sunkShipArray={sunkShipArray} />
      <DiscordImage pushedImage={pushedImage} setPushedImage={setPushedImage} setCurrentAudio={setCurrentAudio} />
      <Footer />
      {!isLive && (
        <div className={styles.twitchStatus}>
          <img src='/images/disconnect-plug-icon.png' alt='' />
        </div>
      )}
    </section>
  );
}
