'use client';

import { useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// Fraction of the way each tracked value moves toward its latest target per detection frame.
// Lower is smoother but laggier.
const SMOOTHING = 0.5;

export const NEUTRAL_TRACKING = {
  yaw: 0,
  pitch: 0,
  roll: 0,
  x: 0,
  y: 0,
  jawOpen: 0,
  blinkLeft: 0,
  blinkRight: 0,
  browUp: 0,
};

const toDegrees = (radians) => (radians * 180) / Math.PI;

// The facial transformation matrix is column-major. Angles are extracted as XYZ Euler
// (same convention as three.js Matrix4 -> Euler).
const readHeadPose = (data) => {
  const m11 = data[0];
  const m12 = data[4];
  const m13 = Math.min(Math.max(data[8], -1), 1);
  const m23 = data[9];
  const m33 = data[10];

  return {
    pitch: toDegrees(Math.atan2(-m23, m33)),
    yaw: toDegrees(Math.asin(m13)),
    roll: toDegrees(Math.atan2(-m12, m11)),
    x: data[12],
    y: data[13],
  };
};

const readBlendshapes = (categories) => {
  const scores = {};
  categories.forEach((category) => {
    scores[category.categoryName] = category.score;
  });

  return {
    jawOpen: scores.jawOpen || 0,
    blinkLeft: scores.eyeBlinkLeft || 0,
    blinkRight: scores.eyeBlinkRight || 0,
    browUp: scores.browInnerUp || 0,
  };
};

// Runs MediaPipe Face Landmarker against the given <video> and returns a ref holding smoothed
// head pose (degrees / model units) and expression (0-1) values. When no face is found the
// values ease back to NEUTRAL_TRACKING. Values live in a ref, not state, so consumers can read
// them in their own animation loop without re-rendering React every frame.
export default function useFaceTracking(videoRef, enabled) {
  const trackingRef = useRef({ ...NEUTRAL_TRACKING });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let landmarker = null;
    let rafId;
    let lastVideoTime = -1;

    const detect = () => {
      const video = videoRef.current;

      if (video && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        let target = NEUTRAL_TRACKING;
        const faceFound = Boolean(result.facialTransformationMatrixes?.length && result.faceBlendshapes?.length);

        if (faceFound) {
          target = {
            ...readHeadPose(result.facialTransformationMatrixes[0].data),
            ...readBlendshapes(result.faceBlendshapes[0].categories),
          };
        }

        const current = trackingRef.current;
        current.faceFound = faceFound;
        Object.keys(NEUTRAL_TRACKING).forEach((key) => {
          current[key] += (target[key] - current[key]) * SMOOTHING;
        });
      }

      rafId = requestAnimationFrame(detect);
    };

    const start = async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
        const created = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });

        if (cancelled) {
          created.close();
          return;
        }

        landmarker = created;
        rafId = requestAnimationFrame(detect);
      } catch (err) {
        console.error('Unable to start face tracking', err);
      }
    };

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (landmarker) landmarker.close();
    };
  }, [enabled, videoRef]);

  return trackingRef;
}
