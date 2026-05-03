'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Listener.module.scss';

const LOCAL_LISTENER_URL = 'ws://localhost:3011';
const TRIGGER_PAUSE_MS = 5000;

export default function Listener({ setCurrentAudio }) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const pulseTimeoutRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  useEffect(() => {
    console.log(`[Listener] Connecting to ${LOCAL_LISTENER_URL}`);

    const socket = new WebSocket(LOCAL_LISTENER_URL);

    const pulseMic = () => {
      setIsPulsing(true);

      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }

      pulseTimeoutRef.current = setTimeout(() => {
        pulseTimeoutRef.current = null;
        setIsPulsing(false);
      }, 180);
    };

    const setPauseState = (nextPaused) => {
      isPausedRef.current = nextPaused;
      setIsPaused(nextPaused);
    };

    const startTriggerPause = () => {
      console.log(`[Listener] Entering trigger pause for ${TRIGGER_PAUSE_MS}ms`);
      setPauseState(true);
      setIsPulsing(false);

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      pauseTimeoutRef.current = setTimeout(() => {
        console.log('[Listener] Trigger pause complete');
        pauseTimeoutRef.current = null;
        setPauseState(false);
      }, TRIGGER_PAUSE_MS);
    };

    socket.onopen = () => {
      console.log('[Listener] WebSocket connected');
    };

    socket.onmessage = (event) => {
      console.log('[Listener] Message received:', event.data);

      if (isPausedRef.current) {
        console.log('[Listener] Ignoring message during trigger pause');
        return;
      }

      pulseMic();

      try {
        const message = JSON.parse(event.data);

        if (message.type === 'trigger' && message.audio) {
          console.log(`[Listener] Trigger received: ${message.audio}`);
          setCurrentAudio(message.audio);
          startTriggerPause();
        }
      } catch (error) {
        console.error('[Listener] Failed to parse message:', error);
      }
    };

    socket.onerror = (event) => {
      console.error('[Listener] WebSocket error:', event);
    };

    socket.onclose = (event) => {
      console.log('[Listener] WebSocket closed:', event.code, event.reason || 'no reason');
    };

    return () => {
      console.log('[Listener] Closing WebSocket connection');

      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }

      socket.close();
    };
  }, [setCurrentAudio]);

  return (
    <div className={styles.micBadge}>
      <div
        className={`${styles.micIcon} ${isPulsing ? styles.micPulse : ''} ${isPaused ? styles.micPaused : styles.micActive}`}
      >
        <svg className={styles.micGlyph} viewBox='0 0 24 24' aria-hidden='true'>
          <path d='M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z' />
          <path d='M19 11a7 7 0 0 1-14 0' />
          <path d='M12 18v3' />
          <path d='M8 21h8' />
        </svg>
      </div>
    </div>
  );
}
