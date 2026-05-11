import { clsx } from 'clsx';
import { useBlinkDetection } from '@/hooks/useBlinkDetection';
import { useFeatureStore } from '@/store/useFeatureStore';
import Tooltip from '@/components/common/Tooltip';

interface BlinkCounterProps {
  className?: string;
  compact?: boolean;
}

export default function BlinkCounter({ className, compact = false }: BlinkCounterProps) {
  const { blinkCount, blinkRatePpm } = useBlinkDetection();
  const current = useFeatureStore((s) => s.current);

  const rateCategory = current?.blink.rateCategory ?? null;
  const isBlinking = current?.blink.isBlinking ?? false;

  const RATE_CONFIG = {
    very_slow: { label: 'Rất chậm', color: 'text-red-400',    bg: 'bg-red-950/40 border-red-800/40' },
    slow:      { label: 'Chậm',     color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/40' },
    normal:    { label: 'Bình thường', color: 'text-green-400', bg: 'bg-green-950/40 border-green-800/40' },
    fast:      { label: 'Nhanh',    color: 'text-blue-400',   bg: 'bg-blue-950/40 border-blue-800/40' },
    very_fast: { label: 'Rất nhanh', color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/40' },
  };

  const rateCfg = rateCategory ? RATE_CONFIG[rateCategory] : RATE_CONFIG.normal;

  if (compact) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <span className={clsx('w-2 h-2 rounded-full', isBlinking ? 'bg-blue-400 animate-ping' : 'bg-gray-600')} />
        <span className="text-xs text-gray-400">Nháy mắt</span>
        <span className="text-sm font-mono font-bold text-blue-400">{blinkCount}</span>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Tooltip content="Số lần nháy mắt được phát hiện trong phiên hiện tại">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-help">
            Nháy Mắt 👁️
          </span>
        </Tooltip>
        {isBlinking && (
          <span className="text-[10px] text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-full animate-pulse">
            Đang nháy
          </span>
        )}
      </div>

      {/* Số đếm chính */}
      <div className="flex items-end gap-3">
        <span className="text-4xl font-mono font-bold text-blue-400">
          {blinkCount}
        </span>
        <span className="text-sm text-gray-500 mb-1">lần</span>
      </div>

      {/* Tần suất */}
      <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg border', rateCfg.bg)}>
        <div className="flex-1">
          <p className="text-[10px] text-gray-500">Tần suất</p>
          <p className={clsx('text-sm font-semibold', rateCfg.color)}>
            {blinkRatePpm.toFixed(1)} lần/phút
          </p>
        </div>
        <span className={clsx('text-xs font-medium', rateCfg.color)}>
          {rateCfg.label}
        </span>
      </div>

      {/* Trạng thái mắt */}
      {current && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-gray-500 mb-0.5">Mắt trái</p>
            <p className="text-xs font-medium text-gray-300 capitalize">
              {current.blink.leftEyeState.replace('_', ' ')}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-gray-500 mb-0.5">Mắt phải</p>
            <p className="text-xs font-medium text-gray-300 capitalize">
              {current.blink.rightEyeState.replace('_', ' ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
