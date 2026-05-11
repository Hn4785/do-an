import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useFeatureStore } from '@/store/useFeatureStore';
import FaceLandmarkOverlay from './FaceLandmarkOverlay';

interface WebcamStreamProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  showLandmarks?: boolean;
  showBoundingBox?: boolean;
  className?: string;
}

export default function WebcamStream({
  videoRef,
  isActive,
  showLandmarks = true,
  showBoundingBox = true,
  className,
}: WebcamStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = useFeatureStore((s) => s.current);

  // Sync canvas size với video
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const syncSize = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    };

    video.addEventListener('loadedmetadata', syncSize);
    syncSize();
    return () => video.removeEventListener('loadedmetadata', syncSize);
  }, [videoRef]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative overflow-hidden rounded-xl bg-gray-950',
        'border border-gray-800',
        className
      )}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={clsx(
          'w-full h-full object-cover',
          'scale-x-[-1]', // Mirror effect
          !isActive && 'opacity-0'
        )}
      />

      {/* Canvas overlay */}
      {isActive && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
        />
      )}

      {/* Landmark overlay */}
      {isActive && showLandmarks && current && (
        <FaceLandmarkOverlay
          canvasRef={canvasRef}
          features={current}
          showBoundingBox={showBoundingBox}
        />
      )}

      {/* Placeholder khi chưa bật */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Camera chưa được bật</p>
        </div>
      )}
    </div>
  );
}
