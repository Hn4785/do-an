import { clsx } from 'clsx';
import { useFeatureStore } from '@/store/useFeatureStore';
import { MAR_THRESHOLD_YAWN, MAR_THRESHOLD_OPEN } from '@/utils/constants';
import ProgressBar from '@/components/common/ProgressBar';
import Tooltip from '@/components/common/Tooltip';

interface MARDisplayProps {
  className?: string;
  compact?: boolean;
}

export default function MARDisplay({ className, compact = false }: MARDisplayProps) {
  const current = useFeatureStore((s) => s.current);

  const mar = current?.mouth.mar.value ?? null;
  const mouthState = current?.mouth.state ?? null;

  const STATE_LABELS: Record<string, string> = {
    closed:        'Đóng',
    slightly_open: 'Hé mở',
    open:          'Mở',
    wide_open:     'Há rộng',
  };

  const getColor = (v: number | null) => {
    if (v === null) return 'text-gray-500';
    if (v >= MAR_THRESHOLD_YAWN) return 'text-red-400';
    if (v >= MAR_THRESHOLD_OPEN) return 'text-yellow-400';
    return 'text-green-400';
  };

  const marPct = mar !== null ? Math.min((mar / 0.8) * 100, 100) : 0;
  const color = getColor(mar);

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <span className="text-xs text-gray-400">MAR</span>
        <span className={clsx('text-sm font-mono font-bold', color)}>
          {mar !== null ? mar.toFixed(3) : '--'}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Tooltip content="Mouth Aspect Ratio — Chỉ số đo độ mở của miệng. MAR > 0.6 = ngáp">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-help">
            MAR 👄
          </span>
        </Tooltip>
        <span className={clsx('text-xs font-medium', color)}>
          {mouthState ? STATE_LABELS[mouthState] ?? mouthState : 'N/A'}
        </span>
      </div>

      <div className="text-center">
        <span className={clsx('text-3xl font-mono font-bold', color)}>
          {mar !== null ? mar.toFixed(3) : '--'}
        </span>
      </div>

      <ProgressBar
        value={marPct}
        variant={mar !== null && mar >= MAR_THRESHOLD_YAWN ? 'danger' : 'default'}
        size="sm"
      />

      <div className="flex justify-between text-[10px] text-gray-600">
        <span>Hé: &gt;{MAR_THRESHOLD_OPEN}</span>
        <span>Ngáp: &gt;{MAR_THRESHOLD_YAWN}</span>
      </div>
    </div>
  );
}
