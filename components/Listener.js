'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Listener.module.scss';

const LOCAL_LISTENER_URL = 'ws://localhost:3011';
const TRIGGER_PAUSE_MS = 5000;

export default function Listener({ setCurrentAudio }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [triggerPhrase, setTriggerPhrase] = useState('');
  const isPausedRef = useRef(false);
  const pauseTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  const setPauseState = useCallback((nextPaused) => {
    isPausedRef.current = nextPaused;
    setIsPaused(nextPaused);
  }, []);

  const startTriggerPause = useCallback(() => {
    console.log(`[Listener] Entering trigger pause for ${TRIGGER_PAUSE_MS}ms`);
    setPauseState(true);

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = setTimeout(() => {
      console.log('[Listener] Trigger pause complete');
      pauseTimeoutRef.current = null;
      setPauseState(false);
      setTriggerPhrase('');
    }, TRIGGER_PAUSE_MS);
  }, [setPauseState]);

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      return;
    }

    console.log(`[Listener] Connecting to ${LOCAL_LISTENER_URL}`);

    const socket = new WebSocket(LOCAL_LISTENER_URL);
    let didOpen = false;

    socketRef.current = socket;
    setIsConnected(false);
    setHasConnectionError(false);

    socket.onopen = () => {
      if (socketRef.current !== socket) {
        return;
      }

      didOpen = true;
      setIsConnected(true);
      setHasConnectionError(false);
      console.log('[Listener] WebSocket connected');
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket) {
        return;
      }

      console.log('[Listener] Message received:', event.data);

      if (isPausedRef.current) {
        console.log('[Listener] Ignoring message during trigger pause');
        return;
      }

      try {
        const message = JSON.parse(event.data);

        if (message.type === 'trigger' && message.audio) {
          console.log(`[Listener] Trigger received: ${message.audio}`);
          setTriggerPhrase(message.phrase || '');
          setCurrentAudio(message.audio);
          startTriggerPause();
        }
      } catch (error) {
        console.error('[Listener] Failed to parse message:', error);
      }
    };

    socket.onerror = (event) => {
      if (socketRef.current !== socket) {
        return;
      }

      setIsConnected(false);
      setHasConnectionError(true);
      console.error('[Listener] WebSocket error:', event);
    };

    socket.onclose = (event) => {
      console.log('[Listener] WebSocket closed:', event.code, event.reason || 'no reason');

      if (socketRef.current === socket) {
        socketRef.current = null;
        setIsConnected(false);

        if (!didOpen || event.code !== 1000) {
          setHasConnectionError(true);
        }
      }
    };
  }, [setCurrentAudio, startTriggerPause]);

  const disconnectSocket = useCallback(() => {
    const socket = socketRef.current;

    if (!socket) {
      return;
    }

    console.log('[Listener] Disconnecting WebSocket');
    socketRef.current = null;
    setIsConnected(false);
    setHasConnectionError(false);
    socket.close();
  }, []);

  const handleMicClick = () => {
    if (hasConnectionError) {
      disconnectSocket();
      connectSocket();
      return;
    }

    if (socketRef.current) {
      disconnectSocket();
      return;
    }

    connectSocket();
  };

  useEffect(() => {
    connectSocket();

    return () => {
      console.log('[Listener] Closing WebSocket connection');

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }

      const socket = socketRef.current;
      socketRef.current = null;

      if (socket) {
        socket.close();
      }
    };
  }, [connectSocket]);

  let micStateClass = styles.micDisconnected;

  if (isConnected) {
    micStateClass = styles.micActive;
  }

  if (hasConnectionError) {
    micStateClass = styles.micError;
  }

  if (isPaused) {
    micStateClass = styles.micPaused;
  }

  return (
    <>
      <div className={styles.micBadge}>
        <button
          type='button'
          className={`${styles.micIcon} ${micStateClass}`}
          onClick={handleMicClick}
          aria-label={isConnected && !hasConnectionError ? 'Disconnect listener' : 'Reconnect listener'}
          aria-pressed={isConnected}
        >
          <svg className={styles.micGlyph} viewBox='0 0 24 24' aria-hidden='true'>
            <path d='M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z' />
            <path d='M19 11a7 7 0 0 1-14 0' />
            <path d='M12 18v3' />
            <path d='M8 21h8' />
          </svg>
        </button>
      </div>

      {triggerPhrase ? <div className={styles.triggerPhrase}>{triggerPhrase}</div> : null}
    </>
  );
}
