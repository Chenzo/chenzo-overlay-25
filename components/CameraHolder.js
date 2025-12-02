'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CameraHolder.module.scss';

const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL;

export default function CameraHolder({ afkType }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(true);
  const [videoSRC, setVideoSRC] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceError, setDeviceError] = useState('');
  const [isListingDevices, setIsListingDevices] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [showDeviceList, setShowDeviceList] = useState(false);

  useEffect(() => {
    console.log('afk source');
    console.log(afkType);

    if (afkType === 'afk') {
      console.log('AFK');
      setVideoSRC(`${BUCKET_URL}/video/hoggle_peeing-small.mp4`);
    } else if (afkType === 'whiskey') {
      setVideoSRC(`${BUCKET_URL}/video/whiskey_1.mp4`);
    } else if (afkType === 'family') {
      console.log('familysounded');
      setVideoSRC(`${BUCKET_URL}/video/family.mp4`);
    } else {
      setVideoSRC(null);
    }
  }, [afkType]);

  //const [afkType, setAfkType] = useState(''); // Possible values: '', 'afk', 'whiskey', 'family'

  useEffect(() => {
    startCamera();

    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (deviceId) => {
    setIsStarting(true);
    setError('');
    stopStream();

    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Unable to access camera', err);
      setError('Unable to access camera. Check permissions and that another app is not using it.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleListDevices = async () => {
    setDeviceError('');
    setShowDeviceList(true);
    setIsListingDevices(true);

    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error('Device enumeration not supported.');
      }

      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(
        mediaDevices
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({
            id: d.deviceId,
            label: d.label || d.kind,
            kind: d.kind,
          }))
      );
    } catch (err) {
      console.error('Unable to list devices', err);
      setDeviceError('Unable to list devices. Check permissions.');
      setDevices([]);
      setShowDeviceList(false);
    } finally {
      setIsListingDevices(false);
    }
  };

  const handleSelectDevice = (deviceId) => {
    setSelectedDeviceId(deviceId);
    startCamera(deviceId);
    setShowDeviceList(false);
  };

  return (
    <div className={styles.cameraHolder}>
      <div
        className={styles.frame}
        onClick={handleListDevices}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' ? handleListDevices() : null)}
      >
        {videoSRC && (
          <video autoPlay muted loop className={styles.video}>
            <source src={videoSRC} type='video/mp4' />
          </video>
        )}
        <video ref={videoRef} muted playsInline autoPlay className={`${videoSRC ? styles.hide : ''} ${styles.video}`} />
      </div>
      {isStarting && !error && <span className={styles.status}>Starting camera…</span>}
      {error && <span className={styles.error}>{error}</span>}
      {!error && (
        <div className={styles.deviceSection}>
          {isListingDevices && <span className={styles.status}>Listing devices…</span>}
          {deviceError && <span className={styles.error}>{deviceError}</span>}
          {devices.length > 0 && showDeviceList && (
            <ul className={styles.deviceList}>
              {devices.map((device) => (
                <li
                  key={`${device.kind}-${device.id}`}
                  className={device.id === selectedDeviceId ? styles.selectedDevice : ''}
                  onClick={() => handleSelectDevice(device.id)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' ? handleSelectDevice(device.id) : null)}
                >
                  <span className={styles.deviceKind}>{device.kind}</span>
                  <span className={styles.deviceLabel}>{device.label}</span>
                  <span className={styles.deviceId}>{device.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
