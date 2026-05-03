import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Listener.module.scss';

const DEFAULT_LEVELS = {
  rms: 0,
  peak: 0,
  db: -100,
};
const KEYWORD_AUDIO_TRIGGERS = [
  { phrase: 'rock', audio: 'rl_short' },
  { phrase: 'damn it', audio: 'janet' },
  { phrase: 'dammit', audio: 'janet' },
  { phrase: 'trap', audio: 'trap' },
  { phrase: 'dicks', audio: 'dicks' },
  { phrase: 'Marx Brothers', audio: 'mbrothers' },
  { phrase: 'Marks Brothers', audio: 'mbrothers' },
  { phrase: 'fire', audio: 'fire' },
  { phrase: 'blast them', audio: 'blastem' },
];
const POST_TRIGGER_PAUSE_MS = 5000;
const TRANSCRIPT_CLEAR_DELAY_MS = 2500;

export default function Listener({ setCurrentAudio }) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dataArrayRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const transcriptTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const restartRecognitionRef = useRef(false);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const lastLevelUpdateRef = useRef(0);
  const [devices, setDevices] = useState([]);
  const [deviceError, setDeviceError] = useState('');
  const [error, setError] = useState('');
  const [isListingDevices, setIsListingDevices] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [levels, setLevels] = useState(DEFAULT_LEVELS);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedDeviceLabel, setSelectedDeviceLabel] = useState('');
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speechMatch, setSpeechMatch] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechText, setSpeechText] = useState('Waiting for speech...');
  const [speechPaused, setSpeechPaused] = useState(false);
  const hasSelectedDevice = selectedDeviceLabel !== '';
  const isSpeechActive = speechEnabled && !speechPaused;
  const micScale = isSpeechActive ? 1 + Math.min(levels.rms / 700, 0.55) : 1;
  const micOpacity = isSpeechActive ? 0.55 + Math.min(levels.rms / 1000, 0.45) : 0.55;

  const scheduleTranscriptClear = useCallback(() => {
    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
    }

    transcriptTimeoutRef.current = setTimeout(() => {
      transcriptTimeoutRef.current = null;
      setSpeechText('');
      setSpeechMatch('');
    }, TRANSCRIPT_CLEAR_DELAY_MS);
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    restartRecognitionRef.current = false;

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    if (transcriptTimeoutRef.current) {
      clearTimeout(transcriptTimeoutRef.current);
      transcriptTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechEnabled(false);
      setSpeechSupported(false);
      setSpeechError('Speech recognition is not supported in this browser.');
      setSpeechText('Speech unavailable');
      return;
    }

    stopSpeechRecognition();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    restartRecognitionRef.current = true;

    recognition.onresult = (event) => {
      let transcript = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript = `${transcript} ${event.results[i][0].transcript}`.trim();
      }

      if (!transcript) {
        return;
      }

      const normalizedTranscript = transcript.toLowerCase();
      const matchedTrigger = KEYWORD_AUDIO_TRIGGERS.find((trigger) => normalizedTranscript.includes(trigger.phrase));

      setSpeechText(transcript);
      setSpeechMatch(matchedTrigger?.phrase || '');
      setSpeechError('');
      scheduleTranscriptClear();

      if (matchedTrigger) {
        stopSpeechRecognition();
        setCurrentAudio(matchedTrigger.audio);
        setSpeechPaused(true);
        setSpeechText('');
        setSpeechMatch('');

        pauseTimeoutRef.current = setTimeout(() => {
          pauseTimeoutRef.current = null;
          setSpeechPaused(false);
          if (speechEnabled) {
            startSpeechRecognition();
          }
        }, POST_TRIGGER_PAUSE_MS);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        return;
      }

      setSpeechError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      if (restartRecognitionRef.current) {
        recognition.start();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setSpeechSupported(true);
    setSpeechError('');
    setSpeechMatch('');
    setSpeechPaused(false);
    setSpeechText('');
  }, [scheduleTranscriptClear, setCurrentAudio, speechEnabled, stopSpeechRecognition]);

  const stopAudioGraph = useCallback(() => {
    stopSpeechRecognition();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch((closeError) => {
        console.error('Unable to close listener audio context', closeError);
      });
      audioContextRef.current = null;
    }

    dataArrayRef.current = null;
  }, [stopSpeechRecognition]);

  const updateLevels = useCallback((timestamp) => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!analyser || !dataArray) {
      return;
    }

    if (timestamp - lastLevelUpdateRef.current >= 100) {
      analyser.getByteTimeDomainData(dataArray);

      let peak = 0;
      let sumSquares = 0;

      for (let i = 0; i < dataArray.length; i += 1) {
        const normalized = (dataArray[i] - 128) / 128;
        const absolute = Math.abs(normalized);

        sumSquares += normalized * normalized;
        peak = Math.max(peak, absolute);
      }

      const rms = Math.sqrt(sumSquares / dataArray.length);
      const db = rms > 0 ? 20 * Math.log10(rms) : -100;

      setLevels({
        rms: Math.round(rms * 1000),
        peak: Math.round(peak * 1000),
        db: Math.max(-100, Math.round(db)),
      });

      lastLevelUpdateRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const startListening = async (deviceId, deviceLabel) => {
    setError('');
    setDeviceError('');
    setIsListening(false);
    stopAudioGraph();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio capture is not supported.');
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        throw new Error('Audio analysis is not supported.');
      }

      const audioConstraints = {
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: false,
      };

      if (deviceId) {
        audioConstraints.deviceId = { exact: deviceId };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false,
      });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.7;

      const dataArray = new Uint8Array(analyser.fftSize);

      source.connect(analyser);

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = dataArray;
      lastLevelUpdateRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(updateLevels);

      setSelectedDeviceId(deviceId);
      setSelectedDeviceLabel(deviceLabel);
      setIsListening(true);
      setLevels(DEFAULT_LEVELS);
      setShowDeviceList(false);
      setSpeechEnabled(true);
      startSpeechRecognition();
    } catch (startError) {
      console.error('Unable to start listener', startError);
      setError('Unable to listen to that source. Check permissions and that the source is available.');
      setLevels(DEFAULT_LEVELS);
      setIsListening(false);
      stopAudioGraph();
    }
  };

  const handleListDevices = async () => {
    setDeviceError('');
    setError('');
    setShowDeviceList(true);
    setIsListingDevices(true);

    let permissionStream = null;

    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error('Device enumeration is not supported.');
      }

      if (navigator.mediaDevices?.getUserMedia) {
        permissionStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = mediaDevices
        .filter((device) => device.kind === 'audioinput')
        .map((device, index) => ({
          id: device.deviceId,
          key: `${device.kind}-${device.deviceId || index}`,
          label: device.label || `Audio source ${index + 1}`,
          kind: device.kind,
        }));

      setDevices(audioDevices);

      if (audioDevices.length === 0) {
        setDeviceError('No audio sources found.');
      }
    } catch (listError) {
      console.error('Unable to list audio devices', listError);
      setDeviceError('Unable to list audio sources. Check permissions.');
      setDevices([]);
      setShowDeviceList(false);
    } finally {
      if (permissionStream) {
        permissionStream.getTracks().forEach((track) => track.stop());
      }

      setIsListingDevices(false);
    }
  };

  const handleSelectDevice = (device) => {
    startListening(device.id, device.label);
  };

  const handleToggleSpeech = () => {
    if (speechEnabled || speechPaused) {
      setSpeechEnabled(false);
      setSpeechPaused(false);
      setSpeechText('');
      setSpeechMatch('');
      stopSpeechRecognition();
      return;
    }

    setSpeechEnabled(true);
    startSpeechRecognition();
  };

  useEffect(() => {
    return () => {
      stopAudioGraph();
    };
  }, [stopAudioGraph]);

  return (
    <>
      {!hasSelectedDevice && (
        <aside className={styles.listener}>
          <button
            className={`${styles.panel} ${isListening ? styles.active : ''}`}
            onClick={handleListDevices}
            type='button'
          >
            <span className={styles.title}>Listener</span>
            <span className={styles.source}>Select audio source</span>
            <span className={styles.values}>
              <span>
                <strong>{levels.rms}</strong>
                <small>rms</small>
              </span>
              <span>
                <strong>{levels.peak}</strong>
                <small>peak</small>
              </span>
              <span>
                <strong>{levels.db}</strong>
                <small>db</small>
              </span>
            </span>
          </button>

          {(isListingDevices || deviceError || (devices.length > 0 && showDeviceList)) && (
            <div className={styles.deviceSection}>
              {isListingDevices && <span className={styles.status}>Listing audio sources...</span>}
              {deviceError && <span className={styles.error}>{deviceError}</span>}
              {devices.length > 0 && showDeviceList && (
                <ul className={styles.deviceList}>
                  {devices.map((device) => (
                    <li key={device.key}>
                      <button
                        className={device.id === selectedDeviceId ? styles.selectedDevice : ''}
                        onClick={() => handleSelectDevice(device)}
                        type='button'
                      >
                        <span className={styles.deviceKind}>{device.kind}</span>
                        <span className={styles.deviceLabel}>{device.label}</span>
                        <span className={styles.deviceId}>{device.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && <span className={styles.error}>{error}</span>}
        </aside>
      )}

      {hasSelectedDevice && (
        <>
          <button className={styles.micBadge} onClick={handleToggleSpeech} type='button'>
            <div
              className={`${styles.micIcon} ${isSpeechActive ? styles.micActive : ''} ${speechPaused ? styles.micPaused : ''}`}
              style={{
                opacity: micOpacity,
                transform: `scale(${micScale})`,
              }}
            >
              <svg className={styles.micGlyph} viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z' />
                <path d='M19 11a7 7 0 0 1-14 0' />
                <path d='M12 18v3' />
                <path d='M8 21h8' />
              </svg>
            </div>
          </button>

          <div className={styles.transcriptOverlay}>
            <span className={styles.transcriptText}>{speechText}</span>
          </div>

          {error && <span className={`${styles.error} ${styles.overlayMessage}`}>{error}</span>}
          {!error && speechError && <span className={`${styles.error} ${styles.overlayMessage}`}>{speechError}</span>}
          {!error && !speechError && !speechSupported && (
            <span className={`${styles.status} ${styles.overlayMessage}`}>Speech recognition is unavailable.</span>
          )}
        </>
      )}
    </>
  );
}
