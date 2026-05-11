import { useRef, useState, useCallback } from 'react';

interface WebcamState {
  isActive:     boolean;
  isLoading:    boolean;
  error:        string | null;
  deviceId:     string | null;
}

interface UseWebcamReturn extends WebcamState {
  videoRef:     React.RefObject<HTMLVideoElement>;
  startWebcam:  (deviceId?: string) => Promise<void>;
  stopWebcam:   () => void;
  captureFrame: () => string | null;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [state, setState] = useState<WebcamState>({
    isActive:  false,
    isLoading: false,
    error:     null,
    deviceId:  null,
  });

  // ===== Bắt đầu webcam =====
  const startWebcam = useCallback(async (deviceId?: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: 1280, height: 720 }
          : { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState({
        isActive:  true,
        isLoading: false,
        error:     null,
        deviceId:  deviceId ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể truy cập webcam';
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, []);

  // ===== Dừng webcam =====
  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState({ isActive: false, isLoading: false, error: null, deviceId: null });
  }, []);

  // ===== Chụp frame dưới dạng base64 =====
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !state.isActive) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]; // base64 only
  }, [state.isActive]);

  return {
    ...state,
    videoRef,
    startWebcam,
    stopWebcam,
    captureFrame,
  };
}