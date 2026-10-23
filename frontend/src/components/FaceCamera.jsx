import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { loadModels, getSingleFaceDescriptorFromVideo } from '../face/faceApiService';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user'
};

export const FaceCamera = ({ onDescriptor, onError, mode = 'enroll', compact }) => {
  const webcamRef = useRef(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setStatus('Loading face recognition models...');
        await loadModels();
        if (cancelled) return;
        setStatus('Models loaded. Position your face in the frame, then click Capture.');
        setLoadingModels(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Face models load error:', err);
        const msg = 'Failed to load face models. Ensure /public/models contains face-api.js model files.';
        setError(msg);
        setStatus('');
        setLoadingModels(false);
        onError?.(msg);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [onError]);

  const handleCapture = async () => {
    if (!webcamRef.current || loadingModels) return;
    setRunning(true);
    setError('');
    setStatus('Detecting face...');
    try {
      const video = webcamRef.current.video;
      if (!video) {
        setError('Camera not ready. Please allow camera access and try again.');
        setStatus('Camera not ready.');
        setRunning(false);
        return;
      }
      const descriptor = await getSingleFaceDescriptorFromVideo(video);
      if (!descriptor) {
        setStatus('No face detected. Ensure your face is clearly visible and well lit, then try again.');
        setError('No face detected.');
        setRunning(false);
        return;
      }
      setStatus('Face captured successfully.');
      setError('');
      onDescriptor(descriptor);
    } catch (err) {
      const msg = err?.message || 'Face detection failed.';
      console.error('Capture error:', err);
      setError(msg);
      setStatus(msg);
      onError?.(msg);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={compact ? 'face-camera face-camera--compact' : 'face-camera'}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="webcam"
        mirrored
      />
      <div className="camera-footer">
        <p className="status">
          <strong>{mode === 'enroll' ? 'Enrollment' : 'Give Attendance'}:</strong>{' '}
          {status}
        </p>
        {error && <p className="error">{error}</p>}
        <button
          type="button"
          className="btn-primary"
          onClick={handleCapture}
          disabled={loadingModels || running}
        >
          {loadingModels ? 'Loading models...' : running ? 'Processing...' : 'Capture Face'}
        </button>
      </div>
    </div>
  );
};
