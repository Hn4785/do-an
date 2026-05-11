import { clsx } from 'clsx';
import { useFeatureStore } from '@/store/useFeatureStore';

interface FaceDetectionStatusProps {
  className?: string;
  compact?: boolean;
}

export default function FaceDetectionStatus({
  className,
  compact = false,
}: FaceDetectionStatusProps) {
  const faceDetected = useFeatureStore((s) => s.faceDetected);
  const lastUpdated  = useFeatureStore((s) => s.lastUpdated);
  const current      = useFeatureStore((s) => s.current);

  const isStale = lastUpdated
    ? Date.now() - lastUpdated > 3000
    : true;

  const status = !lastUpdated
    ? 'idle'
    : isStale
    ? 'lost'
    : faceDetected
    ? 'detected'
    : 'searching';

  const config = {
    idle: {
      dot: 'bg-gray-500',
      text: 'Chưa bắt đầu',
      textColor: 'text-gray-400',
      bg: 'bg-gray-900/60 border-gray-700',
    },
    detected: {
      dot: 'bg-green-400 animate-pulse',
      text: 'Đang nhận diện',
      textColor: 'text-green-400',
      bg: 'bg-green-950/40 border-green-800/50',
    },
    searching: {
      dot: 'bg-yellow-400 animate-pulse',
      text: 'Đang tìm kiếm...',
      textColor: 'text-yellow-400',
      bg: 'bg-yellow-950/40 border-yellow-800/50',
    },
    lost: {
      dot: 'bg-red-400',
      text: 'Mất khuôn mặt',
      textColor: 'text-red-400',
      bg: 'bg-red-950/40 border-red-800/50',
    },
  }[status];

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <span className={clsx('w-2 h-2 rounded-full shrink-0', config.dot)} />
        <span className={clsx('text-xs font-medium', config.textColor)}>
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl border',
        config.bg,
        className
      )}
    >
      <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', config.dot)} />
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-semibold', config.textColor)}>
          {config.text}
        </p>
        {status === 'detected' && current?.boundingBox && (
          <p className="text-xs text-gray-500 mt-0.5">
            Confidence: {(current.boundingBox.confidence * 100).toFixed(0)}%
          </p>
        )}
      </div>
    </div>
  );
}
