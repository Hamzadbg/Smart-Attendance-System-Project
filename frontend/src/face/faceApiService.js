import * as faceapi from 'face-api.js';

let modelsLoaded = false;

const MODEL_URL = '/models';
const DETECTION_TIMEOUT_MS = 12000;

const DEFAULT_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
  scoreThreshold: 0.35
});

export const loadModels = async () => {
  if (modelsLoaded) return true;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    console.log('[face-api] Models loaded successfully');
    return true;
  } catch (err) {
    console.error('[face-api] Model load failed:', err);
    modelsLoaded = false;
    return false;
  }
};

export const getSingleFaceDescriptorFromVideo = async (videoEl) => {
  if (!videoEl) {
    console.error('[face-api] No video element provided');
    return null;
  }

  // 🔴 IMPORTANT FIX: ensure models are loaded
  const loaded = await loadModels();
  if (!loaded) {
    throw new Error('Face models failed to load. Check /public/models.');
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('Face detection timed out. Please try again.')),
      DETECTION_TIMEOUT_MS
    )
  );

  const detectPromise = (async () => {
    try {
      if (videoEl.readyState < 2) {
        await new Promise((resolve) => {
          videoEl.addEventListener('loadeddata', resolve, { once: true });
          setTimeout(resolve, 2000);
        });
      }

      const detections = await faceapi
        .detectSingleFace(videoEl, DEFAULT_OPTIONS)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        console.warn('[face-api] No face detected');
        return null;
      }

      const descriptor = Array.from(detections.descriptor);
      if (descriptor.length !== 128) {
        console.error('[face-api] Invalid descriptor length:', descriptor.length);
        return null;
      }

      return descriptor;
    } catch (e) {
      console.error('[face-api] Detection error:', e);
      return null;
    }
  })();

  return (await Promise.race([detectPromise, timeoutPromise])) ?? null;
};
