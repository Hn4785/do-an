import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface StressAlertProps {
  stressScore: number;
  threshold?: number;
  className?: string;
}

export default function StressAlert({
  stressScore,
  threshold = 70,
  className,
}: StressAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const [prevScore, setPrevScore] = useState(stressScore);

  const isHigh     = stressScore >= threshold;
  const isCritical = stressScore >= 85;

  // Reset dismiss khi stress giảm rồi tăng lại
  useEffect(() => {
    if (prevScore < threshold && stressScore >= threshold) {
      setDismissed(false);
    }
    setPrevScore(stressScore);
  }, [stressScore, threshold, prevScore]);

  if (!isHigh || dismissed) return null;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border',
        isCritical
          ? 'bg-red-950/70 border-red-600/60 animate-pulse'
          : 'bg-yellow-950/60 border-yellow-700/50',
        className
      )}
      role="alert"
    >
      <AlertTriangle
        size={18}
        className={clsx('shrink-0 mt-0.5', isCritical ? 'text-red-400' : 'text-yellow-400')}
      />
      <div className="flex-1">
        <p className={clsx(
          'text-sm font-semibold',
          isCritical ? 'text-red-300' : 'text-yellow-300'
        )}>
          {isCritical ? 'Căng thẳng nghiêm trọng!' : 'Mức độ căng thẳng cao'}
        </p>
        <p className={clsx(
          'text-xs mt-0.5',
          isCritical ? 'text-red-200' : 'text-yellow-200'
        )}>
          Chỉ số stress: <strong>{stressScore}%</strong>. Hãy thư giãn và hít thở sâu.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className={clsx(
          'text-xs px-2 py-1 rounded shrink-0',
          isCritical
            ? 'text-red-400 hover:bg-red-900/50'
            : 'text-yellow-400 hover:bg-yellow-900/50'
        )}
      >
        Bỏ qua
      </button>
    </div>
  );
}
