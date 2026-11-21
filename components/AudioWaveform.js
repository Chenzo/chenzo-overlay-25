'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AudioWaveform.module.scss';

const BAR_WIDTH = 3;
const BAR_GAP = 2;
// Bars are full white at the center, ease to BAR_ALPHA by CENTER_FADE_END, then fade out to
// transparent from EDGE_FADE_START to the edge. Positions are 0 (center) to 1 (edge) per side.
const BAR_ALPHA = 0.4;
const CENTER_FADE_END = 0.1;
const EDGE_FADE_START = 0.8;
// White glow around the center bars, full at the center and gone by CENTER_FADE_END.
const GLOW_BLUR = 12;
// 1px line drawn down the middle of the newest (center) bar, matching its height.
const CENTER_LINE_COLOR = '#00ff00';
// Mic RMS for normal speech sits well under 1, so it's scaled up before drawing.
const LEVEL_GAIN = 4;

// Mirrored, scrolling mic-level waveform. The mic only runs while `active` and a device has been
// picked (click the bar to choose one). The chosen device is kept while toggled off.
export default function AudioWaveform({ active }) {
  const canvasRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active || !selectedDeviceId) return;

    let cancelled = false;
    let stream = null;
    let audioContext = null;
    let rafId;

    const start = async () => {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedDeviceId } },
          video: false,
        });

        if (cancelled) {
          micStream.getTracks().forEach((track) => track.stop());
          return;
        }

        stream = micStream;
        audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        audioContext.createMediaStreamSource(stream).connect(analyser);

        const samples = new Float32Array(analyser.fftSize);
        const levels = [];

        const tick = () => {
          const canvas = canvasRef.current;

          if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            const width = Math.round(canvas.clientWidth * dpr);
            const height = Math.round(canvas.clientHeight * dpr);
            if (canvas.width !== width) canvas.width = width;
            if (canvas.height !== height) canvas.height = height;

            analyser.getFloatTimeDomainData(samples);
            let sum = 0;
            for (let i = 0; i < samples.length; i++) {
              sum += samples[i] * samples[i];
            }
            const level = Math.min(1, Math.sqrt(sum / samples.length) * LEVEL_GAIN);

            const step = (BAR_WIDTH + BAR_GAP) * dpr;
            const barCount = Math.floor(width / 2 / step);
            levels.push(level);
            while (levels.length > barCount) levels.shift();

            const context = canvas.getContext('2d');
            context.clearRect(0, 0, width, height);

            // Newest level is drawn at the center; older ones scroll out to both edges.
            const centerX = (width - BAR_WIDTH * dpr) / 2;
            levels.forEach((value, index) => {
              const age = levels.length - 1 - index;
              const position = age / barCount;
              let alpha = BAR_ALPHA;
              let glow = 0;
              if (position < CENTER_FADE_END) {
                glow = 1 - position / CENTER_FADE_END;
                alpha = BAR_ALPHA + (1 - BAR_ALPHA) * glow;
              } else if (position > EDGE_FADE_START) {
                alpha = BAR_ALPHA * (1 - (position - EDGE_FADE_START) / (1 - EDGE_FADE_START));
              }
              const barWidth = BAR_WIDTH * dpr;
              const barHeight = Math.max(dpr, value * height);
              const y = (height - barHeight) / 2;
              const xs = age > 0 ? [centerX + age * step, centerX - age * step] : [centerX];

              // 1px black drop shadow offset down-right. Only the right and bottom strips that the
              // bar won't cover are drawn, so the see-through bars don't turn gray over it.
              context.shadowBlur = 0;
              context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
              xs.forEach((x) => {
                context.fillRect(x + barWidth, y + dpr, dpr, barHeight);
                context.fillRect(x + dpr, y + barHeight, barWidth, dpr);
              });

              context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
              context.shadowColor = `rgba(255, 255, 255, ${glow})`;
              context.shadowBlur = glow > 0 ? GLOW_BLUR * dpr : 0;
              xs.forEach((x) => {
                context.fillRect(x, y, barWidth, barHeight);
              });
            });

            const lineWidth = Math.max(1, Math.round(dpr));
            const lineHeight = Math.max(dpr, level * height);
            context.shadowBlur = 0;
            context.fillStyle = CENTER_LINE_COLOR;
            context.fillRect(Math.round((width - lineWidth) / 2), (height - lineHeight) / 2, lineWidth, lineHeight);
          }

          rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
      } catch (err) {
        console.error('Unable to access microphone', err);
        setError('Unable to access microphone. Check permissions.');
      }
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (audioContext) audioContext.close();
    };
  }, [active, selectedDeviceId]);

  const handleListDevices = async () => {
    setError('');

    try {
      let mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const hasLabels = mediaDevices.some((d) => d.kind === 'audioinput' && d.label);

      if (!hasLabels) {
        // Device labels stay hidden until mic permission is granted once, so unlock them first.
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        tempStream.getTracks().forEach((track) => track.stop());
        mediaDevices = await navigator.mediaDevices.enumerateDevices();
      }

      setDevices(
        mediaDevices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => ({
            id: d.deviceId,
            label: d.label || d.kind,
          }))
      );
      setShowDeviceList(true);
    } catch (err) {
      console.error('Unable to list microphones', err);
      setError('Unable to list microphones. Check permissions.');
    }
  };

  const handleSelectDevice = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setShowDeviceList(false);
  };

  return (
    <div className={`${styles.waveform} ${active ? '' : styles.hidden}`}>
      {error && <span className={styles.error}>{error}</span>}
      {showDeviceList && devices.length > 0 && (
        <ul className={styles.deviceList}>
          {devices.map((device) => (
            <li
              key={device.id}
              className={device.id === selectedDeviceId ? styles.selectedDevice : ''}
              onClick={() => handleSelectDevice(device.id)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' ? handleSelectDevice(device.id) : null)}
            >
              {device.label}
            </li>
          ))}
        </ul>
      )}
      <img src='/CHENZO-transparent.png' alt='' className={styles.backdrop} />
      {!selectedDeviceId && <span className={styles.hint}>Click to choose a mic</span>}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onClick={handleListDevices}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' ? handleListDevices() : null)}
      />
    </div>
  );
}
