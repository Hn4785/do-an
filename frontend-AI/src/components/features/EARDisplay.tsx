import { clsx } from 'clsx';
import { useFeatureStore } from '@/store/useFeatureStore';
import { EAR_THRESHOLD_BLINK, EAR_THRESHOLD_FATIGUE } from '@/utils/constants';
import ProgressBar from '@/components/common/ProgressBar';
import Tooltip from '@/components/common/Tooltip';

interface EARDisplayProps {
  className?: string;
  compact?: boolean;
}

export default function EARDisplay({ className, compact = false }: EARDisplayProps) {
  const current = useFeatureStore((s) => s.current);

  const ear = current?.blink.ear.average ?? null;
  const earLeft = current?.blink.ear.left ?? null;
  const earRight = current?.blink.ear.right ?? null;

  const getStatus = (v: number | null) => {
    if (v === null) return { label: 'N/A', color: 'text-gray-500' };
    if (v < EAR_THRESHOLD_BLINK) return { label: 'Đang nháy', color: 'text-blue-400' };
    if (v < EAR_THRESHOLD_FATIGUE) return { label: 'Mệt mỏi', color: 'text-yellow-400' };
    return { label: 'Bình thường', color: 'text-green-400' };
  };

  const status = getStatus(ear);
  const earPct = ear !== null ? Math.min((ear / 0.4) * 100, 100) : 0;

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <span className="text-xs text-gray-400">EAR</span>
        <span className={clsx('text-sm font-mono font-bold', status.color)}>
          {ear !== null ? ear.toFixed(3) : '--'}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Tooltip content="Eye Aspect Ratio — Chỉ số đo độ mở của mắt. EAR < 0.21 = đang nháy mắt">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-help">
            EAR 👁️
          </span>
        </Tooltip>
        <span className={clsx('text-xs font-medium', status.color)}>
          {status.label}
        </span>
      </div>

      {/* Giá trị chính */}
      <div className="text-center">
        <span className={clsx('text-3xl font-mono font-bold', status.color)}>
          {ear !== null ? ear.toFixed(3) : '--'}
        </span>
      </div>

      {/* Progress bar */}
      <ProgressBar
        value={earPct}
        variant={ear !== null && ear < EAR_THRESHOLD_FATIGUE ? 'warning' : 'success'}
        size="sm"
        showValue={false}
      />

      {/* Mắt trái / phải */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-gray-800/50 rounded-lg px-2 py-1.5">
          <p className="text-[10px] text-gray-500 mb-0.5">Trái</p>
          <p className="text-sm font-mono text-gray-300">
            {earLeft !== null ? earLeft.toFixed(3) : '--'}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg px-2 py-1.5">
          <p className="text-[10px] text-gray-500 mb-0.5">Phải</p>
          <p className="text-sm font-mono text-gray-300">
            {earRight !== null ? earRight.toFixed(3) : '--'}
          </p>
        </div>
      </div>

      {/* Ngưỡng tham chiếu */}
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>Nháy: &lt;{EAR_THRESHOLD_BLINK}</span>
        <span>Mệt: &lt;{EAR_THRESHOLD_FATIGUE}</span>
      </div>
    </div>
  );
}
